import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: periodId } = await params;

        // Fetch the period with salaries
        const period = await prisma.payrollPeriod.findUnique({
            where: { id: periodId },
            include: { salaries: true }
        });

        if (!period) return NextResponse.json({ error: 'Payroll Period not found' }, { status: 404 });

        // Calculate total amount to log into Ledger
        const totalNet = period.salaries.reduce((sum, s) => sum + s.netAmount, 0);

        // Update all salaries to PAID
        await prisma.salary.updateMany({
            where: { periodId: period.id },
            data: { status: 'PAID' }
        });

        // Insert Expense into Ledger
        await prisma.ledger.create({
            data: {
                type: 'EXPENSE',
                referenceId: period.id,
                amount: totalNet,
                description: `Monthly Payroll - ${new Date(period.endDate).toLocaleDateString('default', { month: 'short', year: 'numeric' })}`
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Approve Payroll Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
