'use client';

import React, { useState, useEffect } from 'react';
import styles from "./Booking.module.css";
import { createAppointment, getAppointments, getOrCreateCustomer } from "@/lib/actions";

interface BookingClientProps {
    services: any[];
    staffMembers: any[];
}

export default function BookingClient({ services, staffMembers }: BookingClientProps) {
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState('');
    const [customer, setCustomer] = useState({ name: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [busySlots, setBusySlots] = useState<string[]>([]);

    useEffect(() => {
        if (selectedDate && selectedStaff) {
            fetchBusySlots();
        }
    }, [selectedDate, selectedStaff]);

    const fetchBusySlots = async () => {
        const apps = await getAppointments(selectedStaff.id);
        const dailyApps = apps.filter((a: any) =>
            new Date(a.date).toISOString().split('T')[0] === selectedDate
        );
        setBusySlots(dailyApps.map((a: any) => a.time));
    };

    const handleBooking = async () => {
        if (!customer.name || !customer.phone || !selectedTime) return;
        setLoading(true);
        try {
            const cust = await getOrCreateCustomer(customer);

            await createAppointment({
                customerId: cust.id,
                serviceId: selectedService.id,
                staffId: selectedStaff.id,
                time: selectedTime,
                date: selectedDate,
                status: 'Bekliyor',
                room: 'Online Rezervasyon'
            });

            alert('Randevunuz başarıyla oluşturuldu! Sizi bekliyoruz.');
            window.location.href = '/';
        } catch (error) {
            console.error("Booking error:", error);
            alert('Bir hata oluştu. Lütfen tekrar deneyiniz.');
        } finally {
            setLoading(false);
        }
    };

    const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>AURA BEAUTY</h1>
                    <p className={styles.subtitle}>Online Randevu Sistemi</p>
                </div>

                <div className={styles.progress}>
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`${styles.dot} ${step >= s ? styles.dotActive : ''}`} />
                    ))}
                </div>

                {step === 1 && (
                    <div className="animate-fade-in">
                        <h2 className={styles.stepTitle}>Hizmet Seçiniz</h2>
                        <div className={styles.list}>
                            {services.map(s => (
                                <button
                                    key={s.id}
                                    className={`${styles.item} ${selectedService?.id === s.id ? styles.itemActive : ''}`}
                                    onClick={() => { setSelectedService(s); setStep(2); }}
                                >
                                    <span>{s.name}</span>
                                    <span style={{ fontWeight: 700 }}>₺{s.price}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in">
                        <h2 className={styles.stepTitle}>Uzman ve Zaman Seçiniz</h2>

                        <div className={styles.staffGrid}>
                            {staffMembers.map(s => (
                                <button
                                    key={s.id}
                                    className={`${styles.staffItem} ${selectedStaff?.id === s.id ? styles.staffActive : ''}`}
                                    onClick={() => setSelectedStaff(s)}
                                >
                                    <div className={styles.avatar} style={{ background: s.color }}>{s.name[0]}</div>
                                    <span style={{ fontSize: '0.8rem' }}>{s.name.split(' ')[0]}</span>
                                </button>
                            ))}
                        </div>

                        <input
                            type="date"
                            className={`input-premium ${styles.dateInput}`}
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                        />

                        <div className={styles.timeGrid}>
                            {timeSlots.map(t => {
                                const isBusy = busySlots.includes(t);
                                return (
                                    <button
                                        key={t}
                                        disabled={isBusy}
                                        className={`${styles.timeSlot} ${selectedTime === t ? styles.timeActive : ''} ${isBusy ? styles.timeBusy : ''}`}
                                        onClick={() => setSelectedTime(t)}
                                    >
                                        {t}
                                    </button>
                                );
                            })}
                        </div>

                        <div className={styles.actions}>
                            <button className="input-premium" style={{ width: 'auto' }} onClick={() => setStep(1)}>Geri</button>
                            <button
                                className="button-premium glow-primary"
                                disabled={!selectedStaff || !selectedTime}
                                onClick={() => setStep(3)}
                            >
                                Devam Et
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fade-in">
                        <h2 className={styles.stepTitle}>Bilgilerinizi Giriniz</h2>
                        <div className={styles.summary}>
                            <p><strong>Hizmet:</strong> {selectedService?.name}</p>
                            <p><strong>Uzman:</strong> {selectedStaff?.name}</p>
                            <p><strong>Zaman:</strong> {selectedDate} @ {selectedTime}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                            <input
                                type="text"
                                className="input-premium"
                                placeholder="Ad Soyad"
                                value={customer.name}
                                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                            />
                            <input
                                type="tel"
                                className="input-premium"
                                placeholder="Telefon Numarası"
                                value={customer.phone}
                                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                            />
                        </div>

                        <div className={styles.actions}>
                            <button className="input-premium" style={{ width: 'auto' }} onClick={() => setStep(2)}>Geri</button>
                            <button
                                className="button-premium glow-primary"
                                disabled={!customer.name || !customer.phone || loading}
                                onClick={handleBooking}
                            >
                                {loading ? 'Oluşturuluyor...' : 'Randevuyu Onayla'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
