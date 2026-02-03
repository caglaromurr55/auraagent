'use client';

import React, { useState, useEffect } from 'react';
import { updateStaffShift } from '@/lib/actions';

interface Shift {
    id?: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
}

interface StaffMember {
    id: number;
    name: string;
    shifts: Shift[];
}

interface ShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    staff: StaffMember | null;
}

const DAYS = [
    'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'
];

export default function ShiftModal({ isOpen, onClose, staff }: ShiftModalProps) {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (staff) {
            // Initialize 7 days
            const fullShifts = Array.from({ length: 7 }, (_, i) => {
                const existing = (staff.shifts || []).find((s: any) => s.dayOfWeek === i);
                return existing || { dayOfWeek: i, startTime: '09:00', endTime: '18:00', isActive: true };
            });
            setShifts(fullShifts);
        }
    }, [staff, isOpen]);

    if (!isOpen || !staff) return null;

    const handleUpdateShift = (day: number, field: string, value: any) => {
        setShifts(prev => prev.map(s => s.dayOfWeek === day ? { ...s, [field]: value } : s));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            for (const shift of shifts) {
                await updateStaffShift(staff.id, shift.dayOfWeek, {
                    startTime: shift.startTime,
                    endTime: shift.endTime,
                    isActive: shift.isActive
                });
            }
            onClose();
        } catch (error) {
            console.error("Save shifts error:", error);
            alert("Vardiyalar kaydedilirken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(12px)',
        }}>
            <div className="glass-panel animate-fade-in" style={{
                width: '100%',
                maxWidth: '600px',
                padding: '1.5rem',
                margin: '1rem',
                borderRadius: 'var(--radius-lg)',
                maxHeight: 'calc(100vh - 2rem)',
                overflowY: 'auto'
            }}>
                <h3 className="heading" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    📅 {staff.name} - Haftalık Çalışma Saatleri
                </h3>

                <div className="shift-grid-container">
                    {shifts.map((shift) => (
                        <div key={shift.dayOfWeek} className="shift-row">
                            <span className="day-label">{DAYS[shift.dayOfWeek]}</span>

                            <div className="time-inputs">
                                <input
                                    type="time"
                                    className="input-premium"
                                    value={shift.startTime}
                                    onChange={(e) => handleUpdateShift(shift.dayOfWeek, 'startTime', e.target.value)}
                                    disabled={!shift.isActive}
                                />
                                <input
                                    type="time"
                                    className="input-premium"
                                    value={shift.endTime}
                                    onChange={(e) => handleUpdateShift(shift.dayOfWeek, 'endTime', e.target.value)}
                                    disabled={!shift.isActive}
                                />
                            </div>

                            <div className="status-toggle">
                                <input
                                    type="checkbox"
                                    checked={shift.isActive}
                                    onChange={(e) => handleUpdateShift(shift.dayOfWeek, 'isActive', e.target.checked)}
                                />
                                <span className="status-text" data-active={shift.isActive}>
                                    {shift.isActive ? 'Açık' : 'Kapalı'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <style jsx>{`
                    .shift-grid-container {
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .shift-row {
                        display: grid;
                        grid-template-columns: 120px 1fr 100px;
                        gap: 1rem;
                        align-items: center;
                        padding: 0.75rem;
                        background: hsla(var(--primary) / 0.05);
                        border-radius: var(--radius-md);
                        border: 1px solid hsla(var(--border) / 0.5);
                    }

                    .day-label {
                        fontWeight: 700;
                        fontSize: 0.9rem;
                    }

                    .time-inputs {
                        display: flex;
                        gap: 0.5rem;
                    }

                    .status-toggle {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        justify-content: flex-end;
                    }

                    .status-text {
                        fontSize: 0.85rem;
                        fontWeight: 600;
                        width: 45px;
                        color: hsl(var(--fg-secondary));
                    }

                    .status-text[data-active="true"] {
                        color: hsl(var(--primary));
                    }

                    @media (max-width: 600px) {
                        .shift-row {
                            grid-template-columns: 1fr;
                            gap: 0.75rem;
                        }
                        
                        .status-toggle {
                            justify-content: flex-start;
                            padding-top: 0.5rem;
                            border-top: 1px solid hsla(var(--border) / 0.3);
                        }

                        .time-inputs {
                            width: 100%;
                        }
                        
                        .time-inputs input {
                            flex: 1;
                        }
                    }
                `}</style>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <button className="button-premium glow-primary" style={{ flex: 1 }} onClick={handleSave} disabled={loading}>
                        {loading ? 'Kaydediliyor...' : 'Vardiyaları Kaydet'}
                    </button>
                    <button className="button-premium" style={{ background: 'none' }} onClick={onClose}>
                        İptal
                    </button>
                </div>
            </div>
        </div>
    );
}
