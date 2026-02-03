const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    try {
        console.log("Checking Service table columns...");
        const serviceCols = await p.$queryRawUnsafe('PRAGMA table_info(Service)');
        if (!serviceCols.some(c => c.name === 'cost')) {
            await p.$executeRawUnsafe('ALTER TABLE Service ADD COLUMN cost REAL DEFAULT 0');
            console.log('Added cost column to Service');
        } else {
            console.log('Service cost column already exists');
        }

        console.log("Checking Staff table columns...");
        const staffCols = await p.$queryRawUnsafe('PRAGMA table_info(Staff)');
        if (!staffCols.some(c => c.name === 'commissionRate')) {
            await p.$executeRawUnsafe('ALTER TABLE Staff ADD COLUMN commissionRate REAL DEFAULT 0.1');
            console.log('Added commissionRate column to Staff');
        } else {
            console.log('Staff commissionRate column already exists');
        }

        console.log("Creating Expense table...");
        await p.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS Expense (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                date TEXT NOT NULL,
                description TEXT,
                type TEXT NOT NULL
            )
        `);
        console.log('Expense table ready');

    } catch (e) {
        console.error("Migration error:", e);
    } finally {
        await p.$disconnect();
    }
}

main();
