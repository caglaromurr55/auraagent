'use client';

import React, { useState, useEffect } from 'react';
import styles from './login.module.css';
import { useRouter } from 'next/navigation';
import { loginUser, ensureAdminExists } from '@/lib/actions';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Ensure admin exists on first mount in development/demo
    useEffect(() => {
        ensureAdminExists();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await loginUser(email, password);
            if (result.success && result.user) {
                localStorage.setItem('aura_user', JSON.stringify(result.user));
                router.push('/dashboard');
            } else {
                setError(result.error || 'Giriş başarısız.');
            }
        } catch (err) {
            setError('Sistem hatası. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Abstract background elements for premium feel */}
            <div className={styles.orb1}></div>
            <div className={styles.orb2}></div>

            <div className={`${styles.card} glass-panel animate-fade-in`}>
                <div className={styles.header}>
                    <h1 className={styles.logo}>AURA BEAUTY</h1>
                    <p className={styles.subtitle}>Yönetim ve Otomasyon Portalı</p>
                </div>

                <form className={styles.form} onSubmit={handleLogin}>
                    {error && <div style={{ color: 'hsl(var(--error))', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>}

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>E-posta Adresi</label>
                        <input
                            type="email"
                            className="input-premium"
                            placeholder="admin@aurabeauty.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label className={styles.label}>Şifre</label>
                            <span className={styles.forgot}>Şifremi Unuttum</span>
                        </div>
                        <input
                            type="password"
                            className="input-premium"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="button-premium glow-primary"
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Giriş Yapılıyor...' : 'Sisteme Giriş Yap'}
                    </button>

                    <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'hsl(var(--fg-secondary))', textAlign: 'center' }}>
                        Demo: admin@aurabeauty.com / password123
                    </div>
                </form>

                <div className={styles.footer}>
                    <p>Desteğe mi ihtiyacınız var? <span className={styles.link}>Bize ulaşın</span></p>
                </div>
            </div>

            <div className={styles.copyright}>
                © 2026 Aura Beauty Systems. Tüm hakları saklıdır.
            </div>
        </div>
    );
}
