'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LoanRepaymentsModal } from '@/components/forms/LoanRepaymentsModal';
import { EditLoanModal } from '@/components/forms/EditLoanModal';
import { calculateLoanStatus } from '@/utils/loan-utils';

export default function LoansPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defaultLoans: any[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [loans, setLoans] = React.useState<any[]>([]);
    const [isMounted, setIsMounted] = React.useState(false);
    const [isRepaymentModalOpen, setIsRepaymentModalOpen] = React.useState(false);
    
    // Admin Edit Control States
    const [userRole, setUserRole] = React.useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [loanToEdit, setLoanToEdit] = React.useState<any>(null);

    const [currentPage, setCurrentPage] = React.useState(1);
    const [loanFilter, setLoanFilter] = React.useState<'All' | 'Active' | 'Overdue' | 'Paid Full'>('All');
    const ITEMS_PER_PAGE = 10;

    const [loading, setLoading] = React.useState(true);

    const refreshLoans = () => {
        setLoading(true);
        fetch('/api/loans')
            .then(res => res.json())
            .then(parsed => {
                if (!Array.isArray(parsed)) {
                    setLoans(defaultLoans);
                    return;
                }
                const enriched = parsed.map((l: any) => {
                    const status = calculateLoanStatus(l);
                    if (l.status !== status) {
                        // Persist dynamic status change to Postgres
                        fetch('/api/loans', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: l.id, status })
                        }).catch(console.error);
                    }
                    return { ...l, status };
                });
                
                setLoans(enriched);
            })
            .catch(e => {
                console.error("Failed to parse loans, resetting to default.", e);
                setLoans(defaultLoans);
            })
            .finally(() => setLoading(false));
    };

    React.useEffect(() => {
        setIsMounted(true);
        refreshLoans();
        setUserRole(sessionStorage.getItem('edualliance_role') || 'LOAN_OFFICER');
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    const deleteLoan = async (id: string) => {
        try {
            const res = await fetch(`/api/loans?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
            if (res.ok) {
                refreshLoans();
            }
        } catch (e) {
            console.error("Failed to delete loan", e);
        }
    };

    if (!isMounted) return null; // Avoid hydration mismatch on initial render

    // Dynamic KPI Calculations
    const activeLoansArr = loans.filter((l: any) => l.status === 'Active');
    const overdueLoansArr = loans.filter((l: any) => l.status === 'Overdue');
    const nonPaidLoansArr = loans.filter((l: any) => l.status !== 'Paid Full');

    const totalPortfolio = nonPaidLoansArr.reduce((sum: number, l: any) => sum + Number(l.amount), 0);
    const activeLoansCount = activeLoansArr.length;
    const overdueVolume = overdueLoansArr.reduce((sum: number, l: any) => sum + Number(l.amountLeft), 0);
    const totalMoniesOut = nonPaidLoansArr.reduce((sum: number, l: any) => sum + Number(l.amountLeft), 0);

    // Pagination logic
    const filteredLoans = loans.filter((l: any) => {
        if (loanFilter === 'All') return true;
        if (loanFilter === 'Active') return l.status === 'Active';
        if (loanFilter === 'Overdue') return l.status === 'Overdue';
        if (loanFilter === 'Paid Full') return l.status === 'Paid Full';
        return true;
    });

    const totalPages = Math.ceil(filteredLoans.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedLoans = filteredLoans.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const startEntry = filteredLoans.length > 0 ? startIndex + 1 : 0;
    const endEntry = Math.min(startIndex + ITEMS_PER_PAGE, filteredLoans.length);

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                            <span>Portfolio</span>
                            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                            <span>Management</span>
                        </div>
                        <h1 className="text-3xl font-black text-strong tracking-tight">Loan Portfolio Manager</h1>
                        <p className="text-slate-500 text-sm mt-1">Detailed tracking and analysis of all active and historical loan disbursements.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsRepaymentModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-brand-teal/30 text-brand-teal hover:bg-brand-teal/10 text-xs font-bold transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">calendar_month</span> Monthly Repayment
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border-subtle text-slate-300 text-xs font-bold hover:bg-white/5 transition-all">
                            <span className="material-symbols-outlined text-[18px]">download</span> Export
                        </button>
                        <Link href="/loans/new">
                            <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-brand-teal text-strong text-xs font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined text-[18px]">add_notes</span> + New Loan Entry
                            </button>
                        </Link>
                    </div>
                </div>

                <LoanRepaymentsModal
                    isOpen={isRepaymentModalOpen}
                    onClose={() => setIsRepaymentModalOpen(false)}
                    loans={loans}
                    onLoansUpdated={refreshLoans}
                />

                <EditLoanModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    loan={loanToEdit}
                    onSave={refreshLoans}
                />

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-panel border border-border-subtle rounded-2xl p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Portfolio</span>
                            <span className="material-symbols-outlined text-slate-600">account_balance_wallet</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-strong">{formatCurrency(totalPortfolio)}</h3>
                            <span className="text-[10px] font-bold text-primary">+12%</span>
                        </div>
                    </div>
                    <div className="bg-panel border border-border-subtle rounded-2xl p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Loans</span>
                            <span className="material-symbols-outlined text-slate-600">trending_up</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-strong">{activeLoansCount}</h3>
                            <span className="text-[10px] font-bold text-primary">+5%</span>
                        </div>
                    </div>
                    <div className="bg-panel border border-border-subtle rounded-2xl p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Overdue Volume</span>
                            <span className="material-symbols-outlined text-slate-600">error</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-strong">{formatCurrency(overdueVolume)}</h3>
                            <span className="text-[10px] font-bold text-red-500">-2%</span>
                        </div>
                    </div>
                    <div className="bg-panel border border-border-subtle rounded-2xl p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest">Total Monies Out</span>
                            <span className="material-symbols-outlined text-brand-teal">payments</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-strong">{formatCurrency(totalMoniesOut)}</h3>
                            <span className="text-[10px] font-bold text-slate-500">Outstanding Debt</span>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-main/40 p-1.5 rounded-xl border border-border-subtle w-full">
                    <div className="flex gap-1 bg-surface p-1 rounded-lg border border-border-subtle">
                        <button 
                            onClick={() => { setLoanFilter('All'); setCurrentPage(1); }}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${loanFilter === 'All' ? 'bg-brand-teal text-strong shadow-md' : 'text-slate-500 hover:text-strong'}`}>
                            All Loans
                        </button>
                        <button 
                            onClick={() => { setLoanFilter('Active'); setCurrentPage(1); }}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${loanFilter === 'Active' ? 'bg-brand-teal text-strong shadow-md' : 'text-slate-500 hover:text-strong'}`}>
                            Active
                        </button>
                        <button 
                            onClick={() => { setLoanFilter('Overdue'); setCurrentPage(1); }}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${loanFilter === 'Overdue' ? 'bg-red-500 text-strong shadow-md' : 'text-slate-500 hover:text-strong'}`}>
                            Overdue
                        </button>
                        <button 
                            onClick={() => { setLoanFilter('Paid Full'); setCurrentPage(1); }}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${loanFilter === 'Paid Full' ? 'bg-primary text-strong shadow-md' : 'text-slate-500 hover:text-strong'}`}>
                            Paid
                        </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-bold px-4">
                        <span>Showing {startEntry}-{endEntry} of {filteredLoans.length} entries</span>
                        <div className="flex gap-1 ml-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={`size-6 flex items-center justify-center rounded bg-panel border border-border-subtle hover:bg-white/5 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                <span className="material-symbols-outlined text-[14px]">chevron_left</span>
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className={`size-6 flex items-center justify-center rounded bg-panel border border-border-subtle hover:bg-white/5 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-panel border border-border-subtle rounded-2xl overflow-x-auto w-full max-w-[100vw]">
                    <table className="w-full min-w-max text-left border-collapse">
                        <thead>
                            <tr className="bg-main/40 border-b border-border-subtle">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Loan ID</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Client Name</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Disbursement Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-brand-teal uppercase tracking-widest whitespace-nowrap">Loan Approved</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">One-off Fee (6.5%)</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Interest Earned</th>
                                <th className="px-6 py-4 text-[10px] font-black text-brand-teal uppercase tracking-widest whitespace-nowrap">Expected Total Repayment</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Actual Disbursement</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Monthly Repayment</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Total Paid</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Amount Left</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {paginatedLoans.map((loan) => {
                                const loanApproved = loan.amount;
                                const oneOffFee = loanApproved * 0.065;
                                const interestEarned = loanApproved * (loan.rate / 100) * loan.durationMonths;
                                const expectedTotalRepayment = loanApproved + interestEarned;
                                // Assuming the user meant "Actual Disbursement = Loan Approved" as requested initially, but we subtract fees if instructed otherwise. Sticking to actual matches the user's first prompt ("same as loan approved").
                                const actualDisbursement = loanApproved;
                                const monthlyRepayment = expectedTotalRepayment / loan.durationMonths;
                                const totalPaid = expectedTotalRepayment - loan.amountLeft;
                                const pctPaid = expectedTotalRepayment > 0 ? (totalPaid / expectedTotalRepayment) * 100 : 0;

                                return (
                                    <tr key={loan.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link href={`/loans/${loan.id.replace('#', '')}`} className="text-brand-teal text-xs font-bold hover:underline">
                                                {loan.id}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-strong">{loan.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-400 whitespace-nowrap">{loan.disburseDate}</td>
                                        <td className="px-6 py-4 text-sm font-black text-strong whitespace-nowrap">{formatCurrency(loanApproved)}</td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-300 whitespace-nowrap">{formatCurrency(oneOffFee)}</td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-300 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span>{formatCurrency(interestEarned)}</span>
                                                <span className="text-[10px] text-slate-500">@{loan.rate}%/mo</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-brand-teal whitespace-nowrap">{formatCurrency(expectedTotalRepayment)}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-300 whitespace-nowrap">{formatCurrency(actualDisbursement)}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-300 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span>{formatCurrency(monthlyRepayment)}</span>
                                                <span className="text-[10px] text-slate-500">{loan.durationMonths} months</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-300 whitespace-nowrap">{formatCurrency(totalPaid)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-strong mb-1">{formatCurrency(loan.amountLeft)}</span>
                                                <div className="h-1 w-20 bg-surface rounded-full overflow-hidden">
                                                    <div className="h-full bg-brand-teal rounded-full" style={{ width: `${pctPaid}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border ${loan.status === 'Active' ? 'bg-brand-teal/10 text-brand-teal border-brand-teal/20' :
                                                loan.status === 'Paid Full' ? 'bg-primary/10 text-primary border-primary/20' :
                                                    'bg-red-500/10 text-red-500 border-red-500/20'
                                                }`}>
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                {loan.status === 'Paid Full' && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            if (confirm('Are you sure you want to delete this completed loan?')) {
                                                                deleteLoan(loan.id);
                                                            }
                                                        }}
                                                        className="text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 size-8 rounded-lg flex justify-center items-center transition-colors"
                                                        title="Delete Loan"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                                    </button>
                                                )}
                                                {userRole === 'ADMIN' && loan.status !== 'Paid Full' && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setLoanToEdit(loan);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="text-blue-500 hover:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 size-8 rounded-lg flex justify-center items-center transition-colors"
                                                        title="Admin Override: Edit Loan"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                                    </button>
                                                )}
                                                <button className="text-slate-500 hover:text-strong transition-colors mt-1">
                                                    <span className="material-symbols-outlined">more_vert</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="p-4 border-t border-border-subtle flex justify-end">
                        <div className="flex gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${currentPage === page
                                            ? 'bg-brand-teal text-strong shadow-md'
                                            : 'bg-main border border-border-subtle text-slate-500 hover:text-strong'
                                        }`}>
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
