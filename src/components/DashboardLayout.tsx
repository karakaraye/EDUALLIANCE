'use client';

import React, { useEffect, useState } from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem('edualliance_wipe_v2')) {
            localStorage.clear();
            localStorage.setItem('edualliance_wipe_v2', 'true');
            window.location.reload();
            return;
        }

        const role = localStorage.getItem('edualliance_role');
        if (!role) {
            window.location.href = '/';
            return;
        }

        const path = window.location.pathname;

        if (role === 'ADMIN') {
            setAuthorized(true);
        } else if (role === 'LOANS') {
            if (path.startsWith('/loans') || path === '/loans') {
                setAuthorized(true);
            } else {
                window.location.href = '/loans';
            }
        } else if (role === 'INVESTORS') {
            if (path.startsWith('/investors') || path === '/investors') {
                setAuthorized(true);
            } else {
                window.location.href = '/investors';
            }
        } else if (role === 'FINANCE') {
            if (path.startsWith('/expenses') || path.startsWith('/payroll')) {
                setAuthorized(true);
            } else {
                window.location.href = '/expenses';
            }
        } else {
            localStorage.removeItem('edualliance_role');
            window.location.href = '/';
        }
    }, []);

    if (!authorized) return null;

    return (
        <div className="bg-surface text-slate-300 min-h-screen font-display flex flex-col">
            <Navigation />
            <main className="flex-1 px-6 lg:px-10 py-10 max-w-[1920px] mx-auto w-full animate-in fade-in duration-500">
                {children}
            </main>
            <Footer />
        </div>
    );
};
