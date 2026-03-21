'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function NewLoanPage() {
    const router = useRouter();

    // Form State
    const [name, setName] = useState<string>('');
    const [principal, setPrincipal] = useState<number>(5000);
    const [rate, setRate] = useState<number>(4);
    const [duration, setDuration] = useState<number>(12);

    // Dynamic Calculations
    const interestEarned = principal * (rate / 100) * duration;
    const expectedTotalRepayment = principal + interestEarned;
    const monthlyRepayment = duration > 0 ? expectedTotalRepayment / duration : 0;
    
    // Ratios for the UI bar
    const principalPct = expectedTotalRepayment > 0 ? (principal / expectedTotalRepayment) * 100 : 0;
    const interestPct = expectedTotalRepayment > 0 ? (interestEarned / expectedTotalRepayment) * 100 : 0;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    const handleDisburse = () => {
        // Fetch existing loans or start with empty array if none exist
        const savedLoans = localStorage.getItem('edualliance_loans');
        let currentLoans = [];
        if (savedLoans) {
            try {
                currentLoans = JSON.parse(savedLoans);
            } catch (e) {
                console.error("Failed to parse existing loans.", e);
            }
        }

        // Generate a random ID and format today's date
        const newId = `#L-${Math.floor(Math.random() * 9000 + 1000)}`;
        const disburseDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

        // Create the new loan record
        const newLoan = {
            id: newId,
            name: name || 'New Borrower',
            image: `https://i.pravatar.cc/150?u=${Math.random()}`,
            amount: principal,
            rate: rate,
            durationMonths: duration,
            amountLeft: expectedTotalRepayment, // Initially, they owe the full expected amount
            status: 'Active',
            disburseDate: disburseDate
        };

        // Add to the front of the list
        currentLoans.unshift(newLoan);

        // Save back to storage
        localStorage.setItem('edualliance_loans', JSON.stringify(currentLoans));

        // Redirect to records
        router.push('/loans');
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 max-w-5xl mx-auto">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        <Link href="/loans" className="hover:text-strong transition-colors">Loans</Link>
                        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                        <span>Issuance</span>
                    </div>
                    <h1 className="text-3xl font-black text-strong tracking-tight">New Loan Issuance</h1>
                    <p className="text-slate-500 text-sm mt-1">Initialize a new financial agreement. Ensure all borrower details are verified against legal documentation.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-3 flex flex-col gap-6">

                        {/* Step 1: Borrower Profile */}
                        <div className="bg-panel border border-border-subtle rounded-2xl p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="size-10 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal ring-1 ring-brand-teal/20">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <h3 className="text-lg font-bold text-strong">1. Borrower Profile</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Full Legal Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter full name as per ID" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full h-11 px-4 bg-main border border-border-subtle rounded-lg text-sm text-strong focus:border-brand-teal focus:outline-none transition-colors" 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-400 ml-1">National ID / Passport</label>
                                        <input type="text" placeholder="000-0000-00" className="w-full h-11 px-4 bg-main border border-border-subtle rounded-lg text-sm text-strong focus:border-brand-teal focus:outline-none transition-colors" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-400 ml-1">Contact Number</label>
                                        <input type="text" placeholder="+1 (555) 000-0000" className="w-full h-11 px-4 bg-main border border-border-subtle rounded-lg text-sm text-strong focus:border-brand-teal focus:outline-none transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Loan Terms */}
                        <div className="bg-panel border border-border-subtle rounded-2xl p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/20">
                                    <span className="material-symbols-outlined">attach_money</span>
                                </div>
                                <h3 className="text-lg font-bold text-strong">2. Loan Terms</h3>
                            </div>

                            <div className="grid grid-cols-3 gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Principal Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₦</span>
                                        <input 
                                            type="number" 
                                            value={principal} 
                                            onChange={(e) => setPrincipal(Number(e.target.value))}
                                            className="w-full h-11 pl-8 pr-4 bg-main border border-border-subtle rounded-lg text-sm text-strong focus:border-primary focus:outline-none transition-colors" 
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Annual Interest Rate (%)</label>
                                    <input 
                                        type="number" 
                                        value={rate} 
                                        onChange={(e) => setRate(Number(e.target.value))}
                                        className="w-full h-11 px-4 bg-main border border-border-subtle rounded-lg text-sm text-strong focus:border-primary focus:outline-none transition-colors" 
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Duration (Months)</label>
                                    <input 
                                        type="number" 
                                        value={duration} 
                                        onChange={(e) => setDuration(Number(e.target.value))}
                                        className="w-full h-11 px-4 bg-main border border-border-subtle rounded-lg text-sm text-strong focus:border-primary focus:outline-none transition-colors" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Repayment Settings */}
                        <div className="bg-panel border border-border-subtle rounded-2xl p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="size-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 ring-1 ring-purple-500/20">
                                    <span className="material-symbols-outlined">calendar_month</span>
                                </div>
                                <h3 className="text-lg font-bold text-strong">3. Repayment Settings</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Repayment Frequency</label>
                                    <div className="relative">
                                        <select className="w-full h-11 px-4 bg-main border border-border-subtle rounded-lg text-sm text-strong appearance-none focus:border-purple-500 focus:outline-none transition-colors">
                                            <option>Monthly</option>
                                            <option>Weekly</option>
                                            <option>Bi-Weekly</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1">First Due Date</label>
                                    <div className="relative">
                                        <input type="date" className="w-full h-11 px-4 bg-main border border-border-subtle rounded-lg text-sm text-slate-400 focus:border-purple-500 focus:outline-none transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-panel border border-border-subtle rounded-xl p-6 sticky top-24">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-brand-teal">calculate</span>
                                <h3 className="text-base font-bold text-strong">Loan Summary</h3>
                            </div>

                            <div className="flex justify-between items-end mb-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Principal</span>
                                    <span className="text-xl font-bold text-strong">{formatCurrency(principal)}</span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total Interest</span>
                                    <span className="text-xl font-bold text-primary">{formatCurrency(interestEarned)}</span>
                                </div>
                            </div>

                            <div className="p-4 bg-main rounded-lg border border-border-subtle mb-6">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-1">Monthly Installment</span>
                                <div className="flex items-baseline gap-1 break-all">
                                    <span className="text-3xl font-black text-brand-teal">{formatCurrency(monthlyRepayment)}</span>
                                    <span className="text-xs text-slate-500 font-bold">/ month</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 mb-6">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                                    <span>Interest to Principal Ratio</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                                    <div className="h-full bg-slate-500 transition-all duration-300" style={{ width: `${principalPct}%` }}></div>
                                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${interestPct}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                                    <span className="text-slate-500">Principal ({principalPct.toFixed(0)}%)</span>
                                    <span className="text-primary">Interest ({interestPct.toFixed(0)}%)</span>
                                </div>
                            </div>

                            <div className="space-y-3 border-t border-border-subtle pt-5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Total Repayment</span>
                                    <span className="font-bold text-strong">{formatCurrency(expectedTotalRepayment)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Payback Period</span>
                                    <span className="font-bold text-strong">{duration} Months</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">One-off Fee (6.5%)</span>
                                    <span className="font-bold text-strong">{formatCurrency(principal * 0.065)}</span>
                                </div>
                            </div>

                            <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-[10px] leading-relaxed flex gap-2">
                                <span className="material-symbols-outlined text-[14px] shrink-0">info</span>
                                This calculation includes a 6.5% processing fee which will be deducted from the initial disbursement.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-border-subtle">
                    <button className="px-6 py-3 rounded-lg border border-border-subtle text-slate-300 text-sm font-bold hover:bg-white/5 transition-all">Save Draft</button>
                    <button onClick={handleDisburse} className="px-6 py-3 rounded-lg bg-brand-teal hover:bg-teal-600 text-strong text-sm font-bold shadow-lg shadow-teal-900/20 transition-all">Disburse Loan</button>
                </div>

            </div>
        </DashboardLayout>
    );
}
