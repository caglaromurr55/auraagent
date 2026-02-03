'use client';

import React, { useState, useEffect } from 'react';
import { getReportingData } from "@/lib/actions";
import styles from "./Reports.module.css";

export default function ReportsClient() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const res = await getReportingData();
        setData(res);
        setLoading(false);
    };

    if (loading || !data) return <div style={{ padding: '2rem' }}>Raporlar Hazırlanıyor...</div>;

    const maxHourly = Math.max(...data.hourly.map((h: any) => Number(h.count || 0)), 1);
    const maxServiceRevenue = Math.max(...data.services.map((s: any) => Number(s.revenue || 0)), 1);

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 className="heading" style={{ fontSize: '2rem' }}>Analiz ve Raporlar</h1>
                <p style={{ color: 'hsl(var(--fg-secondary))' }}>İşletmenin performans verileri ve yoğunluk haritası</p>
            </header>

            <div className={styles.grid}>
                {/* 1. Peak Hour Heatmap */}
                <section className="glass-panel" style={{ padding: '1.5rem 1rem', gridColumn: 'span 2' }}>
                    <h3 className="heading" style={{ marginBottom: '2rem', paddingLeft: '0.5rem' }}>⏰ Günlük Yoğunluk Haritası</h3>
                    <div className={styles.heatmapContainer}>
                        <div className={styles.heatmap}>
                            {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map(hour => {
                                const entry = data.hourly.find((h: any) => h.time.startsWith(hour.split(':')[0]));
                                const count = entry ? Number(entry.count) : 0;
                                const intensity = count / maxHourly;

                                return (
                                    <div key={hour} className={styles.heatItem}>
                                        <div
                                            className={styles.heatSquare}
                                            style={{
                                                background: `hsla(var(--primary) / ${0.1 + intensity * 0.9})`,
                                                height: `${40 + intensity * 100}px`
                                            }}
                                            title={`${hour}: ${count} Randevu`}
                                        >
                                            <span className={styles.heatLabel}>{count}</span>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', marginTop: '1rem', color: 'hsl(var(--fg-secondary))' }}>{hour}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 2. Service Performance */}
                <section className="glass-panel" style={{ padding: '1.5rem 1rem' }}>
                    <h3 className="heading" style={{ marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>✨ Hizmet Performansı (Gelir)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0 0.5rem' }}>
                        {data.services.slice(0, 5).map((s: any, i: number) => {
                            const revenue = Number(s.revenue || 0);
                            const percentage = (revenue / maxServiceRevenue) * 100;
                            return (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                                        <span style={{ color: 'hsl(var(--primary))', fontWeight: 700 }}>₺{s.revenue.toLocaleString('tr-TR')}</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: 'hsla(var(--fg-primary) / 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                width: `${percentage}%`,
                                                height: '100%',
                                                background: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))',
                                                boxShadow: '0 0 10px hsla(var(--primary) / 0.3)'
                                            }}
                                        />
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--fg-secondary))', marginTop: '0.25rem' }}>{s.count} randevu gerçekleştirildi</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 3. Status Overview */}
                <section className="glass-panel" style={{ padding: '1.5rem 1rem' }}>
                    <h3 className="heading" style={{ marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>📊 Randevu Durumları</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0 0.5rem' }}>
                        {data.status.map((s: any, i: number) => (
                            <div key={i} className="glass-panel" style={{ padding: '1rem', border: '1px solid hsla(var(--fg-primary) / 0.05)' }}>
                                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--fg-secondary))', fontWeight: 600 }}>{s.status.toUpperCase()}</p>
                                <h4 style={{ fontSize: '1.5rem', margin: '0.25rem 0' }}>{s.count}</h4>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'hsla(var(--primary) / 0.05)', borderRadius: '1rem', margin: '2rem 0.5rem 0' }}>
                        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--fg-secondary))', lineHeight: '1.5' }}>
                            <strong>İpucu:</strong> Tamamlanan işlemlerin oranı ne kadar yüksekse, müşteri memnuniyeti ve verimlilik o kadar artar.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
