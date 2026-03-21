'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { InvestorModal } from '@/components/forms/InvestorModal';
import { InvestorRepaymentsModal } from '@/components/forms/InvestorRepaymentsModal';

export default function InvestorsPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [investors, setInvestors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState(false);

    const fetchInvestors = () => {
        setLoading(true);
        fetch('/api/investors')
            .then(res => res.json())
            .then(data => {
                setInvestors(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch investors:', err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchInvestors();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    const totalInvested = investors.reduce((sum, inv) => sum + Number(inv.amountInvested), 0);
    const totalExpectedReturn = investors.reduce((sum, inv) => sum + Number(inv.amountInvested) + (12 * Number(inv.amountInvested) * (Number(inv.interestRate) / 100)), 0);

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 relative">
                
                <InvestorModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={fetchInvestors} 
                />

                <InvestorRepaymentsModal 
                    isOpen={isRepaymentModalOpen}
                    onClose={() => setIsRepaymentModalOpen(false)}
                    investors={investors}
                />

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                            <span>Portfolio</span>
                            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                            <span>Funding</span>
                        </div>
                        <h1 className="text-3xl font-black text-strong tracking-tight">Investor Roster</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage external capital providers, track total funds injected, and compute expected returns.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsRepaymentModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 text-xs font-bold transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">calendar_month</span> Monthly Repayment
                        </button>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-brand-teal hover:opacity-90 text-strong text-xs font-bold transition-all shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-[18px]">add_notes</span> Add Investor
                        </button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-panel border border-border-subtle rounded-2xl p-6 relative overflow-hidden">
                        <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest block mb-2">Total Funds Raised</span>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-strong">{loading ? '...' : formatCurrency(totalInvested)}</h3>
                        </div>
                    </div>
                    <div className="bg-panel border border-border-subtle rounded-2xl p-6 relative overflow-hidden">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Active Investors</span>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-strong">{loading ? '...' : investors.length}</h3>
                            <span className="text-[10px] font-bold text-slate-500">Entities</span>
                        </div>
                    </div>
                    <div className="bg-panel border border-border-subtle rounded-2xl p-6 relative overflow-hidden">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Proj. Interest Payouts</span>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-strong">{loading ? '...' : formatCurrency(totalExpectedReturn)}</h3>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-panel border border-border-subtle rounded-2xl overflow-hidden min-h-[400px]">
                    <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-main/20">
                        <h3 className="text-base font-bold text-strong">Investor Directory</h3>
                        <div className="flex gap-2">
                            <button className="text-slate-500 hover:text-strong transition-colors"><span className="material-symbols-outlined">search</span></button>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center items-center py-20 text-brand-teal">
                            <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max text-left border-collapse">
                                <thead>
                                    <tr className="bg-main/40 border-b border-border-subtle">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Investor Name</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount Invested</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fixed Rate</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Expected Return</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date Invested</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle">
                                    {investors.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-slate-500 text-sm font-bold">
                                                No investors have been added to the system yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        investors.map((inv) => (
                                            <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                                                <td className="px-6 py-4 text-xs font-mono text-slate-500">{inv.displayId}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-strong flex items-center gap-2">
                                                    <div className="size-8 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal text-xs font-bold uppercase ring-1 ring-brand-teal/20">
                                                        {inv.name.charAt(0)}
                                                    </div>
                                                    {inv.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-black text-strong">{formatCurrency(inv.amountInvested)}</td>
                                                <td className="px-6 py-4 text-xs font-bold text-slate-400">{inv.interestRate}%</td>
                                                <td className="px-6 py-4 text-sm font-bold text-brand-teal">
                                                    {formatCurrency(Number(inv.amountInvested) + (12 * Number(inv.amountInvested) * (Number(inv.interestRate) / 100)))}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-500">{inv.dateInvested}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border bg-primary/10 text-primary border-primary/20`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
