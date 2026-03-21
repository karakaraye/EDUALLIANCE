import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
