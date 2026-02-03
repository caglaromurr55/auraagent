'use client';

import React, { useState, useEffect } from 'react';
import {
    getDueAppointments,
    setArrivalPrompted,
    getFinishedAppointments,
    setCompletionPrompted
} from '@/lib/actions';

export default function ArrivalChecker() {
    const [activeItem, setActiveItem] = useState<{ type: 'arrival' | 'completion', data: any } | null>(null);
    const [loading, setLoading] = useState(false);
    const [snoozeList, setSnoozeList] = useState<Record<number, number>>({});

    // Load snooze list from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('aura_snooze_list');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Clean up expired snoozes
                const now = Date.now();
                const cleaned = Object.fromEntries(
                    Object.entries(parsed).filter(([_, expiry]) => (expiry as number) > now)
                );
                setSnoozeList(cleaned as any);
            } catch (e) {
                console.error("Snooze load error:", e);
            }
        }
    }, []);

    // Save snooze list when it changes
    useEffect(() => {
        localStorage.setItem('aura_snooze_list', JSON.stringify(snoozeList));
    }, [snoozeList]);

    useEffect(() => {
        const checkApp = async () => {
            if (activeItem) return; // Don't check if something is already showing

            // Security Fix: Only check if a user is logged in
            const userStr = localStorage.getItem('aura_user');
            if (!userStr) return;

            try {
                const now = Date.now();

                // 1. Check Arrivals First
                const arrivals = await getDueAppointments();
                const filteredArrivals = arrivals.filter(a => !snoozeList[a.id] || snoozeList[a.id] < now);

                if (filteredArrivals.length > 0) {
                    setActiveItem({ type: 'arrival', data: filteredArrivals[0] });
                    return;
                }

                // 2. Check Completions
                const completions = await getFinishedAppointments();
                const filteredCompletions = completions.filter(c => !snoozeList[c.id] || snoozeList[c.id] < now);

                if (filteredCompletions.length > 0) {
                    setActiveItem({ type: 'completion', data: filteredCompletions[0] });
                }
            } catch (error) {
                console.error("Monitor error:", error);
            }
        };

        checkApp();
        const interval = setInterval(checkApp, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, [activeItem, snoozeList]);

    const handleArrivalAction = async (status?: string) => {
        if (!activeItem || activeItem.type !== 'arrival') return;
        setLoading(true);
        try {
            if (status) {
                await setArrivalPrompted(activeItem.data.id, status);
            } else {
                // If dismissed/wait, snooze for 10 mins
                const newSnooze = { ...snoozeList, [activeItem.data.id]: Date.now() + 10 * 60 * 1000 };
                setSnoozeList(newSnooze);
            }
            setActiveItem(null);
        } catch (error) {
            console.error("Arrival action error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompletionAction = async (isDone: boolean, snoozeMinutes?: number) => {
        if (!activeItem || activeItem.type !== 'completion') return;
        setLoading(true);
        try {
            if (isDone) {
                await setCompletionPrompted(activeItem.data.id, 'Tamamlandı');
            } else {
                // Snooze logic
                const duration = snoozeMinutes || 10;
                const newSnooze = { ...snoozeList, [activeItem.data.id]: Date.now() + duration * 60 * 1000 };
                setSnoozeList(newSnooze);
            }
            setActiveItem(null);
        } catch (error) {
            console.error("Completion action error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!activeItem) return null;

    const isArrival = activeItem.type === 'arrival';

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(16px)',
        }}>
            <div className="glass-panel animate-fade-in" style={{
                width: '450px',
                padding: '3rem',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                border: `1px solid hsla(var(${isArrival ? '--primary' : '--success'}) / 0.3)`,
                boxShadow: `0 0 50px hsla(var(${isArrival ? '--primary' : '--success'}) / 0.1)`
            }}>
                {/* Icon */}
                <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    backgroundColor: `hsla(var(${isArrival ? '--primary' : '--success'}) / 0.1)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    border: `1px solid hsla(var(${isArrival ? '--primary' : '--success'}) / 0.2)`
                }}>
                    {isArrival ? (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    ) : (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--success))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    )}
                </div>

                <h2 className="heading" style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>
                    {isArrival ? 'Randevu Zamanı!' : 'İşlem Bitti mi?'}
                </h2>

                <p style={{ color: 'hsl(var(--fg-secondary))', marginBottom: '2rem', lineHeight: '1.6' }}>
                    Müşteri: <strong>{activeItem.data.customer?.name}</strong><br />
                    Hizmet: <strong>{activeItem.data.service?.name}</strong><br />
                    {isArrival ? (
                        <>Randevu saati (<strong>{activeItem.data.time}</strong>) geldi. Giriş yapıldı mı?</>
                    ) : (
                        <>Tahmini bitiş süresi doldu. İşlem <strong>"Tamamlandı"</strong> olarak işaretlensin mi?</>
                    )}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        onClick={() => isArrival ? handleArrivalAction('Onaylandı') : handleCompletionAction(true)}
                        className="button-premium glow-primary"
                        disabled={loading}
                        style={{ width: '100%', padding: '1rem', backgroundColor: isArrival ? '' : 'hsl(var(--success))', color: isArrival ? '' : 'white' }}
                    >
                        {loading ? 'İşleniyor...' : (isArrival ? 'Evet, Geldi' : 'Evet, Tamamlandı')}
                    </button>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button
                            onClick={() => isArrival ? handleArrivalAction('İptal') : handleCompletionAction(false, 10)}
                            disabled={loading}
                            style={{
                                background: 'none',
                                border: '1px solid hsla(var(--error) / 0.3)',
                                color: 'hsl(var(--error))',
                                padding: '0.8rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600
                            }}
                        >
                            {isArrival ? 'Gelmedi' : '10 Dakika Sonra Sor'}
                        </button>
                        <button
                            onClick={() => isArrival ? handleArrivalAction() : handleCompletionAction(false, 30)}
                            disabled={loading}
                            style={{
                                background: 'hsla(var(--bg-secondary) / 0.5)',
                                border: '1px solid hsl(var(--border))',
                                color: 'hsl(var(--fg-secondary))',
                                padding: '0.8rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600
                            }}
                        >
                            {isArrival ? 'Beklet' : '30 Dakika Sonra Sor'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
