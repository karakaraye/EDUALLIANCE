import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
    try {
        const body = await req.json();
        const { status } = body;

        // Extract params whether it's a promise or direct object in Next.js 15+
        const params = await context.params;
        const id = params.id;

        if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const expense = await prisma.expense.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json({ success: true, expenseId: expense.id });
    } catch (error) {
        console.error('PATCH /api/expenses/[id]/status error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
