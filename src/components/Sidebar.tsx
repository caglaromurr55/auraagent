'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';
import { useTheme } from '@/components/ThemeProvider';

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const storedUser = localStorage.getItem('aura_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const menuItems = [
        { label: 'Gösterge Paneli', icon: '📊', path: '/dashboard', roles: ['Admin', 'Staff'] },
        { label: 'Randevularım', icon: '📅', path: '/appointments', roles: ['Staff'] },
        { label: 'Randevu Takvimi', icon: '📅', path: '/appointments', roles: ['Admin'] },
        { label: 'Müşterilerim', icon: '👤', path: '/customers', roles: ['Staff'] },
        { label: 'Müşteri Portföyü', icon: '👤', path: '/customers', roles: ['Admin'] },
        { label: 'WhatsApp Akışı', icon: '💬', path: '/whatsapp', roles: ['Admin'] },
        { label: 'Hizmetler', icon: '✨', path: '/services', roles: ['Admin'] },
        { label: 'Finansal Analiz', icon: '💰', path: '/finance', roles: ['Admin'] },
        { label: 'Gelişmiş Raporlar', icon: '📊', path: '/reports', roles: ['Admin'] },
        { label: 'Booking Kanalı', icon: '🌐', path: '/book', roles: ['Admin'] },
        { label: 'Ekibimiz', icon: '👩‍⚕️', path: '/staff', roles: ['Admin', 'Staff'] },
        { label: 'Sistem Ayarları', icon: '⚙️', path: '/settings', roles: ['Admin'] },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role || 'Staff'));

    const handleLogout = () => {
        localStorage.removeItem('aura_user');
        router.push('/login');
    };

    if (!user) return null;

    return (
        <>
            {isOpen && <div className={styles.overlay} onClick={onClose} />}
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''} glass-panel`}>
                <button className={styles.closeBtn} onClick={onClose}>✕</button>
                <div className={styles.logoContainer}>
                    <h2 className={styles.logo}>AURA</h2>
                </div>

                <nav className={styles.nav}>
                    {filteredMenu.map((item, i) => (
                        <Link
                            key={i}
                            href={item.path}
                            className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
                            onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                        >
                            <span className={styles.icon}>{item.icon}</span>
                            <span className={styles.label}>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className={styles.footer}>
                    <div className={styles.profile}>
                        <div className={styles.avatar} style={{ backgroundColor: user.role === 'Staff' ? 'hsl(var(--primary))' : 'hsl(var(--accent))' }}>
                            {user.name[0]}
                        </div>
                        <div className={styles.info}>
                            <p className={styles.name}>{user.name}</p>
                            <p className={styles.role}>{user.role === 'Admin' ? 'Yönetici' : user.role}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button
                            className={styles.themeToggle}
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            title="Temayı Değiştir"
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <button
                            className={styles.logoutBtn}
                            onClick={handleLogout}
                            style={{ flex: 1 }}
                        >
                            Güvenli Çıkış
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
