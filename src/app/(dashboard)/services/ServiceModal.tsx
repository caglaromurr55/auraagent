'use client';

import React, { useState, useEffect } from 'react';
import { createService, updateService, deleteService } from '@/lib/actions';

interface Service {
    id: number;
    name: string;
    price: number;
    duration: number;
}

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    service?: Service | null;
}

const IconPackage = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
);

const IconTag = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
        <line x1="7" y1="7" x2="7.01" y2="7"></line>
    </svg>
);

const IconClock = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

export default function ServiceModal({ isOpen, onClose, service }: ServiceModalProps) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (service) {
            setName(service.name);
            setPrice(service.price.toString());
            setDuration(service.duration.toString());
        } else {
            setName('');
            setPrice('');
            setDuration('');
        }
    }, [service, isOpen]);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const data = {
                name,
                price: parseFloat(price),
                duration: parseInt(duration),
            };

            if (service) {
                await updateService(service.id, data);
            } else {
                await createService(data);
            }
            onClose();
        } catch (error) {
            console.error('Error saving service:', error);
            alert('Hizmet kaydedilirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!service) return;
        if (!confirm('Bu hizmeti silmek istediğinize emin misiniz?')) return;

        setLoading(true);
        try {
            await deleteService(service.id);
            onClose();
        } catch (error) {
            console.error('Error deleting service:', error);
            alert('Hizmet silinirken bir hata oluştu.');
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
                    <IconPackage />
                    {service ? 'Hizmeti Düzenle' : 'Yeni Hizmet Ekle'}
                </h3>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--fg-secondary))' }}>
                            <IconTag /> Hizmet Adı
                        </label>
                        <input
                            type="text"
                            className="input-premium"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Örn: Klasik Cilt Bakımı"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--fg-secondary))' }}>
                                <IconTag /> Fiyat (₺)
                            </label>
                            <input
                                type="number"
                                className="input-premium"
                                required
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="450"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--fg-secondary))' }}>
                                <IconClock /> Süre (Dk)
                            </label>
                            <input
                                type="number"
                                className="input-premium"
                                required
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="60"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                        <button
                            type="submit"
                            className="button-premium glow-primary"
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {loading ? 'İşleniyor...' : (service ? 'Hizmeti Güncelle' : 'Hizmeti Kaydet')}
                        </button>

                        {service && (
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
                                Hizmeti Sistemden Sil
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
