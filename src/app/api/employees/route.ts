import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const employees = await prisma.user.findMany({
            where: {
                role: 'EMPLOYEE',
            },
            select: {
                id: true,
                name: true,
                email: true,
                department: {
                    select: {
                        name: true
                    }
                },
                basicSalary: true,
                allowances: true,
            }
        });

        return NextResponse.json(employees);
    } catch (error) {
        console.error('Failed to fetch employees:', error);
        return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        if (!body.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        
        const dummyEmail = `${body.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}-${Date.now()}@edualliance.test`;
        
        const newEmp = await prisma.user.create({
            data: {
                name: body.name,
                email: dummyEmail,
                role: 'EMPLOYEE',
                basicSalary: 0
            }
        });
        return NextResponse.json(newEmp);
    } catch (error) {
        console.error('POST /api/employees error:', error);
        return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await prisma.user.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/employees error:', error);
        return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
    }
}
