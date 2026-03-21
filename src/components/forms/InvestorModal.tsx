import React, { useState } from 'react';

interface InvestorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const InvestorModal = ({ isOpen, onClose, onSuccess }: InvestorModalProps) => {
    const [name, setName] = useState('');
    const [amountInvested, setAmountInvested] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [dateInvested, setDateInvested] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/investors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    amountInvested,
                    interestRate,
                    dateInvested
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit the investor');
            }

            // reset form
            setName('');
            setAmountInvested('');
            setInterestRate('');
            setDateInvested('');
            
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div 
                className="bg-panel border border-border-subtle w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center bg-main/40">
                    <h2 className="text-lg font-black text-strong flex items-center gap-2">
                        <span className="material-symbols-outlined text-brand-teal">handshake</span>
                        Add New Investor
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-strong transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                    {error && (
                        <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-400">Investor Name</label>
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-11 px-4 bg-main border border-border-subtle rounded-lg text-sm text-strong focus:border-brand-teal focus:outline-none transition-colors" 
                                placeholder="e.g. Acme Corp / Jane Doe"
                            />
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-400">Amount Invested (₦)</label>
                            <input 
                                type="number" 
                                required
                                min="0"
                                step="any"
                                value={amountInvested}
                                onChange={(e) => setAmountInvested(e.target.value)}
                                className="w-full h-11 px-4 bg-main border border-border-subtle rounded-lg text-sm text-strong focus:border-brand-teal focus:outline-none transition-colors" 
                                placeholder="Enter amount"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-400">Interest Rate (%)</label>
                            <input 
                                type="number" 
                                required
                                min="0"
                                step="any"
                                value={interestRate}
                                onChange={(e) => setInterestRate(e.target.value)}
                                className="w-full h-11 px-4 bg-main border border-border-subtle rounded-lg text-sm text-strong focus:border-brand-teal focus:outline-none transition-colors" 
                                placeholder="e.g. 5"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-400">Date Invested</label>
                            <input 
                                type="date" 
                                required
                                value={dateInvested}
                                onChange={(e) => setDateInvested(e.target.value)}
                                className="w-full h-11 px-4 bg-main border border-border-subtle rounded-lg text-sm text-slate-400 focus:border-brand-teal focus:outline-none transition-colors" 
                            />
                        </div>
                    </div>

                    <div className="border-t border-border-subtle pt-5 mt-2 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg border border-border-subtle text-slate-300 text-xs font-bold hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-lg bg-brand-teal hover:bg-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-panel text-strong text-xs font-bold transition-all shadow-lg shadow-teal-900/20 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    Add Investor
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
