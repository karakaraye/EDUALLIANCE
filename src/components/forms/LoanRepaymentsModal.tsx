import React, { useState, useMemo } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface LoanRepaymentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    loans: any[];
    onLoansUpdated?: () => void;
}

export const LoanRepaymentsModal = ({ isOpen, onClose, loans, onLoansUpdated }: LoanRepaymentsModalProps) => {
    // Default to current month's start and end date
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);

    const [startDate, setStartDate] = useState<string>(firstDay);
    const [endDate, setEndDate] = useState<string>(lastDay);
    
    // Force re-render when a payment is marked
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Calculate payouts
    const payoutsList = useMemo(() => {
        if (!startDate || !endDate) return [];

        const startTarget = new Date(startDate);
        startTarget.setHours(0, 0, 0, 0);

        const endTarget = new Date(endDate);
        endTarget.setHours(23, 59, 59, 999);

        const payouts: any[] = [];

        loans.forEach(loan => {
            if (loan.status === 'Paid Full') return;

            const loanStartDate = new Date(loan.disburseDate);
            if (isNaN(loanStartDate.getTime())) return;

            const amount = Number(loan.amount);
            const rate = Number(loan.rate);
            const duration = Number(loan.durationMonths);
            
            const interestEarned = amount * (rate / 100) * duration;
            const expectedTotalRepayment = amount + interestEarned;
            const monthlyPayment = duration > 0 ? expectedTotalRepayment / duration : 0;

            for (let i = 1; i <= duration; i++) {
                const dueDate = new Date(loanStartDate.getFullYear(), loanStartDate.getMonth() + i, loanStartDate.getDate());

                if (dueDate >= startTarget && dueDate <= endTarget) {
                    const repaymentRecord = loan.repayments && loan.repayments[i];
                    let amountPaid = 0;
                    if (repaymentRecord === true) {
                        amountPaid = monthlyPayment;
                    } else if (typeof repaymentRecord === 'number') {
                        amountPaid = repaymentRecord;
                    }

                    const isFullyPaid = amountPaid >= monthlyPayment - 0.01;
                    const isPartiallyPaid = amountPaid > 0 && !isFullyPaid;

                    payouts.push({
                        id: `${loan.id}-${i}`,
                        borrowerName: loan.name,
                        paymentNumber: i,
                        totalDuration: duration,
                        dueDate: dueDate,
                        amount: monthlyPayment,
                        amountPaid: amountPaid,
                        originalId: loan.id,
                        isPaid: isFullyPaid,
                        isPartiallyPaid: isPartiallyPaid
                    });
                }
            }
        });

        // Sort by dueDate sequentially
        return payouts.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    }, [loans, startDate, endDate, refreshTrigger]);

    if (!isOpen) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    const updatePaymentAmount = (loanId: string, paymentNum: number, newAmountPaid: number) => {
        const savedLoans = localStorage.getItem('edualliance_loans');
        if (savedLoans) {
            try {
                const parsed = JSON.parse(savedLoans);
                const updatedLoans = parsed.map((l: any) => {
                    if (l.id === loanId) {
                        const newRepayments = { ...(l.repayments || {}) };
                        
                        if (newAmountPaid <= 0) {
                            delete newRepayments[paymentNum];
                        } else {
                            newRepayments[paymentNum] = newAmountPaid;
                        }
                        
                        // Recalculate amountLeft and status
                        const amount = Number(l.amount);
                        const rate = Number(l.rate);
                        const duration = Number(l.durationMonths);
                        const interestEarned = amount * (rate / 100) * duration;
                        const expectedTotal = amount + interestEarned;
                        const monthlyPayment = duration > 0 ? expectedTotal / duration : 0;
                        
                        let paidAmount = 0;
                        let paidCount = 0;
                        for (let i = 1; i <= duration; i++) {
                            const rec = newRepayments[i];
                            let instPaid = 0;
                            if (rec === true) {
                                instPaid = monthlyPayment;
                                paidCount++;
                            } else if (typeof rec === 'number') {
                                instPaid = rec;
                                if (instPaid >= monthlyPayment - 0.01) {
                                    paidCount++;
                                }
                            }
                            paidAmount += instPaid;
                        }
                        
                        let newAmountLeft = expectedTotal - paidAmount;
                        if (newAmountLeft < 0.01) newAmountLeft = 0; // Float precision
                        
                        let newStatus = l.status;
                        if (paidCount === duration || newAmountLeft === 0) {
                            newStatus = 'Paid Full';
                        } else if (l.status === 'Paid Full' && newAmountLeft > 0) {
                            newStatus = 'Active';
                        }

                        return { 
                            ...l, 
                            repayments: newRepayments,
                            amountLeft: newAmountLeft,
                            status: newStatus
                        };
                    }
                    return l;
                });
                localStorage.setItem('edualliance_loans', JSON.stringify(updatedLoans));
                
                // mutate local object for instant UI update without waiting for parent refresh
                const ref = loans.find(l => l.id === loanId);
                if (ref) {
                    ref.repayments = ref.repayments || {};
                    if (newAmountPaid <= 0) {
                        delete ref.repayments[paymentNum];
                    } else {
                        ref.repayments[paymentNum] = newAmountPaid;
                    }
                }

                setRefreshTrigger(prev => prev + 1);
                if (onLoansUpdated) onLoansUpdated();
            } catch (e) {
                console.error("Failed to update payment amount:", e);
            }
        }
    };

    const handlePaymentClick = (payout: any) => {
        if (payout.isPaid) {
            if (confirm("Are you sure you want to undo this full payment?")) {
                updatePaymentAmount(payout.originalId, payout.paymentNumber, 0);
            }
        } else {
            const defaultAmount = payout.amount - payout.amountPaid;
            const input = window.prompt(`Enter payment amount (Expected: ${formatCurrency(defaultAmount)}):`, defaultAmount.toString());
            if (input !== null) {
                const num = parseFloat(input);
                if (!isNaN(num) && num > 0) {
                    const newTotalPaid = payout.amountPaid + num;
                    updatePaymentAmount(payout.originalId, payout.paymentNumber, newTotalPaid);
                } else if (num === 0) {
                    updatePaymentAmount(payout.originalId, payout.paymentNumber, 0);
                } else {
                    alert("Invalid amount entered.");
                }
            }
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
                        <span className="material-symbols-outlined text-brand-teal">calendar_month</span>
                        Loan Monthly Repayments
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
                <div className="p-6 flex flex-col gap-6 overflow-y-auto">
                    
                    {/* Controls & Summary */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-main/50 p-4 border border-border-subtle rounded-xl">
                        <div className="flex gap-4 w-full md:w-auto">
                            <div className="flex flex-col gap-1.5 w-full md:w-auto">
                                <label className="text-xs font-bold text-slate-400">Start Date</label>
                                <input 
                                    type="date" 
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="h-11 px-4 bg-surface border border-border-subtle rounded-lg text-sm text-strong focus:border-brand-teal focus:outline-none transition-colors"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5 w-full md:w-auto">
                                <label className="text-xs font-bold text-slate-400">End Date</label>
                                <input 
                                    type="date" 
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="h-11 px-4 bg-surface border border-border-subtle rounded-lg text-sm text-strong focus:border-brand-teal focus:outline-none transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col md:items-end">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Expected Collection</span>
                            <span className="text-2xl font-black text-brand-teal">{formatCurrency(totalForMonth)}</span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-main border border-border-subtle rounded-xl overflow-hidden shadow-inner">
                        {payoutsList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-10 text-slate-500">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">event_busy</span>
                                <p className="text-sm font-bold">No collections scheduled for this month.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-surface/50 border-b border-border-subtle">
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-[60px]">Date</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Borrower</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Payment #</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Amount Expected</th>
                                            <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center no-print w-[120px]">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-subtle">
                                        {payoutsList.map((payout) => (
                                            <tr key={payout.id} className={`hover:bg-white/[0.02] ${payout.isPaid ? 'opacity-50' : payout.isPartiallyPaid ? 'bg-orange-500/[0.02]' : ''}`}>
                                                <td className="px-5 py-4">
                                                    <div className={`flex flex-col items-center justify-center size-12 border rounded-lg ${payout.isPaid ? 'bg-green-500/10 border-green-500/20 text-green-500' : payout.isPartiallyPaid ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-brand-teal/10 border-brand-teal/20 text-brand-teal'}`}>
                                                        {payout.isPaid ? (
                                                            <span className="material-symbols-outlined text-[20px]">check</span>
                                                        ) : (
                                                            <>
                                                                <span className="text-sm font-black leading-none">{payout.dueDate.toLocaleDateString('en-US', { day: 'numeric' })}</span>
                                                                <span className="text-[9px] font-bold uppercase">{payout.dueDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-bold text-strong mb-0.5">{payout.borrowerName}</p>
                                                    <p className="text-xs text-slate-500 font-mono">{payout.originalId}</p>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className="text-xs font-bold text-slate-300 bg-surface px-2 py-1 rounded-md border border-border-subtle">
                                                        {payout.paymentNumber} / {payout.totalDuration}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className={`text-sm font-black ${payout.isPaid ? 'text-green-500 line-through' : payout.isPartiallyPaid ? 'text-orange-400' : 'text-strong'}`}>
                                                            {formatCurrency(payout.amountPaid)} / {formatCurrency(payout.amount)}
                                                        </span>
                                                        {payout.isPartiallyPaid && (
                                                            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest mt-1">Partial</span>
                                                        )}
                                                        {payout.isPaid && (
                                                            <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1">Paid</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-center no-print">
                                                    <button 
                                                        onClick={() => handlePaymentClick(payout)}
                                                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                                            payout.isPaid 
                                                            ? 'bg-transparent border border-slate-600 text-slate-500 hover:text-strong hover:border-slate-400' 
                                                            : payout.isPartiallyPaid
                                                            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500 hover:text-white'
                                                            : 'bg-brand-teal/10 text-brand-teal border border-brand-teal/20 hover:bg-brand-teal hover:text-strong'
                                                        }`}
                                                    >
                                                        {payout.isPaid ? 'Undo' : payout.isPartiallyPaid ? 'Pay More' : 'Pay'}
                                                    </button>
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
