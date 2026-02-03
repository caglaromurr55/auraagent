'use client';

import React, { useState } from 'react';
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="dashboard-container">
            {/* Mobile Header */}
            <header className="mobile-header">
                <button
                    className={`hamburger-btn ${isSidebarOpen ? 'active' : ''}`}
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Menüyü Aç"
                >
                    <div className="hamburger-box">
                        <span className="hamburger-inner"></span>
                    </div>
                </button>
                <h2 className="mobile-logo">AURA</h2>
                <div style={{ width: '40px' }} /> {/* Spacer for centering logo */}
            </header>

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="main-content">
                {children}
            </main>

            <style jsx>{`
                .mobile-header {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: var(--header-height);
                    background: hsla(var(--bg-secondary) / 0.8);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid hsl(var(--border));
                    z-index: 80;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 1.5rem;
                }

                .hamburger-btn {
                    background: transparent;
                    border: none;
                    color: hsl(var(--fg-primary));
                    cursor: pointer;
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    position: relative;
                }

                .hamburger-box {
                    width: 24px;
                    height: 18px;
                    display: inline-block;
                    position: relative;
                }

                .hamburger-inner,
                .hamburger-inner::before,
                .hamburger-inner::after {
                    width: 24px;
                    height: 2px;
                    background-color: hsl(var(--fg-primary));
                    border-radius: 4px;
                    position: absolute;
                    transition: all 0.3s ease;
                }

                .hamburger-inner {
                    top: 50%;
                    transform: translateY(-50%);
                }

                .hamburger-inner::before {
                    content: "";
                    top: -8px;
                }

                .hamburger-inner::after {
                    content: "";
                    top: 8px;
                }

                .hamburger-btn.active .hamburger-inner {
                    background-color: transparent;
                }

                .hamburger-btn.active .hamburger-inner::before {
                    transform: translateY(8px) rotate(45deg);
                }

                .hamburger-btn.active .hamburger-inner::after {
                    transform: translateY(-8px) rotate(-45deg);
                }

                .mobile-logo {
                    font-size: 1.2rem;
                    letter-spacing: 0.3em;
                    font-weight: 800;
                    background: linear-gradient(to right, hsl(var(--primary)), #fff);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .main-content {
                    padding: 2.5rem;
                    overflow-y: auto;
                    height: 100vh;
                    width: 100%;
                    transition: padding 0.3s ease;
                }

                @media (max-width: 1024px) {
                    .mobile-header {
                        display: flex;
                    }
                    .main-content {
                        padding: 1.5rem;
                        height: calc(100vh - var(--header-height));
                    }
                }
            `}</style>
        </div>
    );
}
