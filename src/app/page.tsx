'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function DashboardPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [loans, setLoans] = useState<any[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    
    // API State
    const [apiSummary, setApiSummary] = useState({
        totalExpenses: 0,
        totalPayroll: 0,
        totalInvestorsPrincipal: 0,
        totalInvestorsPayout: 0
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [apiLedger, setApiLedger] = useState<any[]>([]);

    useEffect(() => {
        setIsMounted(true);
        const saved = localStorage.getItem('edualliance_loans');
        if (saved) {
            try {
                setLoans(JSON.parse(saved));
            } catch (e) {
                // Ignore parsing errors
            }
        }

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
            }
        };

        fetchReports();
    }, []);

    const formatCurrencyShort = (amount: number) => {
        if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(2)}M`;
        if (amount >= 1000) return `₦${(amount / 1000).toFixed(1)}K`;
        return `₦${amount.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
    };

    const formatDateShort = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Calculate dynamic KPIs based on loans
    const portfolioAssets = loans.filter((l: any) => l.status !== 'Paid Full').reduce((sum: number, l: any) => sum + Number(l.amountLeft || l.amount), 0);
    
    // Annual Income
    const annualIncome = loans.reduce((sum: number, l: any) => {
        const oneOffFee = Number(l.amount) * 0.065;
        const interestEarned = Number(l.amount) * (Number(l.rate) / 100) * Number(l.durationMonths);
        return sum + oneOffFee + interestEarned;
    }, 0);

    // Dynamic expenses from modules
    const totalExpenses = apiSummary.totalExpenses + apiSummary.totalPayroll; 
    const netProfit = annualIncome - totalExpenses;

    // Build unified ledger for logs and table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loanLedger: any[] = loans.map(loan => ({
        id: `LOAN-${loan.id}`,
        type: 'Loan',
        description: `Disbursement to ${loan.name}`,
        category: loan.loanType || 'Business Loan',
        amount: Number(loan.amount),
        date: loan.disburseDate ? new Date(loan.disburseDate).toISOString() : new Date().toISOString(),
        status: loan.status
    }));

    const fullLedger = [...apiLedger, ...loanLedger].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recentActivity = fullLedger.slice(0, 4);
    const recentLedger = fullLedger.slice(0, 6);

    if (!isMounted) return null;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-10">

        {/* Title Section */}
        <div className="flex flex-col gap-1 border-l-4 border-primary pl-6 py-1">
          <h1 className="text-3xl font-black tracking-tight text-strong uppercase">Executive Insight Hub</h1>
          <p className="text-slate-500 text-sm font-semibold tracking-wider">REAL-TIME FINANCIAL OPERATIONAL INTELLIGENCE</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Metric 1 */}
          <div className="group flex flex-col gap-4 rounded-2xl p-7 bg-panel border border-border-subtle hover:border-primary/30 transition-all duration-300">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Portfolio Assets</span>
              <div className="flex items-center gap-1 text-primary text-[11px] font-bold bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                <span className="material-symbols-outlined text-[12px] font-bold">trending_up</span> 12.5%
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-strong text-4xl font-extrabold tracking-tighter">{formatCurrencyShort(portfolioAssets)}</p>
              <p className="text-slate-600 text-xs mt-1">vs. last fiscal month</p>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="group flex flex-col gap-4 rounded-2xl p-7 bg-panel border border-border-subtle hover:border-red-500/30 transition-all duration-300">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Total Expenses</span>
              <div className="flex items-center gap-1 text-red-400 text-[11px] font-bold bg-red-400/5 px-2 py-0.5 rounded-full border border-red-400/10">
                <span className="material-symbols-outlined text-[12px] font-bold">trending_down</span> 2.1%
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-strong text-4xl font-extrabold tracking-tighter">{formatCurrencyShort(totalExpenses)}</p>
              <p className="text-slate-600 text-xs mt-1">Sourced from Payroll & Expenses</p>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="group flex flex-col gap-4 rounded-2xl p-7 bg-panel border border-border-subtle hover:border-primary/30 transition-all duration-300">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Annual Income</span>
              <div className="flex items-center gap-1 text-primary text-[11px] font-bold bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                <span className="material-symbols-outlined text-[12px] font-bold">trending_up</span> 8.4%
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-strong text-4xl font-extrabold tracking-tighter">{formatCurrencyShort(annualIncome)}</p>
              <p className="text-slate-600 text-xs mt-1">YTD Revenue projection</p>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="group flex flex-col gap-4 rounded-2xl p-7 bg-panel border border-border-subtle hover:border-primary/30 transition-all duration-300">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Net Profit</span>
              <div className="flex items-center gap-1 text-primary text-[11px] font-bold bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                <span className="material-symbols-outlined text-[12px] font-bold">trending_up</span> 15.2%
              </div>
            </div>
            <div className="flex flex-col">
              <p className={`text-4xl font-extrabold tracking-tighter ${netProfit >= 0 ? 'text-strong' : 'text-red-400'}`}>{formatCurrencyShort(netProfit)}</p>
              <p className="text-slate-600 text-xs mt-1">Net operational margin: 86%</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-3 flex flex-col bg-panel rounded-2xl border border-border-subtle overflow-hidden">
            <div className="p-8 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-strong text-xl font-bold tracking-tight">Financial Dynamics</h3>
                <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">Annual Performance Matrix 2024</p>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex flex-col text-right">
                  <span className="text-primary text-2xl font-black">86.2%</span>
                  <span className="text-slate-600 text-[9px] font-black uppercase tracking-widest">Efficiency</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-strong text-2xl font-black">+₦42k</span>
                  <span className="text-slate-600 text-[9px] font-black uppercase tracking-widest">MoM Growth</span>
                </div>
              </div>
            </div>
            <div className="px-8 py-6 h-[340px] w-full relative">
              {/* SVG Chart */}
              <svg className="w-full h-full text-primary" preserveAspectRatio="none" viewBox="0 0 1000 300">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.2"></stop>
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <path d="M0 250 C 100 240, 150 150, 200 160 S 300 100, 400 120 S 500 200, 600 180 S 750 40, 850 60 S 1000 140, 1000 140 V 300 H 0 Z" fill="url(#chartGradient)"></path>
                <path d="M0 250 C 100 240, 150 150, 200 160 S 300 100, 400 120 S 500 200, 600 180 S 750 40, 850 60 S 1000 140, 1000 140" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
                <line stroke="rgba(255,255,255,0.05)" strokeWidth="1" x1="0" x2="1000" y1="280" y2="280"></line>
              </svg>
              <div className="flex justify-between mt-4 px-2 absolute bottom-2 left-8 right-8">
                <span className="text-[10px] font-black text-slate-600 uppercase">Jan</span>
                <span className="text-[10px] font-black text-slate-600 uppercase">Mar</span>
                <span className="text-[10px] font-black text-slate-600 uppercase">May</span>
                <span className="text-[10px] font-black text-slate-600 uppercase">Jul</span>
                <span className="text-[10px] font-black text-slate-600 uppercase">Sep</span>
                <span className="text-[10px] font-black text-slate-600 uppercase">Nov</span>
              </div>
            </div>
          </div>

          {/* Operational Log */}
          <div className="lg:col-span-1 flex flex-col bg-panel rounded-2xl border border-border-subtle overflow-hidden">
            <div className="p-6 border-b border-border-subtle">
              <h3 className="text-strong text-sm font-black uppercase tracking-widest">Operational Log</h3>
            </div>
            <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar max-h-[300px]">
              {recentActivity.length > 0 ? recentActivity.map((activity, idx) => (
                <div key={`${activity.id}-${idx}`} className="flex gap-4 group cursor-default">
                  <div className={`size-2.5 rounded-full mt-1 shrink-0 ring-4 ${
                      activity.type === 'Loan' ? 'bg-brand-teal ring-brand-teal/10' :
                      activity.type === 'Expense' ? 'bg-red-400 ring-red-400/10' :
                      activity.type === 'Payroll' ? 'bg-yellow-400 ring-yellow-400/10' :
                      'bg-purple-400 ring-purple-400/10'
                  }`}></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-200">{activity.type} Activity</span>
                    <span className="text-xs text-slate-500 mt-0.5">{activity.description} - {formatCurrencyShort(activity.amount)}</span>
                    <span className="text-[10px] font-bold text-slate-600 mt-2">{formatDateShort(activity.date)}</span>
                  </div>
                </div>
              )) : (
                <div className="text-slate-500 text-sm font-bold flex items-center justify-center p-4">No recent activity detected.</div>
              )}
            </div>
            <div className="p-6 bg-main/30 border-t border-border-subtle mt-auto">
              <button className="w-full py-2.5 rounded-lg border border-border-subtle text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-strong hover:bg-white/5 transition-all">
                Full Activity Report
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Transactions */}
        <div className="flex flex-col bg-panel rounded-2xl border border-border-subtle overflow-hidden">
          <div className="flex items-center justify-between p-8 border-b border-border-subtle bg-main/20">
            <div className="flex items-center gap-4">
              <h3 className="text-strong text-xl font-bold tracking-tight">Ledger Transactions</h3>
              <span className="px-3 py-1 bg-white/5 border border-border-subtle rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time</span>
            </div>
            <div className="flex gap-3">
              <button className="p-2.5 bg-panel hover:bg-white/5 border border-border-subtle rounded-lg text-slate-400 transition-all">
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-panel hover:bg-white/5 border border-border-subtle rounded-lg text-slate-300 text-xs font-bold transition-all">
                <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-main/40 border-b border-border-subtle">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">ID Reference</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Counterparty & Essence</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Category</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Amount (NGN)</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Protocol Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {recentLedger.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-8 py-10 text-center text-slate-500 text-sm font-bold">
                            No ledger transactions available. Check the Reports module.
                        </td>
                    </tr>
                ) : (
                    recentLedger.map((txn, i) => (
                        <tr key={`${txn.id}-${i}`} className="row-hover-effect group cursor-pointer">
                          <td className="px-8 py-6 text-xs font-mono text-slate-600">{txn.id}</td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-strong group-hover:text-primary transition-colors max-w-[200px] truncate">{txn.description}</span>
                              <span className="text-xs text-slate-500 mt-0.5">{txn.type}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface border border-border-subtle text-slate-400">{txn.category}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`text-sm font-black ${txn.type === 'Expense' || txn.type === 'Payroll' ? 'text-red-400' : 'text-brand-teal'}`}>
                                {txn.type === 'Expense' || txn.type === 'Payroll' ? '-' : '+'}{formatCurrencyShort(txn.amount)}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <div className={`size-1.5 rounded-full ${txn.status === 'Draft' || txn.status === 'PENDING' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'bg-primary shadow-[0_0_8px_rgba(52,211,153,0.5)]'}`}></div>
                              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{txn.status}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-xs font-bold text-slate-500 text-right">{formatDateShort(txn.date)}</td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
