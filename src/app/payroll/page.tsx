'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function PayrollPage() {
    const [payrolls, setPayrolls] = useState<any[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
        fetchPayrolls();
    }, []);

    const fetchPayrolls = async () => {
        try {
            const res = await fetch('/api/payroll');
            const data = await res.json();
            setPayrolls(data || []);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch payrolls', err);
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setApprovingId(id);
        try {
            const res = await fetch(`/api/payroll/${id}/approve`, { method: 'PATCH' });
            if (res.ok) {
                await fetchPayrolls();
            } else {
                console.error('Approval failed');
            }
        } catch (e) {
            console.error('Error approving payload:', e);
        } finally {
            setApprovingId(null);
        }
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(2)}M`;
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    const formatCurrencyFull = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    // Calculate Dynamic KPIs
    const processedRuns = payrolls.filter((p: any) => p.status === 'PAID');
    const totalPayrollYTD = processedRuns.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    const activeEmployees = processedRuns.length > 0 ? processedRuns[0].employees : 0;
    const pendingApprovals = payrolls.filter((p: any) => p.status !== 'PAID').length;

    if (!isMounted) return null;

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                            <span>Modules</span>
                            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                            <span>HR</span>
                        </div>
                        <h1 className="text-3xl font-black text-strong tracking-tight">Payroll Management</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage staff salaries, allowances, and approve batch disbursements.</p>
                    </div>
                    <Link href="/payroll/run">
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-teal hover:bg-brand-teal/80 text-strong text-xs font-bold transition-all shadow-lg shadow-brand-teal/20">
                            <span className="material-symbols-outlined text-[18px]">add</span> Draft New Payroll
                        </button>
                    </Link>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-panel border border-border-subtle rounded-2xl p-6 relative overflow-hidden">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Total Paid (YTD)</span>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-strong">{loading ? '...' : formatCurrency(totalPayrollYTD)}</h3>
                            <span className="text-[10px] font-bold text-slate-500">From DB</span>
                        </div>
                    </div>
                    <div className="bg-panel border border-border-subtle rounded-2xl p-6 relative overflow-hidden">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Active Employees</span>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-strong">{loading ? '...' : activeEmployees}</h3>
                            <span className="text-[10px] font-bold text-brand-teal">Latest Run</span>
                        </div>
                    </div>
                    <div className="bg-panel border border-border-subtle rounded-2xl p-6 relative overflow-hidden">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Pending Approvals</span>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-strong">{loading ? '...' : pendingApprovals}</h3>
                            <span className="text-[10px] font-bold text-yellow-500">Awaiting Signature</span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-panel border border-border-subtle rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-main/20">
                        <h3 className="text-base font-bold text-strong">Payroll Runs</h3>
                        <button className="text-slate-500 hover:text-strong transition-colors"><span className="material-symbols-outlined">filter_list</span></button>
                    </div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-main/40 border-b border-border-subtle">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Reference ID</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Payroll Month</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Processed Staff</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {!loading && payrolls.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm font-bold">
                                        No payroll batches found in the standard database.
                                    </td>
                                </tr>
                            )}
                            {payrolls.map((run) => (
                                <tr key={run.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                                    <td className="px-6 py-4 text-xs font-mono text-slate-300 font-bold">{run.id.substring(0,8).toUpperCase()}</td>
                                    <td className="px-6 py-4 text-sm text-slate-300">{run.date}</td>
                                    <td className="px-6 py-4 text-sm text-slate-300">{run.employees}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-strong">{formatCurrencyFull(run.amount)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border ${run.status === 'PAID' ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/20' :
                                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                            }`}>
                                            {run.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {run.status !== 'PAID' ? (
                                            <button 
                                                onClick={() => handleApprove(run.id)}
                                                disabled={approvingId === run.id}
                                                className="bg-brand-teal hover:bg-brand-teal/80 text-strong text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                                            >
                                                {approvingId === run.id ? 'Approving...' : 'Approve'}
                                            </button>
                                        ) : (
                                            <button className="text-slate-500 hover:text-strong transition-colors"><span className="material-symbols-outlined">check_circle</span></button>
                                        )}
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
