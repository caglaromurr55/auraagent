'use client';

import React, { useState, useEffect } from 'react';
import { getFinancialData, createExpense, deleteExpense, getAttendanceStats } from "@/lib/actions";
import styles from "./Finance.module.css";

export default function FinanceClient() {
    const [finance, setFinance] = useState<any>(null);
    const [staffStats, setStaffStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [newExpense, setNewExpense] = useState({
        amount: '',
        category: 'Kira',
        date: new Date().toISOString().split('T')[0],
        description: '',
        type: 'Fixed' as 'Fixed' | 'Variable'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [f, s] = await Promise.all([
                getFinancialData(),
                getAttendanceStats()
            ]);
            setFinance(f);
            setStaffStats(s as any[]);
        } catch (error) {
            console.error("Fetch finance error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await createExpense({
            ...newExpense,
            amount: parseFloat(newExpense.amount)
        } as any);
        setShowExpenseModal(false);
        setNewExpense({
            amount: '',
            category: 'Kira',
            date: new Date().toISOString().split('T')[0],
            description: '',
            type: 'Fixed'
        });
        await fetchData();
    };

    const handleDeleteExpense = async (id: number) => {
        if (!confirm('Bu gideri silmek istediğinize emin misiniz?')) return;
        setLoading(true);
        await deleteExpense(id);
        await fetchData();
    };

    if (loading && !finance) return <div style={{ padding: '2rem' }}>Yükleniyor...</div>;

    const metrics = [
        { label: "Toplam Gelir", value: `₺${finance?.revenue.toLocaleString('tr-TR')}`, sub: "Brüt kazanç", trend: "up", color: 'hsl(var(--primary))' },
        { label: "Operasyonel Gider", value: `₺${finance?.expenses.toLocaleString('tr-TR')}`, sub: "Sabit ve değişken", trend: "down", color: 'hsl(var(--error))' },
        { label: "Personel Primleri", value: `₺${finance?.commissions.toLocaleString('tr-TR')}`, sub: "Hak edilen", trend: "neutral", color: 'hsl(var(--accent))' },
        { label: "Net Kâr", value: `₺${finance?.netProfit.toLocaleString('tr-TR')}`, sub: "Tüm masraflar sonrası", trend: finance?.netProfit > 0 ? "up" : "down", color: 'hsl(var(--success))' },
    ];

    return (
        <div className="animate-fade-in">
            <header className={styles.financeHeader}>
                <div>
                    <h1 className="heading" style={{ fontSize: '2rem' }}>Finansal Yönetim</h1>
                    <p style={{ color: 'hsl(var(--fg-secondary))' }}>İşletme kârlılığı ve masraf takibi</p>
                </div>
                <button
                    className="button-premium glow-primary"
                    onClick={() => setShowExpenseModal(true)}
                    style={{ whiteSpace: 'nowrap' }}
                >
                    + Yeni Gider Ekle
                </button>
            </header>

            <section className={styles.metricsGrid}>
                {metrics.map((m, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                        <p style={{ color: 'hsl(var(--fg-secondary))', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>{m.label}</p>
                        <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: m.color }}>{m.value}</h2>
                        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--fg-secondary))' }}>{m.sub}</p>
                    </div>
                ))}
            </section>

            <div className={styles.mainGrid}>
                <section className="glass-panel" style={{ padding: '1.5rem 1rem' }}>
                    <h3 className="heading" style={{ marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>Personel Prim Dağılımı</h3>
                    <div className="table-container">
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>UZMAN</th>
                                    <th>İŞLEM</th>
                                    <th>PRİM ORANI</th>
                                    <th>TOPLAM PRİM</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffStats.map((s, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                                        <td>{s.completedJobs} İşlem</td>
                                        <td>%{((s.commissionRate || 0.1) * 100).toFixed(0)}</td>
                                        <td style={{ fontWeight: 700, color: 'hsl(var(--accent))' }}>₺{(s.totalCommission || 0).toLocaleString('tr-TR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="glass-panel" style={{ padding: '1.5rem 1rem' }}>
                    <h3 className="heading" style={{ marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>Son Giderler</h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="table-container">
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>TARİH</th>
                                    <th>KATEGORİ</th>
                                    <th>TUTAR</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {finance?.recentExpenses.map((e: any, i: number) => (
                                    <tr key={i}>
                                        <td style={{ fontSize: '0.85rem' }}>{new Date(e.date).toLocaleDateString('tr-TR')}</td>
                                        <td>
                                            <span className={styles.categoryBadge}>{e.category}</span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>₺{e.amount.toLocaleString('tr-TR')}</td>
                                        <td>
                                            <button onClick={() => handleDeleteExpense(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {showExpenseModal && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} glass-panel`}>
                        <h2 className="heading" style={{ marginBottom: '1.5rem' }}>Yeni Gider Kaydı</h2>
                        <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'hsl(var(--fg-secondary))', display: 'block', marginBottom: '0.5rem' }}>Tutar (₺)</label>
                                <input
                                    type="number"
                                    className="input-premium"
                                    required
                                    value={newExpense.amount}
                                    onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'hsl(var(--fg-secondary))', display: 'block', marginBottom: '0.5rem' }}>Kategori</label>
                                <select
                                    className="input-premium"
                                    value={newExpense.category}
                                    onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                >
                                    <option value="Kira">Kira</option>
                                    <option value="Personel Maaş">Maaş / Ödemeler</option>
                                    <option value="Sarf Malzeme">Sarf Malzeme</option>
                                    <option value="Elektrik/Su/İnternet">Elektrik/Su/İnternet</option>
                                    <option value="Pazarlama">Pazarlama / Reklam</option>
                                    <option value="Diğer">Diğer</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'hsl(var(--fg-secondary))', display: 'block', marginBottom: '0.5rem' }}>Açıklama</label>
                                <input
                                    type="text"
                                    className="input-premium"
                                    value={newExpense.description}
                                    onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                    placeholder="Örn: Ocak ayı dükkan kirası"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="input-premium" onClick={() => setShowExpenseModal(false)}>İptal</button>
                                <button type="submit" className="button-premium glow-primary">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
