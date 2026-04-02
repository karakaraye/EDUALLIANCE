import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearData() {
  console.log('Initiating total operational data purge...');

  try {
    // Delete in reverse order of relational constraints
    await prisma.ledger.deleteMany();

    await prisma.expense.deleteMany();
    await prisma.salary.deleteMany();
    await prisma.payrollPeriod.deleteMany();
    await prisma.loan.deleteMany();
    await prisma.investor.deleteMany();
    await prisma.user.deleteMany();
    await prisma.department.deleteMany();

    console.log('All operational Postgres records systematically dropped.');
  } catch (error) {
    console.error('Failed to wipe data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearData();
