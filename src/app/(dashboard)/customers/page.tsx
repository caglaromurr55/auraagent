'use client';

import React, { useState, useEffect } from 'react';
import { getCustomersForStaff } from "@/lib/actions";
import styles from "../dashboard/page.module.css";
import CustomerModal from "./CustomerModal";

interface Customer {
    id: number;
    name: string;
    phone: string;
    email?: string | null;
    createdAt: Date;
    _count: {
        appointments: number;
    };
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCustomers = async (staffId?: number) => {
        setLoading(true);
        try {
            const data = await getCustomersForStaff(staffId) as any;
            setCustomers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const storedUser = localStorage.getItem('aura_user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            fetchCustomers(parsed.role === 'Staff' ? parsed.id : undefined);
        } else {
            fetchCustomers();
        }
    }, []);

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedCustomer(null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        fetchCustomers(user?.role === 'Staff' ? user.id : undefined);
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );

    return (
        <div className="animate-fade-in">
            <header className={styles.header}>
                <div>
                    <h1 className="heading" style={{ fontSize: '2rem' }}>
                        {user?.role === 'Staff' ? 'Müşterilerim' : 'Müşteri Portföyü'}
                    </h1>
                    <p style={{ color: 'hsl(var(--fg-secondary))', fontSize: '0.95rem' }}>Aura Beauty • CRM Sistemi</p>
                </div>
                {user?.role === 'Admin' && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="button-premium glow-primary" onClick={handleAdd}>
                            <span>+</span> Yeni Müşteri Ekle
                        </button>
                    </div>
                )}
            </header>

            <section className="glass-panel" style={{ padding: '1.5rem 1rem' }}>
                <div className={styles.tableActions}>
                    <h3 className="heading">Müşteri Listesi</h3>
                    <div className={styles.searchWrapper}>
                        <input
                            type="text"
                            placeholder="Müşteri ara..."
                            className="input-premium"
                            style={{ width: '100%' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '2rem', color: 'hsl(var(--fg-secondary))' }}>Yükleniyor...</div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="table-container desktop-only">
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>AD SOYAD</th>
                                        <th>TELEFON</th>
                                        <th>E-POSTA</th>
                                        <th>RANDEVU</th>
                                        <th>KAYIT TARİHİ</th>
                                        {user?.role === 'Admin' && <th>İŞLEM</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.map((customer, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600 }}>{customer.name}</td>
                                            <td>{customer.phone}</td>
                                            <td style={{ color: 'hsl(var(--fg-secondary))' }}>{customer.email || '—'}</td>
                                            <td>
                                                <span style={{ fontWeight: 700, color: 'hsl(var(--primary))' }}>
                                                    {customer._count.appointments}
                                                </span>
                                            </td>
                                            <td style={{ color: 'hsl(var(--fg-secondary))', fontSize: '0.85rem' }}>
                                                {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
                                            </td>
                                            {user?.role === 'Admin' && (
                                                <td>
                                                    <button
                                                        className="input-premium"
                                                        style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer' }}
                                                        onClick={() => handleEdit(customer)}
                                                    >
                                                        Düzenle
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="mobile-only">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {filteredCustomers.map((customer, i) => (
                                    <div key={i} className="glass-panel" style={{ padding: '1.25rem', border: '1px solid hsla(var(--border) / 0.5)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{customer.name}</h4>
                                                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'hsl(var(--fg-secondary))' }}>{customer.phone}</p>
                                            </div>
                                            {user?.role === 'Admin' && (
                                                <button
                                                    className="button-premium"
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                                    onClick={() => handleEdit(customer)}
                                                >
                                                    Düzenle
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid hsla(var(--border) / 0.3)' }}>
                                            <div>
                                                <p style={{ margin: 0, fontSize: '0.7rem', color: 'hsl(var(--fg-secondary))', textTransform: 'uppercase', fontWeight: 600 }}>Randevu</p>
                                                <p style={{ margin: 0, fontWeight: 700, color: 'hsl(var(--primary))' }}>{customer._count.appointments}</p>
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontSize: '0.7rem', color: 'hsl(var(--fg-secondary))', textTransform: 'uppercase', fontWeight: 600 }}>Kayıt</p>
                                                <p style={{ margin: 0, fontSize: '0.85rem' }}>{new Date(customer.createdAt).toLocaleDateString('tr-TR')}</p>
                                            </div>
                                        </div>
                                        {customer.email && (
                                            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'hsl(var(--fg-secondary))' }}>
                                                📧 {customer.email}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </section>

            <style jsx>{`
                .mobile-only {
                    display: none;
                }
                @media (max-width: 768px) {
                    .desktop-only {
                        display: none !important;
                    }
                    .mobile-only {
                        display: block !important;
                    }
                }
            `}</style>

            <CustomerModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                customer={selectedCustomer}
            />
        </div>
    );
}
