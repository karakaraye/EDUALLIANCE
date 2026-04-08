import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
            date: new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            amount: exp.amount,
            status: exp.status,
            managerName: exp.manager?.name || 'Unknown',
            rawDate: exp.date,
            receiptUrl: exp.receiptUrl
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
        const { amount, category, description, date, managerId, receiptUrl } = body;

        const expense = await prisma.expense.create({
            data: {
                amount: Number(amount),
                category: String(category),
                description: String(description),
                date: new Date(date),
                managerId: String(managerId),
                receiptUrl: receiptUrl ? String(receiptUrl) : null,
                status: 'APPROVED'
            }
        });

        return NextResponse.json({ success: true, expenseId: expense.id });
    } catch (error) {
        console.error('POST /api/expenses error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, amount, category, description, date, status, receiptUrl } = body;

        const updated = await prisma.expense.update({
            where: { id },
            data: {
                amount: amount !== undefined ? Number(amount) : undefined,
                category: category || undefined,
                description: description || undefined,
                date: date ? new Date(date) : undefined,
                status: status || undefined,
                receiptUrl: receiptUrl !== undefined ? receiptUrl : undefined
            }
        });

        return NextResponse.json({ success: true, expense: updated });
    } catch (error) {
        console.error('PUT /api/expenses error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        await prisma.expense.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/expenses error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
