import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDB() {
    try {
        console.log("Starting DB truncation...");
        await prisma.ledger.deleteMany();
        await prisma.expense.deleteMany();
        await prisma.salary.deleteMany();
        await prisma.payrollPeriod.deleteMany();
        await prisma.repaymentSchedule.deleteMany();
        await prisma.loan.deleteMany();
        await prisma.investor.deleteMany();
        await prisma.user.deleteMany();
        await prisma.department.deleteMany();
        console.log("✔ Successfully cleared all entries from the database.");
    } catch (error) {
        console.error("Error clearing DB:", error);
    } finally {
        await prisma.$disconnect();
    }
}

clearDB();
