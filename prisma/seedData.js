const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding random financial data for EDUALLIANCE...');

  // 1. Create Departments
  console.log('Creating departments...');
  const deptAdmin = await prisma.department.create({ data: { name: 'Administration', budget: 1000000 } });
  const deptFinance = await prisma.department.create({ data: { name: 'Finance & Accounts', budget: 500000 } });
  const deptLoans = await prisma.department.create({ data: { name: 'Credit & Loans', budget: 750000 } });

  // 2. Create Users
  console.log('Creating users...');
  const admin = await prisma.user.create({
    data: {
      name: 'Edualliance Admin',
      email: `admin_${Math.random().toString(36).substring(7)}@edualliance.com`,
      role: 'ADMIN',
      departmentId: deptAdmin.id,
      basicSalary: 250000
    }
  });

  const employee1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: `john_${Math.random().toString(36).substring(7)}@edualliance.com`,
      role: 'EMPLOYEE',
      departmentId: deptFinance.id,
      basicSalary: 120000
    }
  });

  const employee2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: `jane_${Math.random().toString(36).substring(7)}@edualliance.com`,
      role: 'EMPLOYEE',
      departmentId: deptLoans.id,
      basicSalary: 135000
    }
  });

  // 3. Create Loans
  console.log('Creating random loans...');
  const loanNames = ['Grace Academy', 'Bright Future School', 'St. Marys Institute', 'Lighthouse Preparatory', 'Global Excellence School', 'Unity High School', 'Apex Learning Center', 'Victorious Kids Academy', 'Pioneer International', 'Wisdom Fountain School'];
  for (let i = 0; i < 15; i++) {
    const amount = Math.floor(Math.random() * (2000000 - 500000) + 500000);
    const months = Math.random() > 0.5 ? 12 : 6;
    const date = new Date();
    date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));
    
    await prisma.loan.create({
      data: {
        id: `LN/ED/${1000 + i}`,
        name: loanNames[Math.floor(Math.random() * loanNames.length)],
        amount: amount,
        interestRate: 4,
        durationMonths: months,
        amountLeft: amount * 1.24, 
        status: i % 5 === 0 ? 'Paid Full' : 'Active',
        disburseDate: date
      }
    });
  }

  // 4. Create Investors
  console.log('Creating investors...');
  const investorNames = ['Alhaji Sani Bello', 'Chief Emeka Okafor', 'Dr. Olumide Johnson', 'Mrs. Funke Akindele', 'Capital Trust Ltd', 'Standard Investment Group'];
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - Math.floor(Math.random() * 8));
    await prisma.investor.create({
      data: {
        displayId: `INV-${202600 + i}`,
        name: investorNames[Math.floor(Math.random() * investorNames.length)],
        amountInvested: Math.floor(Math.random() * (5000000 - 1000000) + 1000000),
        interestRate: 15,
        dateInvested: date,
        status: 'ACTIVE'
      }
    });
  }

  // 5. Create Expenses
  console.log('Creating expenses...');
  const categories = ['Electricity', 'Fuel', 'Rent', 'Internet', 'Marketing', 'Repairs', 'Office Supplies'];
  for (let m = 0; m < 6; m++) {
    for (let j = 0; j < 4; j++) {
      const date = new Date();
      date.setMonth(date.getMonth() - m);
      date.setDate(Math.floor(Math.random() * 28) + 1);
      
      await prisma.expense.create({
        data: {
          amount: Math.floor(Math.random() * (60000 - 8000) + 8000),
          category: categories[Math.floor(Math.random() * categories.length)],
          description: `Operational ${categories[Math.floor(Math.random() * categories.length)]} for the month`,
          date: date,
          status: 'APPROVED',
          managerId: admin.id
        }
      });
    }
  }

  // 6. Create Payroll
  console.log('Generating payroll history...');
  for (let m = 0; m < 4; m++) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - m);
    startDate.setDate(1);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    const period = await prisma.payrollPeriod.create({
      data: {
        startDate: startDate,
        endDate: endDate
      }
    });

    const employees = [admin, employee1, employee2];
    for (const emp of employees) {
      await prisma.salary.create({
        data: {
          employeeId: emp.id,
          periodId: period.id,
          basicSalary: emp.basicSalary,
          allowances: 25000,
          grossAmount: emp.basicSalary + 25000,
          deductions: 8000,
          netAmount: emp.basicSalary + 17000,
          status: 'PAID',
          createdAt: endDate
        }
      });
    }
  }

  console.log('Seeding completed successfully! Charts should now have data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
