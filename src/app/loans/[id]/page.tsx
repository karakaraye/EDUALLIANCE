'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function LoanDetailPage() {
    const params = useParams();
    const loanId = params.id as string;

    // Dummy schedule data
    const schedule = [
        { id: '08', date: 'Oct 15, 2023', principal: '₦950.00', interest: '₦50.00', total: '₦1,000.00', status: 'Paid' },
        { id: '09', date: 'Nov 15, 2023', principal: '₦950.00', interest: '₦50.00', total: '₦1,000.00', status: 'Upcoming' },
        { id: '10', date: 'Dec 15, 2023', principal: '₦950.00', interest: '₦50.00', total: '₦1,000.00', status: 'Pending' },
        { id: '11', date: 'Jan 15, 2024', principal: '₦950.00', interest: '₦50.00', total: '₦1,000.00', status: 'Pending' },
    ];

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">

                {/* Breadcrumb & Header */}
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        <Link href="/loans" className="hover:text-strong transition-colors">Loans</Link>
                        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                        <span>EDL-{loanId}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                        <div>
                            <h1 className="text-3xl font-black text-strong tracking-tight">Loan #EDL-{loanId}</h1>
                            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                                Borrower: <span className="text-strong font-bold">Johnathan Miller</span> • Application Date: Oct 12, 2023
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-panel border border-border-subtle rounded-lg text-slate-300 text-xs font-bold hover:bg-white/5 transition-all">
                                <span className="material-symbols-outlined text-[18px]">download</span> Export Statement
                            </button>
                            <span className="px-3 py-2 bg-brand-teal/10 border border-brand-teal/20 text-brand-teal rounded-lg text-xs font-bold uppercase tracking-widest flex items-center">
                                Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-panel border border-border-subtle rounded-2xl p-6 relative overflow-hidden">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Total Paid</span>
                        <div className="flex flex-col">
                            <h3 className="text-3xl font-black text-strong">₦12,450.00</h3>
                            <span className="text-[10px] font-bold text-primary mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">trending_up</span> +5.2% from last month
                            </span>
                        </div>
                    </div>

                    <div className="bg-panel border border-border-subtle rounded-2xl p-6 relative overflow-hidden">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Outstanding Balance</span>
                        <div className="flex flex-col">
                            <h3 className="text-3xl font-black text-strong">₦8,550.00</h3>
                            <span className="text-[10px] font-bold text-slate-500 mt-1">Next Due: Nov 15, 2023</span>
                        </div>
                    </div>

                    <div className="bg-panel border border-border-subtle rounded-2xl p-6 relative overflow-hidden flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Repayment</span>
                            <h3 className="text-xl font-bold text-strong">Progress</h3>
                        </div>
                        <div className="relative size-20 flex items-center justify-center">
                            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-strong/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                <path className="text-brand-teal" strokeDasharray="59, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            </svg>
                            <span className="absolute text-xs font-black text-strong">59%</span>
                        </div>
                    </div>
                </div>

                {/* Manual Payment Section */}
                <div className="bg-panel border border-border-subtle rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-6 rounded-full bg-brand-teal flex items-center justify-center text-strong">
                            <span className="material-symbols-outlined text-[16px]">add</span>
                        </div>
                        <h3 className="text-lg font-bold text-strong">Record Manual Payment</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Payment Date</label>
                            <div className="relative">
                                <input type="date" defaultValue="2023-10-27" className="w-full h-10 px-4 bg-main border border-border-subtle rounded-lg text-sm text-strong focus:border-brand-teal focus:outline-none transition-colors appearance-none" />
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-sm">calendar_today</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount (₦)</label>
                            <input type="number" defaultValue="0.00" className="w-full h-10 px-4 bg-main border border-border-subtle rounded-lg text-sm text-strong focus:border-brand-teal focus:outline-none transition-colors" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Method</label>
                            <div className="relative">
                                <select className="w-full h-10 px-4 bg-main border border-border-subtle rounded-lg text-sm text-strong appearance-none focus:border-brand-teal focus:outline-none transition-colors">
                                    <option>Bank Transfer</option>
                                    <option>Cash</option>
                                    <option>Cheque</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
                            </div>
                        </div>
                        <button className="h-10 px-6 bg-brand-teal text-strong text-sm font-bold rounded-lg hover:bg-teal-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20">
                            <span className="material-symbols-outlined text-[18px]">check_circle</span> Post Payment
                        </button>
                    </div>
                </div>

                {/* Repayment Schedule */}
                <div className="bg-panel border border-border-subtle rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-main/20">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-brand-teal">calendar_month</span>
                            <h3 className="text-base font-bold text-strong">Repayment Schedule</h3>
                        </div>
                        <button className="text-slate-500 hover:text-strong transition-colors">
                            <span className="material-symbols-outlined">filter_list</span>
                        </button>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-main/40 border-b border-border-subtle">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">#</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Due Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Principal</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Interest</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Total Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {schedule.map((item) => (
                                <tr key={item.id} className="hover:bg-white/[0.02]">
                                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{item.id}</td>
                                    <td className="px-6 py-4 text-sm text-slate-300">{item.date}</td>
                                    <td className="px-6 py-4 text-sm text-slate-300">{item.principal}</td>
                                    <td className="px-6 py-4 text-sm text-slate-300">{item.interest}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-strong">{item.total}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${item.status === 'Paid' ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/20' :
                                            item.status === 'Upcoming' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-4 bg-main/30 border-t border-border-subtle">
                        <button className="w-full py-2 text-[10px] font-black text-brand-teal uppercase tracking-widest hover:text-strong transition-colors">View Full Schedule</button>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
