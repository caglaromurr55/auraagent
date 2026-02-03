import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const { phone, sender, text, type } = data;

        // 1. Find or create customer
        let customer = await prisma.customer.findUnique({
            where: { phone: phone }
        });

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    name: sender || 'Yeni Müşteri',
                    phone: phone,
                }
            });
        }

        // 2. Save the message
        const newMessage = await prisma.chatMessage.create({
            data: {
                customerId: customer.id,
                sender: sender || customer.name,
                text: text,
                type: type || 'incoming',
            }
        });

        console.log('Processed n8n webhook:', newMessage);

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            status: 'success',
            message: 'Mesaj kaydedildi'
        });
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ status: 'error', message: 'İşlem başarısız' }, { status: 400 });
    }
}

export async function GET() {
    return NextResponse.json({ status: 'active', service: 'Aura Premium Webhook' });
}
