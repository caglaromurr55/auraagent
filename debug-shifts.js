const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const info = await prisma.$queryRawUnsafe("PRAGMA table_info(Staff)");
    console.log("Staff Table Info:", JSON.stringify(info, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));

    const staff = await prisma.$queryRawUnsafe(`
        SELECT s.*, 
        (SELECT json_group_array(json_object('dayOfWeek', sh.dayOfWeek, 'startTime', sh.startTime, 'endTime', sh.endTime, 'isActive', sh.isActive)) 
         FROM Shift sh WHERE sh.staffId = s.id) as shifts
        FROM Staff s
    `);
    console.log("Raw Query Result (First Item):", JSON.stringify(staff[0], (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
