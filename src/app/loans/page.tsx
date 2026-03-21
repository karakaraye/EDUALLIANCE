'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LoanRepaymentsModal } from '@/components/forms/LoanRepaymentsModal';

export default function LoansPage() {
    const defaultLoans = [
        { id: '#L-1024', name: 'John Doe', image: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', amount: 5000, rate: 5.5, durationMonths: 12, amountLeft: 2140, status: 'Active', disburseDate: 'Oct 15, 2025' },
        { id: '#L-1025', name: 'Sarah Smith', image: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', amount: 12000, rate: 4.0, durationMonths: 24, amountLeft: 0, status: 'Paid Full', disburseDate: 'Jan 10, 2024' },
        { id: '#L-1026', name: 'Mike Ross', image: 'https://i.pravatar.cc/150?u=a04258114e29026302d', amount: 3500, rate: 6.0, durationMonths: 6, amountLeft: 3500, status: 'Overdue', disburseDate: 'Dec 01, 2025' },
        { id: '#L-1027', name: 'Rachel Zane', image: 'https://i.pravatar.cc/150?u=a042581f4e290260241', amount: 8000, rate: 4.5, durationMonths: 18, amountLeft: 4200, status: 'Active', disburseDate: 'Mar 20, 2025' },
        { id: '#L-1028', name: 'Harvey Specter', image: 'https://i.pravatar.cc/150?u=a042581f4e290260242', amount: 25000, rate: 3.8, durationMonths: 36, amountLeft: 0, status: 'Paid Full', disburseDate: 'Jun 05, 2023' },
    ];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [loans, setLoans] = React.useState<any[]>([]);
    const [isMounted, setIsMounted] = React.useState(false);
    const [isRepaymentModalOpen, setIsRepaymentModalOpen] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const ITEMS_PER_PAGE = 10;

    const refreshLoans = () => {
        const saved = localStorage.getItem('edualliance_loans');
        if (saved) {
            try {
                setLoans(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse loans, resetting to default.");
                setLoans(defaultLoans);
                localStorage.setItem('edualliance_loans', JSON.stringify(defaultLoans));
            }
        } else {
            setLoans(defaultLoans);
            localStorage.setItem('edualliance_loans', JSON.stringify(defaultLoans));
        }
    };

    React.useEffect(() => {
        setIsMounted(true);
        refreshLoans();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    if (!isMounted) return null; // Avoid hydration mismatch on initial render

    // Dynamic KPI Calculations
    const activeLoansArr = loans.filter((l: any) => l.status === 'Active');
    const overdueLoansArr = loans.filter((l: any) => l.status === 'Overdue');
    const nonPaidLoansArr = loans.filter((l: any) => l.status !== 'Paid Full');

    const totalPortfolio = nonPaidLoansArr.reduce((sum: number, l: any) => sum + Number(l.amount), 0);
    const activeLoansCount = activeLoansArr.length;
    const overdueVolume = overdueLoansArr.reduce((sum: number, l: any) => sum + Number(l.amountLeft), 0);
    const avgInterestRate = activeLoansArr.length > 0 
        ? activeLoansArr.reduce((sum: number, l: any) => sum + Number(l.rate), 0) / activeLoansArr.length 
        : 0;

    // Pagination logic
    const totalPages = Math.ceil(loans.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedLoans = loans.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const startEntry = Math.min(startIndex + 1, loans.length);
    const endEntry = Math.min(startIndex + ITEMS_PER_PAGE, loans.length);

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
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg Interest Rate</span>
                            <span className="material-symbols-outlined text-slate-600">percent</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-strong">{avgInterestRate.toFixed(1)}%</h3>
                            <span className="text-[10px] font-bold text-slate-500">stable</span>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-main/40 p-1.5 rounded-xl border border-border-subtle w-full">
                    <div className="flex gap-1 bg-surface p-1 rounded-lg border border-border-subtle">
                        <button className="px-4 py-1.5 rounded-md bg-brand-teal text-strong text-xs font-bold shadow-md">All Loans</button>
                        <button className="px-4 py-1.5 rounded-md text-slate-500 hover:text-strong text-xs font-bold transition-colors">Active</button>
                        <button className="px-4 py-1.5 rounded-md text-slate-500 hover:text-strong text-xs font-bold transition-colors">Overdue</button>
                        <button className="px-4 py-1.5 rounded-md text-slate-500 hover:text-strong text-xs font-bold transition-colors">Paid</button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-bold px-4">
                        <span>Showing {loans.length > 0 ? startEntry : 0}-{endEntry} of {loans.length} entries</span>
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
                <div className="bg-panel border border-border-subtle rounded-2xl overflow-hidden overflow-x-auto">
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
                                            <img src={loan.image} alt={loan.name} className="size-8 rounded-full border border-border-subtle" />
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
                                        <button className="text-slate-500 hover:text-strong transition-colors">
                                            <span className="material-symbols-outlined">more_vert</span>
                                        </button>
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
                                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                                        currentPage === page 
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
