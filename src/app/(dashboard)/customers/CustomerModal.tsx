'use client';

import React, { useState, useEffect } from 'react';
import { createCustomer, updateCustomer, deleteCustomer } from '@/lib/actions';

interface Customer {
    id: number;
    name: string;
    phone: string;
    email?: string | null;
}

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer?: Customer | null;
}

const IconUser = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const IconPhone = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.28-2.28a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);

const IconMail = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
);

export default function CustomerModal({ isOpen, onClose, customer }: CustomerModalProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (customer) {
            setName(customer.name);
            setPhone(customer.phone);
            setEmail(customer.email || '');
        } else {
            setName('');
            setPhone('');
            setEmail('');
        }
    }, [customer, isOpen]);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const data = {
                name,
                phone,
                email: email || undefined,
            };

            if (customer) {
                await updateCustomer(customer.id, data);
            } else {
                await createCustomer(data);
            }
            onClose();
        } catch (error) {
            console.error('Error saving customer:', error);
            alert('Müşteri kaydedilirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!customer) return;
        if (!confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) return;

        setLoading(true);
        try {
            await deleteCustomer(customer.id);
            onClose();
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('Müşteri silinirken bir hata oluştu.');
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
                width: '420px',
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
                    <IconUser />
                    {customer ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}
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
                            placeholder="Örn: Ayşe Yılmaz"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--fg-secondary))' }}>
                            <IconPhone /> Telefon
                        </label>
                        <input
                            type="text"
                            className="input-premium"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Örn: +90 532 000 00 00"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--fg-secondary))' }}>
                            <IconMail /> E-posta (Opsiyonel)
                        </label>
                        <input
                            type="email"
                            className="input-premium"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ayse@example.com"
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                        <button
                            type="submit"
                            className="button-premium glow-primary"
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {loading ? 'İşleniyor...' : (customer ? 'Müşteri Bilgilerini Güncelle' : 'Müşteriyi Kaydet')}
                        </button>

                        {customer && (
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
                                Müşteriyi Sistemden Sil
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
