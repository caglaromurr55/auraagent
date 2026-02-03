import React from 'react';

export const metadata = {
    title: 'Randevu Al | Aura Beauty',
    description: 'Aura Beauty uzmanlarından kolayca randevu alın.',
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ minHeight: '100vh', background: 'hsl(var(--bg-primary))' }}>
            {children}
        </div>
    );
}
