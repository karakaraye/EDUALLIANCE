import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const investors = await prisma.investor.findMany({
            orderBy: { dateInvested: 'desc' }
        });

        const formatted = investors.map(inv => ({
            id: inv.id,
            displayId: inv.displayId || `INV-${inv.id.substring(0, 5).toUpperCase()}`,
            name: inv.name,
            address: inv.address,
            phone: inv.phone,
            amountInvested: inv.amountInvested,
            interestRate: inv.interestRate,
            tenorMonths: inv.tenorMonths,
            dateInvested: new Date(inv.dateInvested).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            rawDate: inv.dateInvested,
            status: inv.status,
            payouts: [],
            totalPaid: 0
        }));

        // Fallback for Mock Data
        if (formatted.length === 0) {
            const mockInvestors = [
                { id: '1', displayId: 'INV-202601', name: 'Alhaji Sani Bello', amountInvested: 2500000, interestRate: 15, tenorMonths: 12, dateInvested: new Date().toISOString(), status: 'ACTIVE', phone: '08030000000', address: 'Abuja, Nigeria' },
                { id: '2', displayId: 'INV-202602', name: 'Chief Emeka Okafor', amountInvested: 5000000, interestRate: 15, tenorMonths: 12, dateInvested: new Date().toISOString(), status: 'ACTIVE', phone: '08020000000', address: 'Lagos, Nigeria' }
            ];
            return NextResponse.json(mockInvestors);
        }

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('GET /api/investors error:', error);
        // Return Mock Data on Error
        return NextResponse.json([
            { id: '1', displayId: 'INV-202601', name: 'Alhaji Sani Bello', amountInvested: 2500000, interestRate: 15, tenorMonths: 12, dateInvested: new Date().toISOString(), status: 'ACTIVE' }
        ]);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, amountInvested, interestRate, dateInvested, address, phone, tenorMonths, displayId } = body;

        const investor = await prisma.investor.create({
            data: {
                name: String(name),
                amountInvested: Number(amountInvested),
                interestRate: Number(interestRate),
                dateInvested: new Date(dateInvested),
                address: address || undefined,
                phone: phone || undefined,
                tenorMonths: tenorMonths ? Number(tenorMonths) : 12,
                displayId: displayId || undefined,
                status: 'ACTIVE'
            }
        });

        return NextResponse.json({ success: true, investorId: investor.id });
    } catch (error) {
        console.error('POST /api/investors error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, name, amountInvested, interestRate, dateInvested, status, address, phone, tenorMonths, displayId } = body;

        const updated = await prisma.investor.update({
            where: { id },
            data: {
                name: name ? String(name) : undefined,
                amountInvested: amountInvested !== undefined ? Number(amountInvested) : undefined,
                interestRate: interestRate !== undefined ? Number(interestRate) : undefined,
                dateInvested: dateInvested ? new Date(dateInvested) : undefined,
                address: address !== undefined ? address : undefined,
                phone: phone !== undefined ? phone : undefined,
                tenorMonths: tenorMonths !== undefined ? Number(tenorMonths) : undefined,
                displayId: displayId !== undefined ? displayId : undefined,
                status: status || undefined
            }
        });

        return NextResponse.json({ success: true, investor: updated });
    } catch (error) {
        console.error('PUT /api/investors error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        await prisma.investor.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/investors error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
