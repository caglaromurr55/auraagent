const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAttendance() {
    console.log("--- Starting Attendance Logic Test ---");

    // Simulate SHIFT_START
    console.log("Logging SHIFT_START for Staff 1...");
    await prisma.$executeRawUnsafe(
        'INSERT INTO WorkLog (staffId, type, timestamp) VALUES (?, ?, ?)',
        1, 'SHIFT_START', new Date().toISOString()
    );
    await prisma.$executeRawUnsafe(
        'UPDATE Staff SET workState = ? WHERE id = ?',
        'InShift', 1
    );

    // Verify workState
    const staff = await prisma.staff.findUnique({ where: { id: 1 } });
    console.log(`Current State: ${staff.workState}`);

    // Simulate BREAK_START
    console.log("Logging BREAK_START for Staff 1...");
    await prisma.$executeRawUnsafe(
        'INSERT INTO WorkLog (staffId, type, timestamp) VALUES (?, ?, ?)',
        1, 'BREAK_START', new Date().toISOString()
    );
    await prisma.$executeRawUnsafe(
        'UPDATE Staff SET workState = ? WHERE id = ?',
        'OnBreak', 1
    );

    // Verify workState
    const staffAfterBreak = await prisma.staff.findUnique({ where: { id: 1 } });
    console.log(`Current State: ${staffAfterBreak.workState}`);

    // Fetch Logs (Simulate getAttendanceStats)
    const logs = await prisma.$queryRawUnsafe(`
        SELECT w.*, s.name as staffName
        FROM WorkLog w
        JOIN Staff s ON w.staffId = s.id
        ORDER BY w.timestamp DESC
        LIMIT 5
    `);
    console.log("Recent Logs:", JSON.stringify(logs, null, 2));
}

testAttendance().catch(console.error).finally(() => prisma.$disconnect());
