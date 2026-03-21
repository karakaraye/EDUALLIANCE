import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const investors = await prisma.investor.findMany({
            orderBy: { dateInvested: 'desc' }
        });

        const formatted = investors.map(inv => ({
            id: inv.id,
            displayId: `#INV-${inv.id.substring(0, 4).toUpperCase()}`,
            name: inv.name,
            amountInvested: inv.amountInvested,
            interestRate: inv.interestRate,
            dateInvested: new Date(inv.dateInvested).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: inv.status,
            rawDate: inv.dateInvested
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('GET /api/investors error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, amountInvested, interestRate, dateInvested } = body;

        const investor = await prisma.investor.create({
            data: {
                name: String(name),
                amountInvested: Number(amountInvested),
                interestRate: Number(interestRate),
                dateInvested: new Date(dateInvested),
                status: 'ACTIVE'
            }
        });

        return NextResponse.json({ success: true, investorId: investor.id });
    } catch (error) {
        console.error('POST /api/investors error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
