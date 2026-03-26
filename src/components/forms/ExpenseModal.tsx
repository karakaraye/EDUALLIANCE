import React, { useState, useEffect } from 'react';

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ExpenseModal({ isOpen, onClose, onSuccess }: ExpenseModalProps) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Office');
    const [date, setDate] = useState('');
    const [managerId, setManagerId] = useState('');
    const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState('');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [employees, setEmployees] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetch('/api/employees')
                .then(res => res.json())
                .then(data => setEmployees(data))
                .catch(err => console.error('Failed to load users for expense tracking:', err));
            // Preset to today
            setDate(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB
                alert("File too large. Maximum 2MB allowed.");
                e.target.value = '';
                return;
            }
            setFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setFileName('');
            setReceiptUrl(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description,
                    amount,
                    category,
                    date,
                    managerId,
                    receiptUrl
                })
            });

            if (res.ok) {
                // Reset form
                setDescription('');
                setAmount('');
                setCategory('Office');
                setManagerId('');
                setReceiptUrl(null);
                setFileName('');
                onSuccess();
                onClose();
            } else {
                console.error('Failed to save expense');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-panel border border-border-subtle w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-border-subtle bg-main/40 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black text-strong">Log Expense</h3>
                        <p className="text-xs text-slate-500 mt-1">Submit a new company cost or reimbursement request.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-strong transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Description</label>
                        <input 
                            type="text" 
                            required
                            placeholder="e.g. AWS Infrastructure Bill"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full bg-main/50 border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-strong focus:outline-none focus:border-brand-teal transition-colors"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Amount (₦)</label>
                            <input 
                                type="number" 
                                required
                                min="0"
                                step="any"
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full bg-main/50 border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-strong focus:outline-none focus:border-brand-teal transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Category</label>
                            <select 
                                required
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full bg-main/50 border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-strong focus:outline-none focus:border-brand-teal transition-colors appearance-none"
                            >
                                <option value="Office">Office</option>
                                <option value="Software">Software</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Travel">Travel</option>
                                <option value="Repairs">Repairs</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Date</label>
                            <input 
                                type="date" 
                                min="2022-01-01"
                                required
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full bg-main/50 border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-strong focus:outline-none focus:border-brand-teal transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Requested By</label>
                            <select 
                                required
                                value={managerId}
                                onChange={e => setManagerId(e.target.value)}
                                className="w-full bg-main/50 border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-strong focus:outline-none focus:border-brand-teal transition-colors appearance-none"
                            >
                                <option value="" disabled>Select Staff...</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Upload Receipt (Optional)</label>
                            {fileName && <span className="text-brand-teal text-[10px] font-bold italic truncate max-w-[150px]">{fileName}</span>}
                        </div>
                        <div className="relative">
                            <input 
                                type="file" 
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="w-full bg-main/50 border border-dashed border-border-subtle hover:border-brand-teal/50 rounded-xl px-4 py-3 text-sm text-slate-400 flex items-center justify-center gap-2 transition-colors">
                                <span className="material-symbols-outlined text-[18px]">{fileName ? 'done' : 'cloud_upload'}</span>
                                {fileName ? 'File Captured - Click to replace' : 'Click to browse or drag file here...'}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border-subtle flex gap-3 justify-end">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-strong transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="px-6 py-2.5 rounded-lg bg-brand-teal hover:bg-brand-teal/80 text-strong text-xs font-bold transition-all shadow-lg shadow-brand-teal/20 disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : 'Save Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
