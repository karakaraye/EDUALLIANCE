import React, { useState, useMemo } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface InvestorRepaymentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    investors: any[];
}

export const InvestorRepaymentsModal = ({ isOpen, onClose, investors }: InvestorRepaymentsModalProps) => {
    // Default to current month string "YYYY-MM"
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
    
    const [expenses, setExpenses] = useState<any[]>([]);
    const [systemAdminId, setSystemAdminId] = useState<string>('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    React.useEffect(() => {
        if (isOpen) {
            fetch('/api/expenses')
                .then(res => res.json())
                .then(data => setExpenses(Array.isArray(data) ? data : []))
                .catch(err => console.error(err));
            
            fetch('/api/employees')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                        setSystemAdminId(data[0].id);
                    }
                })
                .catch(err => console.error(err));
        }
    }, [isOpen]);

    // Calculate payouts
    const payoutsList = useMemo(() => {
        if (!selectedMonth) return [];

        const [yearStr, monthStr] = selectedMonth.split('-');
        const targetYear = parseInt(yearStr, 10);
        const targetMonthIndex = parseInt(monthStr, 10) - 1; // 0-indexed month

        const payouts: any[] = [];

        investors.forEach(inv => {
            const startDate = new Date(inv.rawDate);
            const amount = Number(inv.amountInvested);
            const rate = Number(inv.interestRate);
            
            // Monthly Payment = (Principal / 12) + (Principal * Rate / 100)
            const monthlyPayment = (amount / 12) + (amount * (rate / 100));

            for (let i = 1; i <= 12; i++) {
                // Calculate each due date by adding i months
                const dueDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, startDate.getDate());

                if (dueDate.getFullYear() === targetYear && dueDate.getMonth() === targetMonthIndex) {
                    payouts.push({
                        id: `${inv.id}-${i}`,
                        investorName: inv.name,
                        paymentNumber: i,
                        dueDate: dueDate,
                        dayOfMonth: dueDate.getDate(),
                        amount: monthlyPayment,
                        originalId: inv.displayId
                    });
                }
            }
        });

        // Sort by day of the month sequentially (1 to 31)
        return payouts.sort((a, b) => a.dayOfMonth - b.dayOfMonth);
    }, [investors, selectedMonth]);

    if (!isOpen) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    const getPaymentDesc = (payout: any) => `Investor Payout - ${payout.investorName} (Payment ${payout.paymentNumber}/12, ${selectedMonth})`;

    const isPaid = (payout: any) => {
        const desc = getPaymentDesc(payout);
        return expenses.some(exp => exp.desc === desc && exp.category === 'Investor Payout');
    };

    const handleMarkPaid = async (payout: any) => {
        if (!systemAdminId) {
            alert("No system administrator context found. Please ensure users exist in the system to act as authorizing managers.");
            return;
        }
        setProcessingId(payout.id);
        
        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: getPaymentDesc(payout),
                    amount: payout.amount,
                    category: 'Investor Payout',
                    date: new Date().toISOString(),
                    managerId: systemAdminId
                })
            });

            if (res.ok) {
                const refreshedExp = await fetch('/api/expenses').then(r => r.json());
                setExpenses(Array.isArray(refreshedExp) ? refreshedExp : []);
            }
        } catch (err) {
            console.error("Failed to mark paid", err);
        } finally {
            setProcessingId(null);
        }
    };

    const totalForMonth = payoutsList.reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto w-full h-full pb-[10vh]">
            <div 
                className="bg-panel border border-border-subtle w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] printable-area"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center bg-main/40">
                    <h2 className="text-lg font-black text-strong flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-400">calendar_month</span>
                        Monthly Repayment Schedule
                    </h2>
                    <div className="flex items-center gap-3 no-print">
                        <button onClick={() => window.print()} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border-subtle text-slate-300 hover:text-strong hover:bg-white/5 text-xs font-bold transition-colors">
                            <span className="material-symbols-outlined text-[16px]">print</span> Print
                        </button>
                        <button onClick={onClose} className="text-slate-500 hover:text-strong transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col gap-6 flex-1 min-h-0">
                    
                    {/* Controls & Summary */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-main/50 p-4 border border-border-subtle rounded-xl">
                        <div className="flex flex-col gap-1.5 w-full md:w-auto">
                            <label className="text-xs font-bold text-slate-400">Select Month & Year</label>
                            <input 
                                type="month" 
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="h-11 px-4 bg-surface border border-border-subtle rounded-lg text-sm text-strong focus:border-purple-400 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="flex flex-col md:items-end">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Payout for Month</span>
                            <span className="text-2xl font-black text-strong">{formatCurrency(totalForMonth)}</span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-main border border-border-subtle rounded-xl shadow-inner flex-1 flex flex-col min-h-[300px]">
                        {payoutsList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-10 text-slate-500">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">event_busy</span>
                                <p className="text-sm font-bold">No payments scheduled for this month.</p>
                            </div>
                        ) : (
                            <div className="overflow-y-scroll overflow-x-auto custom-scrollbar flex-1 relative">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 z-10 bg-main border-b border-border-subtle shadow-sm">
                                        <tr>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-[60px]">Date</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Investor</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Payment # (of 12)</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Amount Required</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right w-[140px]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-subtle">
                                        {payoutsList.map((payout) => (
                                            <tr key={payout.id} className="hover:bg-white/[0.02]">
                                                <td className="px-5 py-4">
                                                    <div className="flex flex-col items-center justify-center size-10 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
                                                        <span className="text-lg font-black leading-none">{payout.dayOfMonth}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-bold text-strong mb-0.5">{payout.investorName}</p>
                                                    <p className="text-xs text-slate-500 font-mono">{payout.originalId}</p>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className="text-xs font-bold text-slate-300 bg-surface px-2 py-1 rounded-md border border-border-subtle">
                                                        {payout.paymentNumber} / 12
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <span className="text-sm font-black text-strong">{formatCurrency(payout.amount)}</span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    {isPaid(payout) ? (
                                                        <span className="flex items-center justify-end gap-1 text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-md w-max ml-auto">
                                                            <span className="material-symbols-outlined text-[14px]">check_circle</span> Paid
                                                        </span>
                                                    ) : (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleMarkPaid(payout); }}
                                                            disabled={processingId === payout.id}
                                                            className="flex items-center justify-end gap-1 text-[10px] font-bold text-brand-teal hover:text-white uppercase tracking-widest bg-brand-teal/10 hover:bg-brand-teal px-3 py-1.5 rounded-md transition-colors w-max ml-auto disabled:opacity-50"
                                                        >
                                                            {processingId === payout.id ? (
                                                                <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span>
                                                            ) : (
                                                                <span className="material-symbols-outlined text-[14px]">payments</span>
                                                            )}
                                                            {processingId === payout.id ? 'Processing' : 'Mark Paid'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};
