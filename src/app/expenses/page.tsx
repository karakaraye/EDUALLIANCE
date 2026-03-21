'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ExpenseModal } from '@/components/forms/ExpenseModal';

export default function ExpensesPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchExpenses = () => {
        setLoading(true);
        fetch('/api/expenses')
            .then(res => res.json())
            .then(data => {
                setExpenses(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch expenses:', err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(2)}M`;
        if (amount >= 1000) return `₦${(amount / 1000).toFixed(1)}K`;
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    const formatCurrencyFull = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/expenses/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchExpenses();
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    // Derived Metrics
    const { totalMonthly, pendingCount } = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let monthSum = 0;
        let pCount = 0;

        expenses.forEach(exp => {
            const expDate = new Date(exp.rawDate);
            if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
                monthSum += Number(exp.amount);
            }
            if (exp.status === 'PENDING') {
                pCount++;
            }
        });

        return { totalMonthly: monthSum, pendingCount: pCount };
    }, [expenses]);

    // Hardcoded demo budget max for visualization
    const BUDGET_CAP = 5000000; 
    const budgetUsagePercent = Math.min((totalMonthly / BUDGET_CAP) * 100, 100).toFixed(1);

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 relative">
                
                <ExpenseModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={fetchExpenses} 
                />

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                            <span>Modules</span>
                            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                            <span>Finance</span>
                        </div>
                        <h1 className="text-3xl font-black text-strong tracking-tight">Expense Management</h1>
                        <p className="text-slate-500 text-sm mt-1">Track operational costs, approve reimbursements, and monitor budget usage.</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-strong text-xs font-bold transition-all shadow-lg shadow-red-900/20"
                    >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span> Log Expense
                    </button>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-panel border border-border-subtle rounded-2xl p-6 relative overflow-hidden">
                        <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block mb-2">Monthly Expenses</span>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-strong">{loading ? '...' : formatCurrency(totalMonthly)}</h3>
                            <span className="text-[10px] font-bold text-slate-500">Recorded</span>
                        </div>
                    </div>
                    <div className="bg-panel border border-border-subtle rounded-2xl p-6 relative overflow-hidden">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Budget Usage</span>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-strong">{loading ? '...' : `${budgetUsagePercent}%`}</h3>
                            <span className="text-[10px] font-bold text-slate-500">of ₦5M</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface rounded-full mt-3 overflow-hidden">
                            <div className={`h-full ${Number(budgetUsagePercent) > 85 ? 'bg-red-500' : 'bg-brand-teal'}`} style={{ width: `${budgetUsagePercent}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-panel border border-border-subtle rounded-2xl p-6 relative overflow-hidden">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Pending Reimbursements</span>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-strong">{loading ? '...' : pendingCount}</h3>
                            <span className="text-[10px] font-bold text-slate-500">Requests</span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-panel border border-border-subtle rounded-2xl overflow-hidden min-h-[400px]">
                    <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-main/20">
                        <h3 className="text-base font-bold text-strong">Recent Transactions</h3>
                        <div className="flex gap-2">
                            <button className="text-slate-500 hover:text-strong transition-colors"><span className="material-symbols-outlined">search</span></button>
                            <button className="text-slate-500 hover:text-strong transition-colors"><span className="material-symbols-outlined">tune</span></button>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center items-center py-20 text-brand-teal">
                            <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-main/40 border-b border-border-subtle">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Requested By</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500 text-sm font-bold">
                                            No expenses logged across the system yet.
                                        </td>
                                    </tr>
                                ) : (
                                    expenses.map((exp) => (
                                        <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                                            <td className="px-6 py-4 text-xs font-mono text-slate-500">{exp.id}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-strong max-w-[200px] truncate">{exp.desc}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-400">{exp.category}</td>
                                            <td className="px-6 py-4 text-xs text-slate-400">{exp.managerName}</td>
                                            <td className="px-6 py-4 text-xs text-slate-500">{exp.date}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-strong">{formatCurrencyFull(exp.amount)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border ${
                                                    exp.status === 'APPROVED' ? 'bg-primary/5 text-primary border-primary/10' :
                                                    exp.status === 'REJECTED' ? 'bg-red-500/5 text-red-500 border-red-500/10' :
                                                    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                }`}>
                                                    {exp.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {exp.status === 'PENDING' && (
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); updateStatus(exp.rawId, 'APPROVED'); }}
                                                            className="p-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                                            title="Approve"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); updateStatus(exp.rawId, 'REJECTED'); }}
                                                            className="p-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                                            title="Reject"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">cancel</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
