import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const loans = await prisma.loan.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Map to exact frontend shape
        const formatted = loans.map(loan => ({
            id: loan.id,
            name: loan.name,
            image: loan.avatar || `https://i.pravatar.cc/150?u=${Math.random()}`,
            amount: loan.amount,
            rate: loan.interestRate,
            durationMonths: loan.durationMonths,
            amountLeft: loan.amountLeft,
            status: loan.status,
            repayments: typeof loan.repayments === 'object' && loan.repayments !== null ? loan.repayments : {},
            disburseDate: new Date(loan.disburseDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('GET /api/loans error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        const loan = await prisma.loan.create({
            data: {
                id: body.id,
                name: String(body.name),
                avatar: body.image,
                amount: Number(body.amount),
                interestRate: Number(body.rate),
                durationMonths: Number(body.durationMonths),
                amountLeft: Number(body.amountLeft),
                status: body.status || 'Active',
                disburseDate: new Date(body.disburseDate)
            }
        });

        return NextResponse.json({ success: true, loan });
    } catch (error) {
        console.error('POST /api/loans error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, status, amountLeft, name, durationMonths, interestRate, repayments, amount } = body;

        // Dynamic update object
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {};
        if (status !== undefined) updateData.status = status;
        if (amountLeft !== undefined) updateData.amountLeft = Number(amountLeft);
        if (name !== undefined) updateData.name = String(name);
        if (durationMonths !== undefined) updateData.durationMonths = Number(durationMonths);
        if (interestRate !== undefined) updateData.interestRate = Number(interestRate);
        if (repayments !== undefined) updateData.repayments = repayments;
        if (amount !== undefined) updateData.amount = Number(amount);

        const updatedLoan = await prisma.loan.update({
            where: { id: id },
            data: updateData
        });

        return NextResponse.json({ success: true, updatedLoan });
    } catch (error) {
        console.error('PUT /api/loans error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await prisma.loan.delete({
            where: { id: id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/loans error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
