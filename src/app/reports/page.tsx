'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';

type LedgerEntry = {
    id: string;
    type: 'Expense' | 'Payroll' | 'Investment' | 'Loan';
    description: string;
    category: string;
    amount: number;
    expectedReturn?: number;
    date: string;
    status: string;
};

export default function ReportsPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [apiSummary, setApiSummary] = useState({
        totalExpenses: 0,
        totalPayroll: 0,
        totalInvestorsPrincipal: 0,
        totalInvestorsPayout: 0
    });
    const [apiLedger, setApiLedger] = useState<LedgerEntry[]>([]);

    // Client-side loans from localStorage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [localLoans, setLocalLoans] = useState<any[]>([]);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        setIsMounted(true);
        const fetchReports = async () => {
            try {
                const res = await fetch('/api/reports');
                const data = await res.json();
                setApiSummary(data.summary || {
                    totalExpenses: 0, totalPayroll: 0, totalInvestorsPrincipal: 0, totalInvestorsPayout: 0
                });
                setApiLedger(data.ledger || []);
            } catch (err) {
                console.error("Failed to fetch reports:", err);
            } finally {
                setLoading(false);
            }
        };

        const loadLocalLoans = () => {
            const savedLoans = localStorage.getItem('edualliance_loans');
            if (savedLoans) {
                setLocalLoans(JSON.parse(savedLoans));
            }
        };

        fetchReports();
        loadLocalLoans();
    }, []);

    // Combine Data
    const combinedData = useMemo(() => {
        const loanLedger: LedgerEntry[] = [];

        localLoans.forEach(loan => {
            const amount = Number(loan.amount);
            const rate = Number(loan.rate);
            const duration = Number(loan.durationMonths);

            const expectedReturn = amount + (amount * (rate / 100) * duration);

            loanLedger.push({
                id: `LOAN-${loan.id}`,
                type: 'Loan',
                description: `Disbursement to ${loan.name}`,
                category: loan.loanType || 'Business Loan',
                amount: amount,
                // store expected return separately for KPI calculation
                expectedReturn: expectedReturn,
                date: loan.disburseDate ? new Date(loan.disburseDate).toISOString() : new Date().toISOString(),
                status: loan.status
            });
        });

        const fullLedger = [...apiLedger, ...loanLedger].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Filter the ledger by selected dates
        const filteredLedger = fullLedger.filter(entry => {
            const entryTime = new Date(entry.date).getTime();
            const sTime = startDate ? new Date(startDate).getTime() : -Infinity;
            // For end date, we add 86400000 (1 day in ms) to include the whole end day if they pick e.g. Oct 31
            const eTime = endDate ? new Date(endDate).getTime() + 86400000 : Infinity;
            return entryTime >= sTime && entryTime <= eTime;
        });

        // Recalculate KPIs based strictly on the filtered ledger
        let totalLoanDisbursed = 0;
        let totalExpectedLoanRevenue = 0;
        
        filteredLedger.forEach(entry => {
            if (entry.type === 'Loan') {
                totalLoanDisbursed += entry.amount;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                totalExpectedLoanRevenue += (entry as any).expectedReturn || entry.amount;
            }
        });

        const totalFilteredExpenses = filteredLedger.filter(e => e.type === 'Expense').reduce((sum, e) => sum + e.amount, 0);
        const totalFilteredPayroll = filteredLedger.filter(e => e.type === 'Payroll').reduce((sum, e) => sum + e.amount, 0);
        const totalFilteredInvestors = filteredLedger.filter(e => e.type === 'Investment').reduce((sum, e) => sum + e.amount, 0);

        const totalOperationalCosts = totalFilteredExpenses + totalFilteredPayroll;
        const totalNetProfit = totalExpectedLoanRevenue - totalOperationalCosts;

        return {
            filteredLedger,
            totalLoanDisbursed,
            totalExpectedLoanRevenue,
            totalOperationalCosts,
            totalNetProfit,
            totalFilteredInvestors
        };
    }, [apiLedger, localLoans, startDate, endDate]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handlePrint = () => {
        window.print();
    };

    if (!isMounted) return null;

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 relative printable-area">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                            <span>Analytics</span>
                            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                            <span>Reports</span>
                        </div>
                        <h1 className="text-3xl font-black text-strong tracking-tight">Financial Dashboard</h1>
                        <p className="text-slate-500 text-sm mt-1 no-print">Aggregated overview of organization finances, combining Loans, Payroll, Expenses, and Investors.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 no-print">
                        <div className="flex items-center gap-2 bg-panel border border-border-subtle rounded-lg px-3 py-1.5 h-10 overflow-hidden">
                            <span className="material-symbols-outlined text-slate-500 text-[18px]">calendar_today</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-transparent text-sm text-strong focus:outline-none w-32"
                                />
                                <span className="text-slate-500 text-xs">to</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-transparent text-sm text-strong focus:outline-none w-32"
                                />
                                {(startDate || endDate) && (
                                    <button
                                        onClick={() => { setStartDate(''); setEndDate(''); }}
                                        className="text-slate-500 hover:text-strong"
                                        title="Clear filter"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                    </button>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handlePrint}
                            className="flex items-center justify-center gap-2 px-5 rounded-lg border border-border-subtle text-slate-300 text-xs font-bold hover:bg-white/5 transition-all h-10"
                        >
                            <span className="material-symbols-outlined text-[18px]">print</span> Print Report
                        </button>
                    </div>
                </div>

                {/* Date active indicator for print */}
                {(startDate || endDate) && (
                    <div className="hidden print:block mb-4 text-sm font-bold text-slate-500">
                        Reporting Period: {startDate ? formatDate(startDate) : 'Beginning'} - {endDate ? formatDate(endDate) : 'Present'}
                    </div>
                )}

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-panel border border-border-subtle rounded-2xl p-6">
                        <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest block mb-2">Total Expected Revenue</span>
                        <h3 className="text-3xl font-black text-strong">{loading ? '...' : formatCurrency(combinedData.totalExpectedLoanRevenue)}</h3>
                        <p className="text-xs text-slate-500 mt-2">Driven strictly by active loans</p>
                    </div>

                    <div className="bg-panel border border-border-subtle rounded-2xl p-6">
                        <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block mb-2">Total Operating Costs</span>
                        <h3 className="text-3xl font-black text-strong">{loading ? '...' : formatCurrency(combinedData.totalOperationalCosts)}</h3>
                        <p className="text-xs text-slate-500 mt-2">Hardware, tools, software, payroll</p>
                    </div>

                    <div className="bg-panel border border-border-subtle rounded-2xl p-6">
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-2">Net Profit Projection</span>
                        <h3 className="text-3xl font-black text-strong">{loading ? '...' : formatCurrency(combinedData.totalNetProfit)}</h3>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            {combinedData.totalNetProfit >= 0 ? (
                                <><span className="material-symbols-outlined text-[14px] text-green-400">trending_up</span> Positive Margin</>
                            ) : (
                                <><span className="material-symbols-outlined text-[14px] text-red-400">trending_down</span> Running at a loss</>
                            )}
                        </p>
                    </div>

                    <div className="bg-panel border border-border-subtle rounded-2xl p-6">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Total Capital Raised</span>
                        <h3 className="text-3xl font-black text-strong">{loading ? '...' : formatCurrency(combinedData.totalFilteredInvestors)}</h3>
                        <p className="text-xs text-slate-500 mt-2">Active external investor pool</p>
                    </div>
                </div>

                {/* Master Ledger Table */}
                <div className="bg-panel border border-border-subtle rounded-2xl overflow-hidden min-h-[400px]">
                    <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-main/20">
                        <h3 className="text-base font-bold text-strong flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">receipt_long</span>
                            Master Financial Ledger
                        </h3>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20 text-brand-teal">
                            <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full max-w-[100vw]">
                            <table className="w-full min-w-max text-left border-collapse">
                                <thead>
                                    <tr className="bg-main/40 border-b border-border-subtle">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Impact (Amount)</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle">
                                    {combinedData.filteredLedger.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-slate-500 text-sm font-bold">
                                                No financial records found for the selected period.
                                            </td>
                                        </tr>
                                    ) : (
                                        combinedData.filteredLedger.map((entry) => (
                                            <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 text-xs text-slate-400">{formatDate(entry.date)}</td>
                                                <td className="px-6 py-4 text-xs font-mono text-slate-500">{entry.id}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${entry.type === 'Loan' ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/20' :
                                                        entry.type === 'Expense' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                            entry.type === 'Payroll' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                                'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                        }`}>
                                                        {entry.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-strong max-w-[250px] truncate">{entry.description}</td>
                                                <td className="px-6 py-4 text-xs font-bold text-slate-400">{entry.category}</td>
                                                <td className="px-6 py-4 text-sm font-black text-right">
                                                    <span className={entry.type === 'Expense' || entry.type === 'Payroll' ? 'text-red-400' : 'text-strong'}>
                                                        {entry.type === 'Expense' || entry.type === 'Payroll' ? '-' : '+'} {formatCurrency(entry.amount)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-2 py-1 rounded border bg-surface border-border-subtle text-[10px] font-bold uppercase text-slate-400">
                                                        {entry.status}
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
