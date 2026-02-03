'use client';

import React, { useState, useEffect } from 'react';
import { getServices } from "@/lib/actions";
import styles from "../dashboard/page.module.css";
import ServiceModal from "./ServiceModal";

interface Service {
    id: number;
    name: string;
    price: number;
    duration: number;
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);

    async function fetchServices() {
        setLoading(true);
        const data = await getServices();
        setServices(data);
        setLoading(false);
    }

    useEffect(() => {
        fetchServices();
    }, []);

    const handleEdit = (service: Service) => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedService(null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        fetchServices(); // Refresh list after any change
    };

    return (
        <div className="animate-fade-in">
            <header className={styles.header}>
                <div>
                    <h1 className="heading" style={{ fontSize: '2rem' }}>Hizmetlerimiz</h1>
                    <p style={{ color: 'hsl(var(--fg-secondary))', fontSize: '0.95rem' }}>Aura Beauty • Uygulama ve Fiyat Listesi</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="button-premium glow-primary" onClick={handleAdd}>
                        <span>+</span> Yeni Hizmet Ekle
                    </button>
                </div>
            </header>

            {loading ? (
                <div style={{ padding: '2rem', color: 'hsl(var(--fg-secondary))' }}>Yükleniyor...</div>
            ) : (
                <section className={styles.metricsGrid}>
                    {services.map((service, i) => (
                        <div key={i} className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                            <p style={{ color: 'hsl(var(--primary))', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Hizmet</p>
                            <h3 style={{ fontSize: '1.25rem', margin: '0.5rem 0' }}>{service.name}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>₺{service.price}</span>
                                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--fg-secondary))' }}>{service.duration} dk</span>
                            </div>
                            <button
                                className="input-premium"
                                style={{ width: '100%', marginTop: '1.5rem', cursor: 'pointer' }}
                                onClick={() => handleEdit(service)}
                            >
                                Düzenle
                            </button>
                        </div>
                    ))}
                </section>
            )}

            <ServiceModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                service={selectedService}
            />
        </div>
    );
}
