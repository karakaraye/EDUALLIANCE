'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Mock login handler
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Login attempt', { email, password });
        // Navigate to dashboard or show error
        window.location.href = '/';
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

                        <form onSubmit={handleLogin} className="flex flex-col gap-5">

                            <div className="flex flex-col gap-1.5">
                                <label className="text-slate-300 text-xs font-bold ml-1">Email Address</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-teal transition-colors text-[20px]">mail</span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        className="w-full h-12 pl-12 pr-4 bg-[#0f1115] border border-border-subtle rounded-lg text-strong text-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal outline-none transition-all placeholder:text-slate-600"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-slate-300 text-xs font-bold">Password</label>
                                    <a href="#" className="text-brand-teal text-xs font-bold hover:text-strong transition-colors">Forgot?</a>
                                </div>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-teal transition-colors text-[20px]">lock</span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full h-12 pl-12 pr-12 bg-[#0f1115] border border-border-subtle rounded-lg text-strong text-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal outline-none transition-all placeholder:text-slate-600"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-strong transition-colors flex items-center justify-center"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogin}
                                className="mt-2 w-full h-12 bg-gradient-to-r from-[#06b6d4] to-[#288a72] hover:from-[#0891b2] hover:to-[#227560] text-strong font-bold rounded-lg shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                Secure Login
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </button>

                        </form>

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
