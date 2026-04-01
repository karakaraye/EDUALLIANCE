'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function LoanDetailPage() {
    const params = useParams();
    const loanId = params.id as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [loan, setLoan] = useState<any>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        fetch('/api/loans')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const found = data.find((l: any) => l.id.replace('#', '') === loanId);
                    setLoan(found || null);
                }
            })
            .catch(e => {
                console.error("Failed to load loan", e);
            });
    }, [loanId]);

    if (!isMounted) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    if (!loan) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center p-20 text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-4">error</span>
                    <h2 className="text-xl font-bold">Loan Not Found</h2>
                    <p className="mt-2 text-sm">The loan record you are looking for does not exist.</p>
                    <Link href="/loans" className="mt-6 text-brand-teal hover:text-teal-400 font-bold text-sm">Return to Portfolio</Link>
                </div>
            </DashboardLayout>
        );
    }

    const duration = Number(loan.durationMonths) || 0;
    const amount = Number(loan.amount) || 0;
    const rate = Number(loan.rate) || 0;
    
    const interestEarned = amount * (rate / 100) * duration;
    const expectedTotalRepayment = amount + interestEarned;
    const monthlyPayment = duration > 0 ? expectedTotalRepayment / duration : 0;
    
    let totalPaid = 0;
    const repayments = loan.repayments || {};
    
    const schedule = [];
    const loanStartDate = new Date(loan.disburseDate);
    const isValidDate = !isNaN(loanStartDate.getTime());

    for (let i = 1; i <= duration; i++) {
        const rec = repayments[i];
        let amountPaid = 0;
        if (rec === true) amountPaid = monthlyPayment;
        else if (typeof rec === 'number') amountPaid = rec;
        
        totalPaid += amountPaid;

        let dueDateStr = 'Unknown';
        let dueDateObj = new Date();
        if (isValidDate) {
            dueDateObj = new Date(loanStartDate.getFullYear(), loanStartDate.getMonth() + i, loanStartDate.getDate());
            dueDateStr = dueDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }

        const isFullyPaid = amountPaid >= monthlyPayment - 0.01;
        const isPartiallyPaid = amountPaid > 0 && !isFullyPaid;
        
        let status = 'Pending';
        if (isFullyPaid) status = 'Paid';
        else if (isPartiallyPaid) status = 'Partial';
        else {
            const today = new Date();
            today.setHours(0,0,0,0);
            dueDateObj.setHours(0,0,0,0);
            if (today > dueDateObj) status = 'Overdue';
            else status = 'Upcoming';
        }

        schedule.push({
            id: i.toString().padStart(2, '0'),
            date: dueDateStr,
            principal: formatCurrency(monthlyPayment - (amount * (rate / 100))),
            interest: formatCurrency(amount * (rate / 100)),
            total: formatCurrency(monthlyPayment),
            amountPaid,
            status
        });
    }

    const progressPct = expectedTotalRepayment > 0 ? Math.min(100, (totalPaid / expectedTotalRepayment) * 100) : 0;

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 print:gap-4 print:text-black">

                {/* Breadcrumb & Header */}
                <div className="print:hidden">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        <Link href="/loans" className="hover:text-strong transition-colors">Loans</Link>
                        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                        <span>{loan.id}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                        <div>
                            <h1 className="text-3xl font-black text-strong tracking-tight">Loan {loan.id}</h1>
                            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                                Borrower: <span className="text-strong font-bold">{loan.name}</span> • Application Date: {loan.disburseDate}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-strong rounded-lg text-xs font-bold hover:bg-teal-600 transition-all shadow-lg shadow-teal-900/20">
                                <span className="material-symbols-outlined text-[18px]">print</span> Print Record
                            </button>
                            <span className={`px-3 py-2 border rounded-lg text-xs font-bold uppercase tracking-widest flex items-center ${
                                loan.status === 'Active' ? 'bg-brand-teal/10 border-brand-teal/20 text-brand-teal' :
                                loan.status === 'Paid Full' ? 'bg-primary/10 border-primary/20 text-primary' :
                                'bg-red-500/10 border-red-500/20 text-red-500'
                            }`}>
                                {loan.status || 'Active'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Print Only Header */}
                <div className="hidden print:block mb-6 border-b pb-4 border-slate-300">
                    <h1 className="text-2xl font-black tracking-tight mb-1">Customer Loan Record: {loan.id}</h1>
                    <p className="text-sm font-bold">Borrower: {loan.name}</p>
                    <p className="text-sm">Application Date: {loan.disburseDate}</p>
                    <p className="text-sm font-bold mt-2">Status: {loan.status || 'Active'}</p>
                </div>

                {/* Customer & Loan Details */}
                <div className="bg-panel print:bg-transparent print:border-slate-300 border border-border-subtle rounded-2xl p-6 print:p-2 mb-2 print:mb-6">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar */}
                        {loan.image && (
                            <div className="size-24 rounded-2xl bg-surface border border-border-subtle overflow-hidden shrink-0 print:border-slate-300">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={loan.image} alt={loan.name} className="w-full h-full object-cover" />
                            </div>
                        )}
                        
                        {/* Details Grid */}
                        <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-6 print:gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-black">Principal Amount</span>
                                <span className="text-lg font-bold text-strong print:text-black">{formatCurrency(amount)}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-black">Interest Rate</span>
                                <span className="text-lg font-bold text-strong print:text-black">{rate}% <span className="text-[10px] text-slate-500 font-bold print:text-black">/ yr</span></span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-black">Duration</span>
                                <span className="text-lg font-bold text-strong print:text-black">{duration} Months</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-black">One-off Fee (6.5%)</span>
                                <span className="text-lg font-bold text-strong print:text-black">{formatCurrency(amount * 0.065)}</span>
                            </div>
                            <div className="flex flex-col gap-1 md:col-span-2">
                                <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest print:text-slate-800">Exp. Total Repayment</span>
                                <span className="text-xl font-black text-brand-teal print:text-slate-800">{formatCurrency(expectedTotalRepayment)}</span>
                            </div>
                            <div className="flex flex-col gap-1 md:col-span-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-black">Monthly Installment</span>
                                <span className="text-xl font-bold text-strong print:text-black">{formatCurrency(monthlyPayment)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:gap-4">
                    <div className="bg-panel print:bg-transparent print:border-slate-300 border border-border-subtle rounded-2xl p-6 relative overflow-hidden">
                        <span className="text-[10px] font-black text-slate-500 print:text-black uppercase tracking-widest block mb-2">Total Paid</span>
                        <div className="flex flex-col">
                            <h3 className="text-3xl font-black text-strong print:text-black">{formatCurrency(totalPaid)}</h3>
                        </div>
                    </div>

                    <div className="bg-panel print:bg-transparent print:border-slate-300 border border-border-subtle rounded-2xl p-6 relative overflow-hidden">
                        <span className="text-[10px] font-black text-slate-500 print:text-black uppercase tracking-widest block mb-2">Outstanding Balance</span>
                        <div className="flex flex-col">
                            <h3 className="text-3xl font-black text-strong print:text-black">{formatCurrency(expectedTotalRepayment - totalPaid)}</h3>
                        </div>
                    </div>

                    <div className="bg-panel print:bg-transparent print:border-slate-300 border border-border-subtle rounded-2xl p-6 relative overflow-hidden flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black text-slate-500 print:text-black uppercase tracking-widest block mb-1">Repayment</span>
                            <h3 className="text-xl font-bold text-strong print:text-black">Progress</h3>
                        </div>
                        <div className="relative size-20 flex items-center justify-center">
                            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-strong/5 print:text-slate-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                <path className="text-brand-teal print:text-slate-800" strokeDasharray={`${progressPct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            </svg>
                            <span className="absolute text-xs font-black text-strong print:text-black">{progressPct.toFixed(0)}%</span>
                        </div>
                    </div>
                </div>

                {/* Repayment Schedule */}
                <div className="bg-panel print:bg-transparent print:border-slate-300 border border-border-subtle rounded-2xl overflow-hidden mt-2">
                    <div className="p-6 border-b border-border-subtle print:border-slate-300 flex justify-between items-center bg-main/20 print:bg-transparent">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-brand-teal print:hidden">calendar_month</span>
                            <h3 className="text-base font-bold text-strong print:text-black">Repayment Schedule</h3>
                        </div>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-main/40 print:bg-slate-100 border-b border-border-subtle print:border-slate-300">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 print:text-slate-800 uppercase tracking-widest">#</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 print:text-slate-800 uppercase tracking-widest">Due Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 print:text-slate-800 uppercase tracking-widest">Exp. Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 print:text-slate-800 uppercase tracking-widest">Amount Paid</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-600 print:text-slate-800 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle print:divide-slate-300">
                            {schedule.map((item) => (
                                <tr key={item.id} className="hover:bg-white/[0.02]">
                                    <td className="px-6 py-4 text-xs font-mono text-slate-500 print:text-black">{item.id}</td>
                                    <td className="px-6 py-4 text-sm text-slate-300 print:text-black">{item.date}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-strong print:text-black">{item.total}</td>
                                    <td className="px-6 py-4 text-sm text-slate-300 print:text-black">{formatCurrency(item.amountPaid)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border print:border-none print:px-0 ${
                                            item.status === 'Paid' ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/20 print:text-black' :
                                            item.status === 'Upcoming' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 print:text-black' :
                                            item.status === 'Partial' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 print:text-black' :
                                            'bg-red-500/10 text-red-500 border-red-500/20 print:text-black'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </DashboardLayout>
    );
}
