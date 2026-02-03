const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const staff = await prisma.staff.findMany();
    staff.forEach(s => {
        console.log(`ID: ${s.id}, Name: ${s.name}, Email: ${s.email}, Pass: ${s.password}`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
