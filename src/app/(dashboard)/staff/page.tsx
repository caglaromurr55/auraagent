'use client';

import React, { useState, useEffect } from 'react';
import { getStaffWithShifts } from "@/lib/actions";
import styles from "../dashboard/page.module.css";
import StaffModal from "./StaffModal";
import ShiftModal from "./ShiftModal";

interface StaffMember {
    id: number;
    name: string;
    role: string;
    status: string;
    color: string;
    email?: string;
    shifts?: any[];
}

const DAYS = [
    'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'
];
// SQLite uses 0 for Sunday. Let's map JS 0-6 (Sun-Sat) or custom. 
// My ShiftModal used 0-6 as DAYS = ['Pazar', 'Pazartesi'...]
const JS_DAYS_MAP = [1, 2, 3, 4, 5, 6, 0]; // Monday is index 0 in UI, but 1 in my logic

export default function StaffPage() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('aura_user');
        if (storedUser) {
            try {
                setUserRole(JSON.parse(storedUser).role);
            } catch (e) {
                console.error("User parse error:", e);
            }
        }
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        const data = await getStaffWithShifts();
        setStaff(data as any);
        setLoading(false);
    };

    const handleAddClick = () => {
        setSelectedStaff(null);
        setIsStaffModalOpen(true);
    };

    const handleEditClick = (member: StaffMember) => {
        setSelectedStaff(member);
        setIsStaffModalOpen(true);
    };

    const handleShiftClick = (member: StaffMember) => {
        setSelectedStaff(member);
        setIsShiftModalOpen(true);
    };

    if (loading) return <div style={{ padding: '2rem' }}>Yükleniyor...</div>;

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
            <header className={styles.header}>
                <div>
                    <h1 className="heading" style={{ fontSize: '2rem' }}>Vardiya Takvimi</h1>
                    <p style={{ color: 'hsl(var(--fg-secondary))', fontSize: '0.95rem' }}>Haftalık Çalışma Planı ve Ekip Yönetimi</p>
                </div>
                {userRole === 'Admin' && (
                    <button className="button-premium glow-primary" onClick={handleAddClick} style={{ whiteSpace: 'nowrap' }}>+ Yeni Personel</button>
                )}
            </header>

            {/* Desktop View Table */}
            <div className="glass-panel desktop-only" style={{ marginTop: '1.5rem', overflowX: 'auto', borderRadius: 'var(--radius-lg)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                    <thead>
                        <tr style={{ background: 'hsla(var(--bg-secondary) / 0.5)' }}>
                            <th style={{ padding: '1.5rem', textAlign: 'left', borderBottom: '1px solid hsl(var(--border))', minWidth: '220px' }}>Personel / Uzman</th>
                            {DAYS.map((day, i) => (
                                <th key={i} style={{ padding: '1.5rem', textAlign: 'center', borderBottom: '1px solid hsl(var(--border))' }}>
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map((member) => (
                            <tr key={member.id} style={{ borderBottom: '1px solid hsla(var(--border) / 0.3)' }}>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '50%',
                                            backgroundColor: member.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontWeight: 700, fontSize: '1rem'
                                        }}>
                                            {member.name[0]}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 700, margin: 0 }}>{member.name}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--fg-secondary))' }}>{member.role}</span>
                                                {userRole === 'Admin' && (
                                                    <button
                                                        onClick={() => handleEditClick(member)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: '0.8rem' }}
                                                    >
                                                        ⚙️
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                {JS_DAYS_MAP.map((dayIdx, i) => {
                                    const shift = member.shifts?.find(s => s.dayOfWeek === dayIdx);
                                    const isActive = shift ? shift.isActive : true;

                                    return (
                                        <td key={i} style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div
                                                onClick={userRole === 'Admin' ? () => handleShiftClick(member) : undefined}
                                                style={{
                                                    padding: '0.75rem 0.5rem',
                                                    borderRadius: 'var(--radius-sm)',
                                                    background: isActive ? 'hsla(var(--primary) / 0.05)' : 'hsla(var(--error) / 0.05)',
                                                    border: `1px solid hsla(var(${isActive ? '--primary' : '--error'}) / 0.1)`,
                                                    cursor: userRole === 'Admin' ? 'pointer' : 'default',
                                                    transition: 'all 0.2s',
                                                    minHeight: '52px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center'
                                                }}
                                                className={userRole === 'Admin' ? 'hover-glow' : ''}
                                            >
                                                {isActive ? (
                                                    <>
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--fg-primary))' }}>
                                                            {shift?.startTime || '09:00'}
                                                        </span>
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--fg-primary))' }}>
                                                            {shift?.endTime || '18:00'}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--error))', opacity: 0.7 }}>
                                                        İZİNLİ
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View Cards */}
            <div className="mobile-only" style={{ marginTop: '1.5rem' }}>
                {staff.map((member) => (
                    <div key={member.id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%',
                                    backgroundColor: member.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontWeight: 700, fontSize: '1.2rem'
                                }}>
                                    {member.name[0]}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontWeight: 700 }}>{member.name}</h3>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'hsl(var(--fg-secondary))' }}>{member.role}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {userRole === 'Admin' && (
                                    <>
                                        <button className="button-premium" style={{ padding: '0.5rem', width: '36px', height: '36px' }} onClick={() => handleShiftClick(member)}>📅</button>
                                        <button className="button-premium" style={{ padding: '0.5rem', width: '36px', height: '36px' }} onClick={() => handleEditClick(member)}>⚙️</button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mobile-shift-grid">
                            {JS_DAYS_MAP.map((dayIdx, i) => {
                                const shift = member.shifts?.find(s => s.dayOfWeek === dayIdx);
                                const isActive = shift ? shift.isActive : true;
                                return (
                                    <div key={i} className="mobile-shift-item" style={{
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        background: isActive ? 'hsla(var(--primary) / 0.05)' : 'hsla(var(--error) / 0.05)',
                                        border: `1px solid hsla(var(${isActive ? '--primary' : '--error'}) / 0.1)`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--fg-secondary))', textTransform: 'uppercase' }}>{DAYS[i]}</span>
                                        {isActive ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                                                    {shift?.startTime || '09:00'}
                                                </span>
                                                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                                                    {shift?.endTime || '18:00'}
                                                </span>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--error))' }}>İZİNLİ</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .hover-glow:hover {
                    border-color: hsl(var(--primary)) !important;
                    background: hsla(var(--primary) / 0.1) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px hsla(var(--primary) / 0.1);
                }

                .mobile-only {
                    display: none;
                }

                .mobile-shift-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0.5rem;
                }

                @media (min-width: 1025px) {
                    .desktop-only {
                        display: block;
                    }
                }

                @media (max-width: 1024px) {
                    .desktop-only {
                        display: none !important;
                    }
                    .mobile-only {
                        display: flex !important;
                        flex-direction: column;
                        gap: 1.5rem;
                    }
                }

                @media (max-width: 480px) {
                    .mobile-shift-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
            `}</style>

            <StaffModal
                isOpen={isStaffModalOpen}
                onClose={() => { setIsStaffModalOpen(false); fetchStaff(); }}
                member={selectedStaff}
            />

            <ShiftModal
                isOpen={isShiftModalOpen}
                onClose={() => { setIsShiftModalOpen(false); fetchStaff(); }}
                staff={selectedStaff as any}
            />
        </div>
    );
}
