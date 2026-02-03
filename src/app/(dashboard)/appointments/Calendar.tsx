'use client';

import React, { useState, useEffect } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from 'date-fns';
import { tr } from 'date-fns/locale';
import styles from './calendar.module.css';
import AppointmentModal from './AppointmentModal';
import { getUpcomingAppointments } from '@/lib/actions';

interface CalendarProps {
    initialAppointments: any[];
}

export default function Calendar({ initialAppointments }: CalendarProps) {
    const [appointments, setAppointments] = useState(initialAppointments);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const refreshData = async () => {
        const data = await getUpcomingAppointments();
        setAppointments(data);
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
    };

    const handleAddClick = () => {
        setSelectedAppointment(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (app: any) => {
        setSelectedAppointment(app);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        refreshData();
    };

    const appointmentsForSelectedDay = appointments.filter(app =>
        isSameDay(new Date(app.date || new Date()), selectedDate)
    );

    return (
        <div className={styles.calendarContainer}>
            {/* Main Calendar Card */}
            <div className={`glass-panel ${styles.calendarCard}`}>
                <div className={styles.calendarHeader}>
                    <h2 className={styles.monthTitle}>
                        {format(currentDate, 'MMMM yyyy', { locale: tr })}
                    </h2>
                    <div className={styles.navButtons}>
                        <button onClick={prevMonth} className="input-premium" style={{ width: 'auto', padding: '0.4rem 0.8rem' }}>←</button>
                        <button onClick={() => setCurrentDate(new Date())} className="input-premium" style={{ width: 'auto', padding: '0.4rem 0.8rem' }}>Bugün</button>
                        <button onClick={nextMonth} className="input-premium" style={{ width: 'auto', padding: '0.4rem 0.8rem' }}>→</button>
                    </div>
                </div>

                <div className={styles.grid}>
                    {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                        <div key={day} className={styles.dayHeader}>{day}</div>
                    ))}
                    {calendarDays.map((day, i) => {
                        const dayAppointments = appointments.filter(app => isSameDay(new Date(app.date || new Date()), day));
                        return (
                            <div
                                key={i}
                                className={`
                  ${styles.dayCell} 
                  ${!isSameMonth(day, monthStart) ? styles.notCurrentMonth : ''} 
                  ${isSameDay(day, new Date()) ? styles.today : ''}
                  ${isSameDay(day, selectedDate) ? 'glow-primary' : ''}
                `}
                                onClick={() => handleDayClick(day)}
                                style={{ border: isSameDay(day, selectedDate) ? '1px solid hsl(var(--primary))' : '' }}
                            >
                                <span className={styles.dayNumber}>{format(day, 'd')}</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                                    {dayAppointments.slice(0, 3).map((app, idx) => (
                                        <div key={idx} className={styles.appointmentDot}>
                                            {app.time} {app.customer.name.split(' ')[0]}
                                        </div>
                                    ))}
                                    {dayAppointments.length > 3 && (
                                        <span style={{ fontSize: '0.65rem', color: 'hsl(var(--primary))', paddingLeft: '0.2rem' }}>
                                            +{dayAppointments.length - 3} daha
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Details Side Panel */}
            <div className={`glass-panel ${styles.calendarCard}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="heading">
                        {format(selectedDate, 'd MMMM EEEE', { locale: tr })}
                    </h3>
                    <button
                        className="button-premium"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                        onClick={handleAddClick}
                    >
                        + Ekle
                    </button>
                </div>

                <div className={styles.detailsPane}>
                    {appointmentsForSelectedDay.length > 0 ? (
                        appointmentsForSelectedDay.map((app, i) => (
                            <div
                                key={i}
                                className="glass-panel"
                                style={{ padding: '1rem', background: 'hsla(var(--bg-secondary) / 0.5)', cursor: 'pointer' }}
                                onClick={() => handleEditClick(app)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 800, color: 'hsl(var(--primary))' }}>{app.time}</span>
                                    <span className="statusBadge" data-status={app.status} style={{ fontSize: '0.7rem' }}>{app.status}</span>
                                </div>
                                <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{app.customer.name}</p>
                                <p style={{ fontSize: '0.8rem', color: 'hsl(var(--fg-secondary))' }}>{app.service.name}</p>
                                <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem' }}>📍 {app.room}</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{app.staff.name}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.noAppointments}>
                            <span style={{ fontSize: '2rem', marginBottom: '1rem' }}>📅</span>
                            <p>Bu tarihte randevu bulunmuyor.</p>
                            <button
                                className="button-premium"
                                style={{ marginTop: '1.5rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                                onClick={handleAddClick}
                            >
                                + Randevu Ekle
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <AppointmentModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                appointment={selectedAppointment}
            />
        </div>
    );
}
