'use client';

import React from 'react';
import styles from "../dashboard/page.module.css";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="animate-fade-in">
            <header className={styles.header}>
                <div>
                    <h1 className="heading" style={{ fontSize: '2rem' }}>Ayarlar</h1>
                    <p style={{ color: 'hsl(var(--fg-secondary))', fontSize: '0.95rem' }}>Aura Beauty • Sistem ve Uygulama Yapılandırması</p>
                </div>
            </header>

            <div className={styles.grid2Col}>
                <section className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 className="heading" style={{ marginBottom: '1.5rem' }}>Genel Ayarlar</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Merkez Adı</label>
                            <input type="text" className="input-premium" defaultValue="Aura Beauty Center" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>İletişim Numarası</label>
                            <input type="text" className="input-premium" defaultValue="+90 212 555 00 00" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Tema Tercihi</label>
                            <select
                                className="input-premium"
                                value={theme}
                                onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
                            >
                                <option value="dark">Koyu (Elite Dark)</option>
                                <option value="light">Açık (Sleek Light)</option>
                            </select>
                        </div>
                        <button className="button-premium glow-primary" style={{ marginTop: '1rem' }} onClick={() => alert('Ayarlar kaydedildi!')}>Değişiklikleri Kaydet</button>
                    </div>
                </section>

                <section className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 className="heading" style={{ marginBottom: '1.5rem' }}>n8n & WhatsApp Entegrasyonu</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--fg-secondary))', marginBottom: '1rem' }}>
                                WhatsApp mesajlarını almak için n8n webhook URL'sini buraya bağlayın.
                            </p>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Webhook Endpoint</label>
                            <input type="text" className="input-premium" readOnly defaultValue="https://aura-beauty.app/api/webhook" />
                        </div>
                        <div style={{ padding: '1rem', background: 'hsla(var(--primary) / 0.05)', borderRadius: 'var(--radius-md)', border: '1px dashed hsla(var(--primary) / 0.2)' }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'hsl(var(--primary))' }}>Entegrasyon Durumu</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem' }}>Aktif & Kararlı</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
