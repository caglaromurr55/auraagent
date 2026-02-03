const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const DATA_FILE = path.join(__dirname, 'db-export.json');

async function exportData() {
    console.log('🚀 Veriler SQLite\'dan dışa aktarılıyor...');

    const data = {
        users: await prisma.user.findMany(),
        customers: await prisma.customer.findMany(),
        services: await prisma.service.findMany(),
        staff: await prisma.staff.findMany(),
        appointments: await prisma.appointment.findMany(),
        workLogs: await prisma.workLog.findMany(),
        shifts: await prisma.shift.findMany(),
        messages: await prisma.chatMessage.findMany(),
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`✅ Veriler başarıyla '${DATA_FILE}' dosyasına kaydedildi.`);
}

async function importData() {
    if (!fs.existsSync(DATA_FILE)) {
        console.error(`❌ Hata: '${DATA_FILE}' bulunamadı. Önce --export komutunu çalıştırın.`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    console.log('🚀 Veriler PostgreSQL\'e aktarılıyor...');

    // 1. Temizlik (Opsiyonel: Eğer veritabanı boşsa gerek yok)
    // console.log('Sıfırlanıyor...');
    // await prisma.chatMessage.deleteMany({});
    // ...

    // 2. Sırayla yükleme (İlişki sıralamasına dikkat ederek)
    console.log('Kullanıcılar yükleniyor...');
    for (const item of data.users) {
        await prisma.user.upsert({ where: { id: item.id }, update: item, create: item });
    }

    console.log('Müşteriler yükleniyor...');
    for (const item of data.customers) {
        await prisma.customer.upsert({ where: { id: item.id }, update: item, create: item });
    }

    console.log('Hizmetler yükleniyor...');
    for (const item of data.services) {
        await prisma.service.upsert({ where: { id: item.id }, update: item, create: item });
    }

    console.log('Personeller yükleniyor...');
    for (const item of data.staff) {
        await prisma.staff.upsert({ where: { id: item.id }, update: item, create: item });
    }

    console.log('Vardiyalar yükleniyor...');
    for (const item of data.shifts) {
        await prisma.shift.upsert({ where: { id: item.id }, update: item, create: item });
    }

    console.log('Randevular yükleniyor...');
    for (const item of data.appointments) {
        await prisma.appointment.upsert({ where: { id: item.id }, update: item, create: item });
    }

    console.log('Çalışma kayıtları yükleniyor...');
    for (const item of data.workLogs) {
        await prisma.workLog.upsert({ where: { id: item.id }, update: item, create: item });
    }

    console.log('Mesajlar yükleniyor...');
    for (const item of data.messages) {
        await prisma.chatMessage.upsert({ where: { id: item.id }, update: item, create: item });
    }

    // 3. PostgreSQL ID Sequence'lerini güncelleme
    console.log('ID sıralamaları güncelleniyor...');
    const tables = ['User', 'Customer', 'Service', 'Staff', 'Shift', 'Appointment', 'WorkLog', 'ChatMessage'];
    for (const table of tables) {
        try {
            await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1))`);
        } catch (e) {
            console.warn(`⚠️ ${table} için sequence güncellenemedi (normal olabilir):`, e.message);
        }
    }

    console.log('✅ Veri aktarımı başarıyla tamamlandı!');
}

const mode = process.argv[2];

if (mode === '--export') {
    exportData()
        .catch(console.error)
        .finally(() => prisma.$disconnect());
} else if (mode === '--import') {
    importData()
        .catch(console.error)
        .finally(() => prisma.$disconnect());
} else {
    console.log('Kullanım: node migrate-data.js [--export | --import]');
}
