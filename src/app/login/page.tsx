'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
    // Mock login handler
    const handleLogin = (role: string) => {
        localStorage.setItem('edualliance_role', role);
        if (role === 'ADMIN') window.location.href = '/';
        else if (role === 'LOANS') window.location.href = '/loans';
        else if (role === 'INVESTORS') window.location.href = '/investors';
        else if (role === 'FINANCE') window.location.href = '/expenses';
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

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => handleLogin('ADMIN')}
                                className="w-full h-12 bg-slate-800 border border-slate-700 hover:border-brand-teal hover:bg-slate-800/80 text-strong font-bold rounded-lg transition-all flex items-center gap-3 px-4 group"
                            >
                                <div className="size-8 rounded bg-primary/20 text-primary flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                                </div>
                                <div className="flex flex-col items-start leading-tight">
                                    <span>Administrator</span>
                                    <span className="text-[10px] text-slate-400 font-normal">Full System Access</span>
                                </div>
                                <span className="material-symbols-outlined ml-auto text-slate-500 group-hover:text-brand-teal transition-colors">arrow_forward</span>
                            </button>
                            <button
                                onClick={() => handleLogin('LOANS')}
                                className="w-full h-12 bg-slate-800 border border-slate-700 hover:border-brand-teal hover:bg-slate-800/80 text-strong font-bold rounded-lg transition-all flex items-center gap-3 px-4 group"
                            >
                                <div className="size-8 rounded bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[16px]">payments</span>
                                </div>
                                <div className="flex flex-col items-start leading-tight">
                                    <span>Loan Officer</span>
                                    <span className="text-[10px] text-slate-400 font-normal">Loans Module Only</span>
                                </div>
                                <span className="material-symbols-outlined ml-auto text-slate-500 group-hover:text-brand-teal transition-colors">arrow_forward</span>
                            </button>
                            <button
                                onClick={() => handleLogin('INVESTORS')}
                                className="w-full h-12 bg-slate-800 border border-slate-700 hover:border-brand-teal hover:bg-slate-800/80 text-strong font-bold rounded-lg transition-all flex items-center gap-3 px-4 group"
                            >
                                <div className="size-8 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[16px]">handshake</span>
                                </div>
                                <div className="flex flex-col items-start leading-tight">
                                    <span>Investor Rep</span>
                                    <span className="text-[10px] text-slate-400 font-normal">Investors Module Only</span>
                                </div>
                                <span className="material-symbols-outlined ml-auto text-slate-500 group-hover:text-brand-teal transition-colors">arrow_forward</span>
                            </button>
                            <button
                                onClick={() => handleLogin('FINANCE')}
                                className="w-full h-12 bg-slate-800 border border-slate-700 hover:border-brand-teal hover:bg-slate-800/80 text-strong font-bold rounded-lg transition-all flex items-center gap-3 px-4 group"
                            >
                                <div className="size-8 rounded bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                                </div>
                                <div className="flex flex-col items-start leading-tight">
                                    <span>Finance Dept</span>
                                    <span className="text-[10px] text-slate-400 font-normal">Payroll & Expenses Only</span>
                                </div>
                                <span className="material-symbols-outlined ml-auto text-slate-500 group-hover:text-brand-teal transition-colors">arrow_forward</span>
                            </button>
                        </div>

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
