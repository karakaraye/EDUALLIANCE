import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const periods = await prisma.payrollPeriod.findMany({
            include: {
                salaries: true
            },
            orderBy: {
                startDate: 'desc'
            }
        });

        const formattedRuns = periods.map(p => {
            const totalAmount = p.salaries.reduce((sum: any, s: any) => sum + s.netAmount, 0);
            return {
                id: p.id,
                date: new Date(p.endDate).toLocaleDateString('default', { month: 'short', year: 'numeric' }),
                employees: p.salaries.length,
                amount: totalAmount,
                status: p.salaries[0]?.status || 'Draft'
            };
        });

        return NextResponse.json(formattedRuns);
    } catch (error) {
        console.error('GET /api/payroll error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { employees, month } = body;

        let startOfMonth, endOfMonth;
        if (month) {
            const [year, m] = month.split('-');
            startOfMonth = new Date(parseInt(year), parseInt(m) - 1, 1);
            endOfMonth = new Date(parseInt(year), parseInt(m), 0);
        } else {
            const now = new Date();
            startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }

        // Prepare salary data
        const salaryData = employees.map((emp: any) => {
            const allowancesTotal = Object.values(emp.allowancesList || {}).reduce((a: any, b: any) => Number(a) + Number(b), 0);
            return {
                employeeId: String(emp.employeeId),
                basicSalary: Number(emp.baseSalary),
                allowances: Number(allowancesTotal),
                grossAmount: Number(emp.breakdown.gross),
                deductions: Number(emp.breakdown.totalDeductions),
                netAmount: Number(emp.breakdown.net),
                status: 'PENDING' // Keep as pending until explicitly approved
            };
        });

        // Use Prisma's nested write to ensure atomicity
        const period = await prisma.payrollPeriod.create({
            data: {
                startDate: startOfMonth,
                endDate: endOfMonth,
                salaries: {
                    create: salaryData
                }
            }
        });

        return NextResponse.json({ success: true, periodId: period.id });
    } catch (error) {
        console.error('POST /api/payroll error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
