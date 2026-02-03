'use client';

import React, { useState, useEffect } from 'react';
import {
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getCustomers,
    getServices,
    getStaffStatus
} from '@/lib/actions';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment?: any | null;
}

export default function AppointmentModal({ isOpen, onClose, appointment }: AppointmentModalProps) {
    const [customers, setCustomers] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);

    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [time, setTime] = useState('09:00');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState('Bekliyor');
    const [room, setRoom] = useState('Oda 1');

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const [c, s, st] = await Promise.all([
                getCustomers(),
                getServices(),
                getStaffStatus()
            ]);
            setCustomers(c as any[]);
            setServices(s as any[]);
            setStaffList(st as any[]);
        }
        if (isOpen) fetchData();
    }, [isOpen]);

    useEffect(() => {
        if (appointment) {
            setSelectedCustomerId(appointment.customerId.toString());
            setSelectedServiceId(appointment.serviceId.toString());
            setSelectedStaffId(appointment.staffId.toString());
            setTime(appointment.time);

            // Format date for <input type="date">
            if (appointment.date) {
                const d = new Date(appointment.date);
                const formattedDate = d.toISOString().split('T')[0];
                setDate(formattedDate);
            }

            setStatus(appointment.status);
            setRoom(appointment.room);
        } else {
            setSelectedCustomerId('');
            setSelectedServiceId('');
            setSelectedStaffId('');
            setTime('09:00');
            setDate(new Date().toISOString().split('T')[0]);
            setStatus('Bekliyor');
            setRoom('Oda 1');
        }
    }, [appointment, isOpen]);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const data = {
                customerId: parseInt(selectedCustomerId),
                serviceId: parseInt(selectedServiceId),
                staffId: parseInt(selectedStaffId),
                time,
                date,
                status,
                room
            };

            if (appointment) {
                await updateAppointment(appointment.id, data);
            } else {
                await createAppointment(data);
            }
            onClose();
        } catch (error) {
            console.error('Error saving appointment:', error);
            alert('Randevu kaydedilirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }

    const IconCalendar = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
    );

    const IconClock = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
    );

    const IconUser = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
    );

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(12px)',
        }}>
            <div className={`glass-panel animate-fade-in`} style={{
                width: '500px',
                padding: '2.5rem',
                borderRadius: 'var(--radius-lg)',
                position: 'relative',
                border: '1px solid hsla(var(--primary) / 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute',
                    top: '1.25rem',
                    right: '1.25rem',
                    background: 'hsla(var(--bg-secondary) / 0.5)',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--fg-primary))',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                }}>×</button>

                <h3 className="heading" style={{ marginBottom: '2.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <IconCalendar />
                    {appointment ? 'Randevuyu Düzenle' : 'Yeni Randevu Oluştur'}
                </h3>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--fg-secondary))' }}>
                            <IconUser /> Müşteri
                        </label>
                        <select
                            className="input-premium"
                            required
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                            style={{ paddingRight: '2rem' }}
                        >
                            <option value="">Müşteri Seçiniz</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--fg-secondary))' }}>Hizmet</label>
                            <select className="input-premium" required value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)}>
                                <option value="">Hizmet Seçiniz</option>
                                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--fg-secondary))' }}>Uzman</label>
                            <select className="input-premium" required value={selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value)}>
                                <option value="">Uzman Seçiniz</option>
                                {staffList.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--fg-secondary))' }}>
                                <IconCalendar /> Tarih
                            </label>
                            <input type="date" className="input-premium" required value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--fg-secondary))' }}>
                                <IconClock /> Saat
                            </label>
                            <input type="time" className="input-premium" required value={time} onChange={(e) => setTime(e.target.value)} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--fg-secondary))' }}>Oda / Bölüm</label>
                            <input type="text" className="input-premium" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Oda 1" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--fg-secondary))' }}>Durum</label>
                            <select className="input-premium" value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="Bekliyor">Bekliyor</option>
                                <option value="Onaylandı">Onaylandı</option>
                                <option value="Tamamlandı">Tamamlandı</option>
                                <option value="İptal">İptal</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <button
                            type="submit"
                            className="button-premium glow-primary"
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {loading ? 'Kaydediliyor...' : (appointment ? 'Değişiklikleri Kaydet' : 'Randevu Oluştur')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
