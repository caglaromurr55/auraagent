'use client';

import React, { useState, useEffect } from 'react';
import styles from './whatsapp.module.css';
import { getConversations, getChatMessages } from '@/lib/actions';

export default function WhatsAppPage() {
    const [activeChat, setActiveChat] = useState<number | null>(null);
    const [conversations, setConversations] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function init() {
            const convs = await getConversations();
            setConversations(convs);
            if (convs.length > 0) {
                setActiveChat(convs[0].id);
            }
            setLoading(false);
        }
        init();
    }, []);

    useEffect(() => {
        if (activeChat !== null) {
            async function fetchMsgs() {
                // Find by customer ID
                const msgs = await getChatMessages(activeChat ?? undefined);
                setMessages(msgs);
            }
            fetchMsgs();
        }
    }, [activeChat]);

    if (loading) return <div style={{ padding: '2rem' }}>Yükleniyor...</div>;

    const currentChatCustomer = conversations.find(c => c.id === activeChat);

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h1 className="heading" style={{ fontSize: '2rem' }}>n8n WhatsApp Akışı</h1>
                <p style={{ color: 'hsl(var(--fg-secondary))' }}>Otomasyon ve Müşteri Mesajları</p>
            </header>

            <div className={styles.container}>
                {/* Chat List Sidebar */}
                <div className={`glass-panel ${styles.chatList}`}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))' }}>
                        <input type="text" placeholder="Mesaj ara..." className="input-premium" style={{ fontSize: '0.85rem' }} />
                    </div>
                    {conversations.map((chat) => (
                        <div
                            key={chat.id}
                            className={`${styles.chatItem} ${activeChat === chat.id ? styles.active : ''}`}
                            onClick={() => setActiveChat(chat.id)}
                        >
                            <div className={styles.avatar}>{chat.name[0]}</div>
                            <div className={styles.chatInfo}>
                                <div className={styles.chatHeader}>
                                    <span className={styles.name}>{chat.name}</span>
                                    <span className={styles.time}>
                                        {chat.messages?.[0]?.time ? new Date(chat.messages[0].time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>
                                <p className={styles.lastMsg}>{chat.messages?.[0]?.text || 'Mesaj yok'}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Window */}
                <div className={`glass-panel ${styles.messageView}`}>
                    {currentChatCustomer ? (
                        <>
                            <div className={styles.viewHeader}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div className={styles.avatar} style={{ width: '40px', height: '40px' }}>{currentChatCustomer.name[0]}</div>
                                    <div>
                                        <p style={{ fontWeight: 700, fontSize: '1rem' }}>{currentChatCustomer.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'hsl(var(--success))' }}>• Çevrimiçi</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="input-premium" style={{ width: 'auto', padding: '0.5rem 0.75rem' }}>📞 Ara</button>
                                    <button className="button-premium" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Randevu Oluştur</button>
                                </div>
                            </div>

                            <div className={styles.messages}>
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`${styles.messageBubble} ${styles[msg.type as 'incoming' | 'outgoing']}`}>
                                        {msg.text}
                                        <span className={styles.msgTime}>
                                            {new Date(msg.time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.inputArea}>
                                <input type="text" placeholder="Mesaj yazın..." className="input-premium" />
                                <button className="button-premium glow-primary" onClick={() => alert('Demo sürümünde mesaj gönderme n8n üzerinden simüle edilir.')}>Gönder</button>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifySelf: 'center', color: 'hsl(var(--fg-secondary))' }}>
                            Mesajlaşmak için bir konuşma seçin
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
