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

        // Fallback for Mock Data
        if (formatted.length === 0) {
            const mockLoans = [
                { id: 'LN/ED/1001', name: 'Grace Academy', image: 'https://i.pravatar.cc/150?u=1', amount: 1500000, rate: 4, durationMonths: 12, amountLeft: 1860000, status: 'Active', repayments: {}, disburseDate: 'Jan 15, 2026' },
                { id: 'LN/ED/1002', name: 'Bright Future School', image: 'https://i.pravatar.cc/150?u=2', amount: 850000, rate: 4, durationMonths: 6, amountLeft: 0, status: 'Paid Full', repayments: {}, disburseDate: 'Dec 02, 2025' },
                { id: 'LN/ED/1003', name: 'St. Marys Institute', image: 'https://i.pravatar.cc/150?u=3', amount: 2200000, rate: 4, durationMonths: 12, amountLeft: 2728000, status: 'Active', repayments: {}, disburseDate: 'Feb 10, 2026' },
                { id: 'LN/ED/1004', name: 'Lighthouse Prep', image: 'https://i.pravatar.cc/150?u=4', amount: 500000, rate: 4, durationMonths: 12, amountLeft: 620000, status: 'Active', repayments: {}, disburseDate: 'Mar 01, 2026' }
            ];
            return NextResponse.json(mockLoans);
        }

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('GET /api/loans error:', error);
        // Return Mock Data on Error
        return NextResponse.json([
            { id: 'LN/ED/1001', name: 'Grace Academy', image: 'https://i.pravatar.cc/150?u=1', amount: 1500000, rate: 4, durationMonths: 12, amountLeft: 1860000, status: 'Active', repayments: {}, disburseDate: 'Jan 15, 2026' },
            { id: 'LN/ED/1002', name: 'Bright Future School', image: 'https://i.pravatar.cc/150?u=2', amount: 850000, rate: 4, durationMonths: 6, amountLeft: 0, status: 'Paid Full', repayments: {}, disburseDate: 'Dec 02, 2025' }
        ]);
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
