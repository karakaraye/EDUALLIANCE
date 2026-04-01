'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
    const [timeFrame, setTimeFrame] = useState<number>(6);
    const [ledgerFilter, setLedgerFilter] = useState('All');

    useEffect(() => {
        setIsMounted(true);

        const fetchAllData = async () => {
            try {
                // Fetch reports
                const resReports = await fetch('/api/reports');
                const dataReports = await resReports.json();
                setApiSummary(dataReports.summary || {
                    totalExpenses: 0, totalPayroll: 0, totalInvestorsPrincipal: 0, totalInvestorsPayout: 0
                });
                setApiLedger(dataReports.ledger || []);

                // Fetch loans
                const resLoans = await fetch('/api/loans');
                const dataLoans = await resLoans.json();
                if (Array.isArray(dataLoans)) {
                    setLoans(dataLoans);
                }
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            }
        };

        fetchAllData();
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

    const filteredLedger = fullLedger.filter(t => {
        if (ledgerFilter === 'All') return true;
        if (['Loan', 'Expense', 'Payroll', 'Income'].includes(ledgerFilter)) return t.type === ledgerFilter;
        return t.status === ledgerFilter || t.status === ledgerFilter.toUpperCase();
    }).slice(0, 20); // Expand from 6 to 20 so it feels like a real table

    const handleExportCSV = () => {
        if (filteredLedger.length === 0) return alert("No records to export.");
        
        const headers = ['ID Reference', 'Description', 'Category', 'Type', 'Amount (NGN)', 'Status', 'Timestamp'];
        const csvRows = [headers.join(',')];
        
        filteredLedger.forEach(txn => {
            const row = [
                `"${txn.id}"`,
                `"${txn.description.replace(/"/g, '""')}"`,
                `"${txn.category}"`,
                `"${txn.type}"`,
                `"${txn.amount}"`,
                `"${txn.status}"`,
                `"${new Date(txn.date).toLocaleString('en-US')}"`
            ];
            csvRows.push(row.join(','));
        });
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `Edualliance_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Financial Dynamics Calculation
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const chartMonthsRange = Array.from({length: timeFrame}, (_, i) => {
        const d = new Date(currentYear, currentMonth - (timeFrame - 1) + i, 1);
        return { month: d.getMonth(), year: d.getFullYear(), label: months[d.getMonth()] };
    });

    const monthlyFinancials = chartMonthsRange.map(m => {
        const txns = fullLedger.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === m.month && d.getFullYear() === m.year;
        });
        const income = txns.filter(t => t.type === 'Loan' || t.type === 'Income').reduce((sum, t) => sum + (Number(t.amount) * 0.065), 0);
        const expense = txns.filter(t => t.type === 'Expense' || t.type === 'Payroll').reduce((sum, t) => sum + Number(t.amount), 0);
        return { label: m.label, income, expense, profit: income - expense };
    });

    const currentMonthData = monthlyFinancials[monthlyFinancials.length - 1] || {profit: 0};
    const prevMonthData = monthlyFinancials[monthlyFinancials.length - 2] || {profit: 0};
    const momGrowth = currentMonthData.profit - prevMonthData.profit;
    const momLabel = momGrowth >= 0 ? `+${formatCurrencyShort(momGrowth)}` : formatCurrencyShort(momGrowth);

    const total6MoIncome = monthlyFinancials.reduce((sum, m) => sum + m.income, 0);
    const total6MoExpense = monthlyFinancials.reduce((sum, m) => sum + m.expense, 0);
    const efficiency = total6MoIncome > 0 ? (((total6MoIncome - total6MoExpense) / total6MoIncome) * 100).toFixed(1) : '0.0';
    const maxChartVal = Math.max(...monthlyFinancials.map(m => Math.max(m.income, m.expense)), 10000);


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
                <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">Performance Metrics</p>
              </div>
              <div className="flex items-center gap-4 sm:gap-8">
                <select 
                   value={timeFrame} 
                   onChange={(e) => setTimeFrame(Number(e.target.value))}
                   className="bg-panel border border-border-subtle text-slate-400 text-xs font-bold rounded px-2 py-1.5 sm:px-4 sm:py-2 cursor-pointer outline-none hover:border-brand-teal/50 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all appearance-none"
                >
                   <option value={3} className="bg-panel text-strong">Last 3 Months</option>
                   <option value={6} className="bg-panel text-strong">Last 6 Months</option>
                   <option value={12} className="bg-panel text-strong">Last 12 Months</option>
                </select>
                <div className="hidden sm:flex items-center gap-8 pl-6 border-l border-border-subtle">
                  <div className="flex flex-col text-right">
                    <span className="text-primary text-2xl font-black">{efficiency}%</span>
                    <span className="text-slate-600 text-[9px] font-black uppercase tracking-widest">Efficiency</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className={`text-2xl font-black ${momGrowth >= 0 ? 'text-strong' : 'text-red-400'}`}>{momLabel}</span>
                    <span className="text-slate-600 text-[9px] font-black uppercase tracking-widest">MoM Growth</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Dynamic Tailwind Bar Chart */}
            <div className="flex h-[280px] w-full items-end justify-between px-2 sm:px-6 pb-12 pt-4 relative">
              {/* Horizontal grid lines */}
              <div className="absolute inset-x-8 bottom-12 top-4 flex flex-col justify-between z-0 pointer-events-none opacity-[0.03]">
                <div className="w-full border-t border-white"></div>
                <div className="w-full border-t border-white"></div>
                <div className="w-full border-t border-white"></div>
                <div className="w-full border-t border-white"></div>
              </div>
              
              {monthlyFinancials.map((data, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 z-10 flex-1 relative group w-full">
                    <div className="flex items-end justify-center w-full gap-1 sm:gap-2 h-[220px]">
                      {/* Income Bar */}
                      <div 
                        className="w-1/3 max-w-[24px] bg-brand-teal rounded-t transition-all duration-500 relative hover:brightness-125 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                        style={{ height: `${(data.income / maxChartVal) * 100}%`, minHeight: '4px' }}
                      >
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface border border-border-subtle text-strong text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-xl">In: {formatCurrencyShort(data.income)}</div>
                      </div>
                      {/* Expense Bar */}
                      <div 
                        className="w-1/3 max-w-[24px] bg-red-400 rounded-t transition-all duration-500 relative hover:brightness-125 hover:shadow-[0_0_15px_rgba(248,113,113,0.3)]"
                        style={{ height: `${(data.expense / maxChartVal) * 100}%`, minHeight: '4px' }}
                      >
                         <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-surface border border-border-subtle text-strong text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-xl">Out: {formatCurrencyShort(data.expense)}</div>
                      </div>
                    </div>
                    {/* X-Axis Label */}
                    <span className="text-[10px] font-black text-slate-500 uppercase absolute -bottom-8">{data.label}</span>
                  </div>
              ))}
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
              <Link href="/reports">
                  <button className="w-full py-2.5 rounded-lg border border-border-subtle text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-strong hover:bg-white/5 transition-all">
                    Full Activity Report
                  </button>
              </Link>
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
            <div className="flex gap-3 relative">
              <select 
                  value={ledgerFilter}
                  onChange={(e) => setLedgerFilter(e.target.value)}
                  className="flex items-center gap-2 px-3 py-2.5 bg-panel hover:bg-white/5 border border-border-subtle rounded-lg text-slate-300 text-xs font-bold transition-all appearance-none cursor-pointer outline-none focus:border-brand-teal"
              >
                  <option value="All">All Transactions</option>
                  <option value="Loan">Loans Only</option>
                  <option value="Expense">Expenses Only</option>
                  <option value="Payroll">Payroll Only</option>
                  <option value="Draft">Draft Status</option>
                  <option value="Pending">Pending Status</option>
              </select>
              <button 
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2.5 bg-panel hover:bg-white/5 border border-border-subtle rounded-lg text-slate-300 text-xs font-bold transition-all"
              >
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
                {filteredLedger.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-8 py-10 text-center text-slate-500 text-sm font-bold">
                            No ledger transactions available matching this filter.
                        </td>
                    </tr>
                ) : (
                    filteredLedger.map((txn, i) => (
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
