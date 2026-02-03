const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    // Clear existing data
    await prisma.chatMessage.deleteMany({})
    await prisma.appointment.deleteMany({})
    await prisma.staff.deleteMany({})
    await prisma.customer.deleteMany({})
    await prisma.service.deleteMany({})

    // Seed Services
    const hydrafacial = await prisma.service.create({ data: { name: 'Hydrafacial Cilt Bakımı', price: 1500, duration: 60 } })
    const laser = await prisma.service.create({ data: { name: 'Lazer Epilasyon', price: 2000, duration: 45 } })
    const nailArt = await prisma.service.create({ data: { name: 'Protez Tırnak & Nail Art', price: 800, duration: 90 } })

    // Seed Staff
    const eda = await prisma.staff.create({ data: { name: 'Eda Yılmaz', role: 'Kıdemli Uzman', status: 'Meşgul', color: 'hsl(var(--primary))' } })
    const canan = await prisma.staff.create({ data: { name: 'Canan Tekin', role: 'Uzman', status: 'Müsait', color: 'hsl(var(--success))' } })
    const merve = await prisma.staff.create({ data: { name: 'Merve Bulut', role: 'Uzman', status: 'Mola', color: 'hsl(var(--fg-secondary))' } })

    // Seed Customers
    const ayse = await prisma.customer.create({ data: { name: 'Ayşe Yılmaz', phone: '+90 532 111 22 33', email: 'ayse@example.com' } })
    const mehmet = await prisma.customer.create({ data: { name: 'Mehmet Kaya', phone: '+90 505 444 55 66' } })

    // Seed Appointments
    await prisma.appointment.create({
        data: {
            time: '10:00',
            customerId: ayse.id,
            staffId: eda.id,
            serviceId: hydrafacial.id,
            status: 'Bekliyor',
            room: 'VIP 1'
        }
    })

    // Seed Initial Messages
    await prisma.chatMessage.create({
        data: {
            customerId: ayse.id,
            sender: 'Ayşe Yılmaz',
            text: 'Randevumu saat 14:00\'e alabilir miyiz?',
            type: 'incoming'
        }
    })

    console.log('Seed completed successfully')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
