import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const expenses = await prisma.expense.findMany({
            include: { manager: true },
            orderBy: { date: 'desc' }
        });

        const formatted = expenses.map(exp => ({
            id: exp.id.substring(0, 8).toUpperCase(),
            rawId: exp.id,
            desc: exp.description,
            category: exp.category,
            date: new Date(exp.date).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' }),
            amount: exp.amount,
            status: exp.status,
            managerName: exp.manager?.name || 'Unknown',
            rawDate: exp.date
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('GET /api/expenses error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, category, description, date, managerId } = body;

        const expense = await prisma.expense.create({
            data: {
                amount: Number(amount),
                category: String(category),
                description: String(description),
                date: new Date(date),
                managerId: String(managerId),
                status: 'APPROVED'
            }
        });

        return NextResponse.json({ success: true, expenseId: expense.id });
    } catch (error) {
        console.error('POST /api/expenses error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
