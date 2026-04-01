import React, { useState, useEffect } from 'react';

interface EditLoanModalProps {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loan: any;
    onSave: () => void;
}

export const EditLoanModal = ({ isOpen, onClose, loan, onSave }: EditLoanModalProps) => {
    const [name, setName] = useState('');
    const [principal, setPrincipal] = useState(0);
    const [rate, setRate] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (loan) {
            setName(loan.name || '');
            setPrincipal(loan.amount ? Number(loan.amount) : 0);
            setRate(loan.rate ? Number(loan.rate) : 0);
            setDuration(loan.durationMonths ? Number(loan.durationMonths) : 0);
        }
    }, [loan]);

    if (!isOpen || !loan) return null;

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Recalculate based on new parameters
            const interestEarned = principal * (rate / 100) * duration;
            const expectedTotalRepayment = principal + interestEarned;
            
            // Recalculate paid amount from existing manual repayments if any
            const repayments = loan.repayments || {};
            let paidAmount = 0;
            const monthlyPayment = duration > 0 ? expectedTotalRepayment / duration : 0;
            
            for (let i = 1; i <= duration; i++) {
                const rec = repayments[i];
                if (rec === true) paidAmount += monthlyPayment;
                else if (typeof rec === 'number') paidAmount += rec;
            }
            
            let newAmountLeft = expectedTotalRepayment - paidAmount;
            if (newAmountLeft < 0.01) newAmountLeft = 0;
            
            const newStatus = newAmountLeft === 0 ? 'Paid Full' : 'Active';

            await fetch('/api/loans', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: loan.id,
                    name,
                    amount: principal,
                    interestRate: rate,
                    durationMonths: duration,
                    amountLeft: newAmountLeft,
                    status: newStatus
                })
            });
            onSave();
            onClose();
        } catch (e) {
            console.error("Failed to update loan", e);
            alert("Admin Save Failed");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-panel border border-border-subtle w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center bg-red-500/5">
                    <h2 className="text-lg font-black text-red-500 flex items-center gap-2">
                        <span className="material-symbols-outlined">shield_person</span>
                        Admin Override: Edit Loan
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-strong transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-5">
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-lg flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">warning</span>
                        <p>You are using Administrative Override capabilities to modify an existing legal contract. Recalculation of interest and balances will execute instantly.</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Borrower Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-11 px-4 bg-main border border-border-subtle rounded-lg text-sm text-strong focus:border-red-500 focus:outline-none transition-colors"
                        />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Principal Amount (₦)</label>
                        <input 
                            type="number" 
                            value={principal}
                            onChange={(e) => setPrincipal(Number(e.target.value))}
                            className="w-full h-11 px-4 bg-main border border-border-subtle rounded-lg text-sm text-strong focus:border-red-500 focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Interest Rate (%)</label>
                            <input 
                                type="number" 
                                value={rate}
                                onChange={(e) => setRate(Number(e.target.value))}
                                className="w-full h-11 px-4 bg-main border border-border-subtle rounded-lg text-sm text-strong focus:border-red-500 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Duration (Months)</label>
                            <input 
                                type="number" 
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="w-full h-11 px-4 bg-main border border-border-subtle rounded-lg text-sm text-strong focus:border-red-500 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-border-subtle bg-main/40 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-slate-300 text-sm font-bold hover:bg-white/5 transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-strong text-sm font-bold shadow-lg shadow-red-900/20 transition-all">Force Update</button>
                </div>
            </div>
        </div>
    );
};
