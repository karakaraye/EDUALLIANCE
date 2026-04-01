'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LoginPage() {
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        sessionStorage.removeItem('edualliance_role');
        localStorage.removeItem('edualliance_role'); // Clean up any lingering data
    }, []);

    const handleLogin = (role: string) => {
        sessionStorage.setItem('edualliance_role', role);
        if (role === 'ADMIN') window.location.href = '/dashboard';
        else if (role === 'LOANS') window.location.href = '/loans';
        else if (role === 'INVESTORS') window.location.href = '/investors';
        else if (role === 'FINANCE') window.location.href = '/expenses';
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const credentials: Record<string, string> = {
            'ADMIN': 'admin123',
            'LOANS': 'loans123',
            'INVESTORS': 'investors123',
            'FINANCE': 'finance123'
        };

        if (selectedRole && password === credentials[selectedRole]) {
            handleLogin(selectedRole);
        } else {
            setError('Incorrect password. Please try again.');
        }
    };

    const roleDetails: Record<string, { title: string, subtitle: string, icon: string, color: string, bg: string }> = {
        'ADMIN': { title: 'Administrator', subtitle: 'Full System Access', icon: 'admin_panel_settings', color: 'text-primary', bg: 'bg-primary/20' },
        'LOANS': { title: 'Loan Officer', subtitle: 'Loans Module Only', icon: 'payments', color: 'text-brand-teal', bg: 'bg-brand-teal/20' },
        'INVESTORS': { title: 'Investor Rep', subtitle: 'Investors Module Only', icon: 'handshake', color: 'text-purple-400', bg: 'bg-purple-500/20' },
        'FINANCE': { title: 'Finance Dept', subtitle: 'Payroll & Expenses', icon: 'receipt_long', color: 'text-yellow-500', bg: 'bg-yellow-500/20' }
    };

    return (
        <div className="min-h-screen flex flex-col bg-surface font-display relative overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-teal/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Header */}
            <header className="px-10 py-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    {/* Logo Icon */}
                    <div className="size-9 bg-brand-teal rounded-lg flex items-center justify-center text-strong shadow-lg shadow-brand-teal/20">
                        <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                    </div>
                    <h1 className="text-strong text-xl font-extrabold tracking-tight">Edualliance</h1>
                </div>
                <div className="flex gap-4">
                    <button className="px-5 py-2 rounded-lg border border-border-subtle text-slate-400 text-sm font-bold hover:text-strong hover:bg-white/5 transition-all">
                        Support
                    </button>
                    <button className="px-5 py-2 rounded-lg bg-[#06b6d4] text-strong text-sm font-bold hover:bg-[#0891b2] transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        Need help?
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6 z-10 relative">
                <div className="w-full max-w-[420px]">
                    {/* Card */}
                    <div className="bg-panel border border-border-subtle rounded-2xl p-10 shadow-2xl relative overflow-hidden">

                        {/* Top Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="size-16 bg-[#1e293b] rounded-2xl flex items-center justify-center border border-border-subtle shadow-inner">
                                <span className="material-symbols-outlined text-brand-teal text-3xl">verified_user</span>
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-strong text-2xl font-bold mb-2">Secure Login</h2>
                            <p className="text-slate-500 text-sm">Access the Edualliance Financial System.</p>
                        </div>

                        {!selectedRole ? (
                            <div className="flex flex-col gap-3">
                                {Object.keys(roleDetails).map((role) => {
                                    const details = roleDetails[role];
                                    return (
                                        <button
                                            key={role}
                                            onClick={() => { setSelectedRole(role); setError(''); setPassword(''); }}
                                            className="w-full h-12 bg-slate-800 border border-slate-700 hover:border-brand-teal hover:bg-slate-800/80 text-strong font-bold rounded-lg transition-all flex items-center gap-3 px-4 group"
                                        >
                                            <div className={`size-8 rounded ${details.bg} ${details.color} flex items-center justify-center shrink-0`}>
                                                <span className="material-symbols-outlined text-[16px]">{details.icon}</span>
                                            </div>
                                            <div className="flex flex-col items-start leading-tight">
                                                <span>{details.title}</span>
                                                <span className="text-[10px] text-slate-400 font-normal">{details.subtitle}</span>
                                            </div>
                                            <span className="material-symbols-outlined ml-auto text-slate-500 group-hover:text-brand-teal transition-colors">arrow_forward</span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-white/5 border border-border-subtle rounded-xl mb-2">
                                        <div className={`size-10 rounded-lg ${roleDetails[selectedRole].bg} ${roleDetails[selectedRole].color} flex items-center justify-center shrink-0`}>
                                            <span className="material-symbols-outlined">{roleDetails[selectedRole].icon}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Logging in as</span>
                                            <span className="text-sm font-bold text-strong">{roleDetails[selectedRole].title}</span>
                                        </div>
                                    </div>
                                    
                                    {error && (
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-lg flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px]">error</span> {error}
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-400">Password</label>
                                        <input 
                                            type="password" 
                                            required
                                            autoFocus
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full h-12 px-4 bg-slate-800 border border-slate-700 rounded-lg text-sm text-strong focus:border-brand-teal focus:outline-none transition-colors"
                                            placeholder="Enter portal password"
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        className="w-full h-12 mt-2 bg-brand-teal hover:bg-teal-600 text-strong font-bold rounded-lg transition-all shadow-lg shadow-teal-900/20 flex items-center justify-center gap-2"
                                    >
                                        Authenticate <span className="material-symbols-outlined text-[18px]">lock_open</span>
                                    </button>

                                    <button 
                                        type="button" 
                                        onClick={() => setSelectedRole(null)}
                                        className="text-xs text-slate-500 hover:text-strong font-bold mt-2 transition-colors"
                                    >
                                        ← Select a different role
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-border-subtle flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                <span className="material-symbols-outlined text-[14px]">verified</span>
                                256-BIT AES ENCRYPTION
                            </div>
                            <p className="text-center text-[10px] text-slate-600 max-w-[280px] leading-relaxed">
                                Authorized personnel only. By logging in, you agree to our <a href="#" className="text-brand-teal hover:underline">Terms of Service</a> and <a href="#" className="text-brand-teal hover:underline">Privacy Policy</a>.
                            </p>
                        </div>

                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 z-10">
                <div className="flex justify-center gap-8 text-slate-500 text-xs font-medium">
                    <a href="#" className="hover:text-strong transition-colors">Network Status</a>
                    <span className="text-slate-700">|</span>
                    <a href="#" className="hover:text-strong transition-colors">Privacy</a>
                    <span className="text-slate-700">|</span>
                    <a href="#" className="hover:text-strong transition-colors">Contact Support</a>
                </div>
            </footer>

            {/* Decorative blurred graphic from image bottom left */}
            <div className="absolute bottom-10 left-10 size-24 opacity-20 pointer-events-none hidden md:block">
                <div className="relative size-full">
                    <div className="absolute inset-0 bg-slate-500 rounded-lg transform rotate-45"></div>
                    <div className="absolute inset-0 bg-slate-800 rounded-full transform scale-50"></div>
                </div>
            </div>

        </div>
    );
}
