const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const names = [
        "Mr Moses Celestine",
        "Mrs Oduola Blessing",
        "Mrs Obebe Margaret",
        "Mr Uchenna Victor Chekwube",
        "Mr Nwaneri Joseph Chika",
        "Mrs Asidianya Precious Chidinma",
        "Mrs Nwokocha Precious Onyiyechi"
    ];

    for (const name of names) {
        // Create user if not exists based on a generated email
        const email = name.toLowerCase().replace(/[^a-z]/g, '') + '@edualliance.com';
        
        const existing = await prisma.user.findUnique({ where: { email } });
        if (!existing) {
            await prisma.user.create({
                data: {
                    name: name,
                    email: email,
                    role: 'EMPLOYEE',
                    basicSalary: 85000 // default dummy basic salary
                }
            });
            console.log(`Added ${name}`);
        } else {
            console.log(`${name} already exists`);
        }
    }
    console.log("Seed complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
