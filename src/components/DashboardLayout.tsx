import React from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
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
