'use client';

import React, { useState, useEffect } from 'react';
import { getUpcomingAppointments } from "@/lib/actions";
import styles from "../dashboard/page.module.css";
import Calendar from "./Calendar";
import AppointmentModalWrapper from "@/app/(dashboard)/appointments/AppointmentModalWrapper";

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('aura_user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            fetchAppointments(parsed.role === 'Staff' ? parsed.id : undefined);
        } else {
            fetchAppointments();
        }
    }, []);

    const fetchAppointments = async (staffId?: number) => {
        setLoading(true);
        try {
            const data = await getUpcomingAppointments(staffId);
            setAppointments(data);
        } catch (error) {
            console.error("Fetch appointments error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Takvim Yükleniyor...</div>;

    return (
        <div className="animate-fade-in">
            <header className={styles.header}>
                <div>
                    <h1 className="heading" style={{ fontSize: '2rem' }}>
                        {user?.role === 'Staff' ? 'Randevularım' : 'Randevu Takvimi'}
                    </h1>
                    <p style={{ color: 'hsl(var(--fg-secondary))', fontSize: '0.95rem' }}>Aura Beauty • Görsel Planlama ve Yönetim</p>
                </div>
                {/* Admin can see the global add button, staff sees their view */}
                <AppointmentModalWrapper onUpdate={() => fetchAppointments(user?.role === 'Staff' ? user.id : undefined)} />
            </header>

            <section>
                <Calendar initialAppointments={appointments} />
            </section>
        </div>
    );
}
