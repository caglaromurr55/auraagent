'use client';

import React, { useState, useEffect } from 'react';
import { logWorkEvent, getStaffWorkState, getStaffWithShifts } from "@/lib/actions";

export default function AttendanceMonitor() {
    const [user, setUser] = useState<any>(null);
    const [workState, setWorkState] = useState<string>('Offline');
    const [showStartModal, setShowStartModal] = useState(false);
    const [showEndModal, setShowEndModal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('aura_user');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.role === 'Staff') {
                setUser(parsed);
                checkStatus(parsed.id);
            }
        }
    }, []);

    const checkStatus = async (staffId: number) => {
        const state = await getStaffWorkState(staffId);
        setWorkState(state);

        // Check schedules
        const allStaff = await getStaffWithShifts();
        const me = allStaff.find((s: any) => s.id === staffId);
        if (!me) return;

        const todayIdx = [0, 1, 2, 3, 4, 5, 6][new Date().getDay()]; // Sunday is 0 in JS and in my map
        const shift = me.shifts.find((s: any) => s.dayOfWeek === todayIdx);

        if (shift && shift.isActive) {
            const now = new Date();
            const [hStart, mStart] = shift.startTime.split(':').map(Number);
            const [hEnd, mEnd] = shift.endTime.split(':').map(Number);

            const startTime = new Date();
            startTime.setHours(hStart, mStart, 0);

            const endTime = new Date();
            endTime.setHours(hEnd, mEnd, 0);

            if (now >= startTime && now < endTime) {
                if (state === 'Offline') {
                    setShowStartModal(true);
                }
            } else if (now >= endTime) {
                if (state === 'InShift' || state === 'OnBreak') {
                    setShowEndModal(true);
                }
            } else if (now < startTime) {
                // It's before the shift. If state is InShift, it's leftover from yesterday.
                if (state === 'InShift' || state === 'OnBreak') {
                    // Auto-reset or prompt to start clean
                    await logWorkEvent(staffId, 'SHIFT_END');
                    setWorkState('Offline');
                }
            }
        }
    };

    // Poll status periodically
    useEffect(() => {
        if (!user) return;
        const timer = setInterval(() => checkStatus(user.id), 60000); // Every minute
        return () => clearInterval(timer);
    }, [user]);

    const handleAction = async (type: 'SHIFT_START' | 'SHIFT_END' | 'BREAK_END') => {
        setLoading(true);
        await logWorkEvent(user.id, type);
        setWorkState(type === 'SHIFT_START' ? 'InShift' : type === 'SHIFT_END' ? 'Offline' : 'InShift');
        setShowStartModal(false);
        setShowEndModal(false);
        setLoading(false);
        window.location.reload(); // Refresh to update all stats
    };

    if (workState === 'OnBreak') {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(20px)'
            }}>
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '2rem', border: '1px solid hsla(var(--primary)/0.3)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>☕</div>
                    <h2 className="heading" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Şu An Moladasınız</h2>
                    <p style={{ color: 'hsl(var(--fg-secondary))', marginBottom: '2rem' }}>Dinlenme vaktinizin tadını çıkarın. Hazır olduğunuzda mesaiye dönebilirsiniz.</p>
                    <button
                        className="button-premium glow-primary"
                        style={{ width: '100%', padding: '1.2rem' }}
                        onClick={() => handleAction('BREAK_END')}
                        disabled={loading}
                    >
                        {loading ? 'İşleniyor...' : 'Molayı Bitir ve Mesaiye Dön'}
                    </button>
                </div>
            </div>
        );
    }

    if (showStartModal) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9998,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(8px)'
            }}>
                <div className="glass-panel" style={{ padding: '2.5rem', width: '400px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
                    <h3 className="heading" style={{ marginBottom: '1rem' }}>Günaydın, Mesai Başladı!</h3>
                    <p style={{ color: 'hsl(var(--fg-secondary))', marginBottom: '2rem' }}>Çalışma saatiniz geldi. Hazırsanız güne başlayalım mı?</p>
                    <button
                        className="button-premium glow-primary"
                        style={{ width: '100%' }}
                        onClick={() => handleAction('SHIFT_START')}
                        disabled={loading}
                    >
                        {loading ? 'Giriş Yapılıyor...' : 'Mesaiye Başla'}
                    </button>
                </div>
            </div>
        );
    }

    if (showEndModal) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9998,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(8px)'
            }}>
                <div className="glass-panel" style={{ padding: '2.5rem', width: '400px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌙</div>
                    <h3 className="heading" style={{ marginBottom: '1rem' }}>Mesai Sonu Geldi</h3>
                    <p style={{ color: 'hsl(var(--fg-secondary))', marginBottom: '2rem' }}>Bugün harikaydın! Artık dinlenme vakti.</p>
                    <button
                        className="button-premium glow-primary"
                        style={{ width: '100%' }}
                        onClick={() => handleAction('SHIFT_END')}
                        disabled={loading}
                    >
                        {loading ? 'Çıkış Yapılıyor...' : 'Günü Bitir (Mesai Sonu)'}
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
