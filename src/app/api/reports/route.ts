import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // 1. Fetch Expenses
        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' }
        });
        const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

        // 2. Fetch Payroll
        const salaries = await prisma.salary.findMany({
            include: { period: true },
        });
        const totalPayroll = salaries.reduce((sum, s) => sum + Number(s.netAmount), 0);

        // 3. Fetch Investors
        const investors = await prisma.investor.findMany({
            orderBy: { dateInvested: 'desc' }
        });
        const totalInvestorsPrincipal = investors.reduce((sum, i) => sum + Number(i.amountInvested), 0);
        // Calculate total expected payout for investors
        const totalInvestorsPayout = investors.reduce((sum, inv) => {
            const amount = Number(inv.amountInvested);
            const rate = Number(inv.interestRate);
            return sum + amount + (12 * amount * (rate / 100));
        }, 0);

        // Format detailed ledger entries from Backend
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ledgerEntries: any[] = [];

        expenses.forEach(e => {
            ledgerEntries.push({
                id: `EXP-${e.id}`,
                type: 'Expense',
                description: e.description,
                category: e.category,
                amount: Number(e.amount),
                date: new Date(e.date).toISOString(),
                status: e.status
            });
        });

        salaries.forEach(s => {
            ledgerEntries.push({
                id: `PAY-${s.id}`,
                type: 'Payroll',
                description: `Salary for ${s.employeeId}`,
                category: 'Salaries & Wages',
                amount: Number(s.netAmount),
                date: new Date(s.period.endDate).toISOString(),
                status: s.status
            });
        });

        investors.forEach(i => {
            ledgerEntries.push({
                id: `INV-${i.id}`,
                type: 'Investment',
                description: `Capital from ${i.name}`,
                category: 'Equity / Funding',
                amount: Number(i.amountInvested),
                date: new Date(i.dateInvested).toISOString(),
                status: i.status
            });
        });

        return NextResponse.json({
            summary: {
                totalExpenses,
                totalPayroll,
                totalInvestorsPrincipal,
                totalInvestorsPayout
            },
            ledger: ledgerEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        });
    } catch (error) {
        console.error('GET /api/reports error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
