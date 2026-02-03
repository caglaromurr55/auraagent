const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const staff = await prisma.staff.findMany();
    console.log("Current Staff States:");
    staff.forEach(s => {
        console.log(`ID: ${s.id}, Name: ${s.name}, workState: ${s.workState}, status: ${s.status}`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
