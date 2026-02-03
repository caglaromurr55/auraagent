'use client';

import React, { useState, useEffect } from 'react';
import { createStaff, updateStaff, deleteStaff } from '@/lib/actions';

interface StaffMember {
    id: number;
    name: string;
    role: string;
    status: string;
    color: string;
    email?: string;
    password?: string;
}

interface StaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    member?: StaffMember | null;
}

const IconUser = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const IconBriefcase = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
);

const IconActivity = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
);

const IconPalette = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
        <circle cx="13.5" cy="6.5" r=".5"></circle>
        <circle cx="17.5" cy="10.5" r=".5"></circle>
        <circle cx="8.5" cy="7.5" r=".5"></circle>
        <circle cx="6.5" cy="12.5" r=".5"></circle>
        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10c.4 0 .75-.12 1.05-.33.29-.22.46-.54.5-.91.07-.65.62-1.15 1.27-1.15H17c2.76 0 5-2.24 5-5 0-4.42-4.03-8-10-8z"></path>
    </svg>
);

const IconMail = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
);

const IconLock = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

export default function StaffModal({ isOpen, onClose, member }: StaffModalProps) {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [status, setStatus] = useState('Available');
    const [color, setColor] = useState('#4F46E5');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (member) {
            setName(member.name);
            setRole(member.role);
            setStatus(member.status);
            setColor(member.color);
            setEmail(member.email || '');
            setPassword(member.password || '');
        } else {
            setName('');
            setRole('');
            setStatus('Available');
            setColor('#4F46E5');
            setEmail('');
            setPassword('');
        }
    }, [member, isOpen]);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const data = { name, role, status, color, email, password };

            if (member) {
                await updateStaff(member.id, data);
            } else {
                await createStaff(data);
            }
            onClose();
        } catch (error) {
            console.error('Error saving staff:', error);
            alert('Personel kaydedilirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!member) return;
        if (!confirm('Bu personeli silmek istediğinize emin misiniz?')) return;

        setLoading(true);
        try {
            await deleteStaff(member.id);
            onClose();
        } catch (error) {
            console.error('Error deleting staff:', error);
            alert('Personel silinirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }

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
                width: '100%',
                maxWidth: '420px',
                padding: '2rem 1.5rem',
                margin: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                position: 'relative',
                border: '1px solid hsla(var(--primary) / 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                maxHeight: 'calc(100vh - 3rem)',
                overflowY: 'auto'
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
                    <IconUser />
                    {member ? 'Personeli Düzenle' : 'Yeni Personel Ekle'}
                </h3>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--fg-secondary))' }}>
                            <IconUser /> Ad Soyad
                        </label>
                        <input
                            type="text"
                            className="input-premium"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Örn: Selin Aydın"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--fg-secondary))' }}>
                            <IconBriefcase /> Rol / Uzmanlık
                        </label>
                        <input
                            type="text"
                            className="input-premium"
                            required
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="Örn: Cilt Bakımı Uzmanı"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--fg-secondary))' }}>
                                <IconMail /> Giriş E-postası
                            </label>
                            <input
                                type="email"
                                className="input-premium"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="uzman@aurabeauty.com"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--fg-secondary))' }}>
                                <IconLock /> Giriş Şifresi
                            </label>
                            <input
                                type="password"
                                className="input-premium"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--fg-secondary))' }}>
                            <IconPalette /> Personel Rengi
                        </label>
                        <input
                            type="color"
                            className="input-premium"
                            style={{ padding: '0.2rem', height: '42px', cursor: 'pointer' }}
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button
                            type="submit"
                            className="button-premium glow-primary"
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {loading ? 'İşleniyor...' : (member ? 'Personel Bilgilerini Güncelle' : 'Personeli Kaydet')}
                        </button>

                        {member && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={loading}
                                style={{
                                    background: 'none',
                                    border: '1px solid hsla(var(--error) / 0.3)',
                                    color: 'hsl(var(--error))',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                }}
                            >
                                Personeli Sistemden Sil
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
