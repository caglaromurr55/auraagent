'use client';

import React, { useState } from 'react';
import AppointmentModal from "./AppointmentModal";

export default function AppointmentModalWrapper({ onUpdate }: { onUpdate?: () => void }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="button-premium glow-primary" onClick={() => setIsOpen(true)}>
                <span>+</span> Yeni Randevu Oluştur
            </button>
            <AppointmentModal isOpen={isOpen} onClose={() => { setIsOpen(false); onUpdate?.(); }} />
        </div>
    );
}
