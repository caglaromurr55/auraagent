'use client';

import React, { useState, useEffect } from 'react';
import { getDashboardStats, getUpcomingAppointments, getStaffStatus, logWorkEvent, getStaffWorkState, getAttendanceStats } from "@/lib/actions";
import styles from "./page.module.css";

export default function DashboardClient() {
    const [stats, setStats] = useState<any>(null);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [staffMembers, setStaffMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [workState, setWorkState] = useState<string>('Offline');
    const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('aura_user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            fetchData(parsed.role === 'Staff' ? parsed.id : undefined);
        } else {
            fetchData();
        }
    }, []);

    const fetchData = async (staffId?: number) => {
        setLoading(true);
        try {
            const [s, a, st, ws, logs] = await Promise.all([
                getDashboardStats(staffId),
                getUpcomingAppointments(staffId),
                getStaffStatus(),
                staffId ? getStaffWorkState(staffId) : Promise.resolve('Offline'),
                user?.role === 'Admin' ? getAttendanceStats() : Promise.resolve([])
            ]);
            setStats(s);
            setAppointments(a as any[]);
            setStaffMembers(st as any[]);
            setWorkState(ws as string);
            setAttendanceLogs(logs as any[]);
        } catch (error) {
            console.error("Fetch dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBreakToggle = async () => {
        if (!user) return;
        const newType = workState === 'OnBreak' ? 'BREAK_END' : 'BREAK_START';
        setLoading(true);
        await logWorkEvent(user.id, newType as any);
        await fetchData(user.id);
    };

    if (loading || !stats) return <div style={{ padding: '2rem' }}>Yükleniyor...</div>;

    const metrics = user?.role === 'Admin' ? [
        { label: "Toplam Gelir", value: `₺${stats.revenue.toLocaleString('tr-TR')}`, sub: "Tamamlanan işlemler", trend: "up" },
        { label: "Aktif Randevular", value: stats.activeAppointments.toString(), sub: "Bekleyenler", trend: "neutral" },
        { label: "Bot Etkileşimi", value: stats.messageCount.toString(), sub: "Toplam mesaj", trend: "up" },
        { label: "Toplam Müşteri", value: stats.customerCount.toString(), sub: "Sistem kaydı", trend: "up" },
    ] : [
        { label: "Tamamlanan İşlem", value: stats.completedCount.toString(), sub: "Sizin toplamınız", trend: "up" },
        { label: "Sıradaki Randevu", value: appointments[0]?.time || '--:--', sub: appointments[0]?.customer?.name || "Bekleyen yok", trend: "neutral" },
        { label: "Müşteri Portföyü", value: stats.customerCount.toString(), sub: "Sizin müşterileriniz", trend: "up" },
        { label: "Hizmet Puanı", value: stats.rating?.toFixed(1) || "5.0", sub: "Müşteri geri dönüşü", trend: "up" },
    ];

    return (
        <div className="animate-fade-in">
            <header className={styles.header}>
                <div>
                    <h1 className="heading" style={{ fontSize: '2rem' }}>
                        {user?.role === 'Staff' ? `Hoş Geldin, ${user.name.split(' ')[0]}` : 'Gösterge Paneli'}
                    </h1>
                    <p style={{ color: 'hsl(var(--fg-secondary))', fontSize: '0.95rem' }}>
                        {user?.role === 'Staff' ? 'Kişisel Çalışma Alanı' : 'Aura Beauty Yönetim Portalı'} • {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                {user?.role === 'Admin' && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="input-premium" style={{ width: 'auto', padding: '0.6rem 1rem', fontSize: '0.85rem' }}>Rapor İndir</button>
                        <button className="button-premium glow-primary">+ Randevu Oluştur</button>
                    </div>
                )}
                {user?.role === 'Staff' && (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
                            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--fg-secondary))', fontWeight: 600 }}>DURUM</p>
                            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: workState === 'InShift' ? 'hsl(var(--success))' : workState === 'OnBreak' ? 'hsl(var(--warning))' : 'hsl(var(--fg-secondary))' }}>
                                {workState === 'InShift' ? 'Mesaideyim' : workState === 'OnBreak' ? 'Moladayım' : 'Çalışmıyorum'}
                            </p>
                        </div>
                        {workState === 'InShift' && (
                            <button onClick={handleBreakToggle} className="button-premium shadow-lg" style={{ background: 'hsl(var(--warning))', color: 'hsl(var(--warning-fg))', fontWeight: 800 }}>Mola Ver</button>
                        )}
                        {workState === 'OnBreak' && (
                            <button onClick={handleBreakToggle} className="button-premium glow-primary" style={{ fontWeight: 800 }}>Mola Bitti</button>
                        )}
                    </div>
                )}
            </header>

            <section className={styles.metricsGrid}>
                {metrics.map((m, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                        <p style={{ color: 'hsl(var(--fg-secondary))', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>{m.label}</p>
                        <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{m.value}</h2>
                        <p style={{ fontSize: '0.8rem', color: m.trend === 'up' ? 'hsl(var(--success))' : 'hsl(var(--fg-secondary))' }}>
                            {m.trend === 'up' ? '↗' : '→'} {m.sub}
                        </p>
                    </div>
                ))}
            </section>

            <div className={styles.grid2Col}>
                <section className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 className="heading">Haftalık Performans</h3>
                    <div className={styles.chartArea} style={{ marginTop: '2rem' }}>
                        {stats.weeklyChart?.map((count: number, i: number) => {
                            const maxVal = Math.max(...(stats.weeklyChart || []), 5);
                            const height = (count / maxVal) * 100;
                            return (
                                <div key={i} className={styles.chartBarWrapper}>
                                    <div className={styles.chartBar} style={{ height: `${height}%` }}></div>
                                    <span className={styles.chartLabel}>G{i + 1}</span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 className="heading" style={{ marginBottom: '1.5rem' }}>Ekip Arkadaşlarım</h3>
                    <div className={styles.staffList}>
                        {staffMembers.map((staff, i) => (
                            <div key={i} className={styles.staffItem}>
                                <div className={styles.staffAvatar} style={{ background: staff.color }}>{staff.name[0]}</div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{staff.name}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--fg-secondary))' }}>{staff.role}</p>
                                </div>
                                <div className="statusBadge" data-status={staff.workState || staff.status} style={{ fontSize: '0.7rem' }}>
                                    {staff.workState === 'InShift' ? 'Mesaide' : staff.workState === 'OnBreak' ? 'Molada' : 'Çevrimdışı'}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <section className="glass-panel" style={{ marginTop: '2rem', padding: '1.5rem 1rem' }}>
                <h3 className="heading" style={{ marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>{user?.role === 'Staff' ? 'Bugünkü Randevularım' : 'Günlük Randevu Akışı'}</h3>
                <div className="table-container">
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>SAAT</th>
                                <th>MÜŞTERİ</th>
                                <th>HİZMET</th>
                                {user?.role === 'Admin' && <th>UZMAN</th>}
                                <th>DURUM</th>
                                <th>ODA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((app, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 700, color: 'hsl(var(--primary))' }}>{app.time}</td>
                                    <td style={{ fontWeight: 600 }}>{app.customer.name}</td>
                                    <td>{app.service.name}</td>
                                    {user?.role === 'Admin' && <td>{app.staff.name}</td>}
                                    <td>
                                        <span className="statusBadge" data-status={app.status}>{app.status}</span>
                                    </td>
                                    <td style={{ color: 'hsl(var(--fg-secondary))', fontSize: '0.85rem' }}>{app.room}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {user?.role === 'Admin' && attendanceLogs.length > 0 && (
                <section className="glass-panel" style={{ marginTop: '2rem', padding: '1.5rem 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
                        <h3 className="heading">Personel Mesai ve Mola Kayıtları</h3>
                        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--fg-secondary))' }}>Son 50 işlem</p>
                    </div>
                    <div className="table-container">
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>TARİH / SAAT</th>
                                    <th>PERSONEL</th>
                                    <th>İŞLEM</th>
                                    <th>SİSTEM NOTU</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceLogs.map((log, i) => (
                                    <tr key={i}>
                                        <td style={{ fontSize: '0.85rem' }}>{new Date(log.timestamp).toLocaleString('tr-TR')}</td>
                                        <td style={{ fontWeight: 600 }}>{log.staffName}</td>
                                        <td>
                                            <span className="statusBadge" data-status={log.type} style={{
                                                background: log.type.includes('START') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: log.type.includes('START') ? '#22c55e' : '#ef4444',
                                                borderColor: 'transparent'
                                            }}>
                                                {log.type === 'SHIFT_START' ? 'MESAYE BAŞLADI' :
                                                    log.type === 'SHIFT_END' ? 'MESAİ BİTTİ' :
                                                        log.type === 'BREAK_START' ? 'MOLAYA ÇIKTI' : 'MOLADAN DÖNDÜ'}
                                            </span>
                                        </td>
                                        <td style={{ color: 'hsl(var(--fg-secondary))', fontSize: '0.8rem' }}>
                                            {log.metadata || 'Otomatik sistem kaydı'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
}
