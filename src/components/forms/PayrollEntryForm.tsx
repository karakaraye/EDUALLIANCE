'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '../Input';
import { Button } from '../Button';
import { calculatePayroll } from '@/utils/payroll-utils';

interface PayrollEntryFormProps {
    onClose?: () => void;
    onSave?: (data: any) => void;
}

export const PayrollEntryForm: React.FC<PayrollEntryFormProps> = ({ onClose, onSave }) => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [baseSalary, setBaseSalary] = useState('');
    const [allowances, setAllowances] = useState<Record<string, number>>({ 
        housing: 0, 
        transport: 0, 
        lunch: 0,
        wardrobe: 0,
        education: 0
    });
    const [deductions, setDeductions] = useState({
        pension: 0,
        paye: 0
    });
    
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    
    const [breakdown, setBreakdown] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/employees')
            .then(res => res.json())
            .then(data => {
                setEmployees(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filteredEmployees = employees.filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleEmployeeClick = (emp: any) => {
        setSearchTerm(emp.name);
        setSelectedEmployeeId(emp.id);
        setIsDropdownOpen(false);
        setBaseSalary(emp.basicSalary?.toString() || '0');
        setBreakdown(null);
    };

    const handleAddCustomEmployee = async () => {
        const name = searchTerm.trim();
        if (!name) return;
        
        // Optimistic UI update
        const fakeId = `temp-${Date.now()}`;
        const initialEmp = { id: fakeId, name, basicSalary: 0 };
        setEmployees(prev => [...prev, initialEmp]);
        
        setSearchTerm(name);
        setSelectedEmployeeId(fakeId);
        setIsDropdownOpen(false);
        setBaseSalary('0');
        setBankName('');
        setAccountNumber('');
        setBreakdown(null);

        try {
            const res = await fetch('/api/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const created = await res.json();
            if (created && created.id) {
                setEmployees(prev => prev.map(e => e.id === fakeId ? created : e));
                setSelectedEmployeeId(created.id);
            }
        } catch (error) {
            console.error("Failed to add new employee", error);
        }
    };

    const handleDeleteEmployee = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!window.confirm("Are you sure you want to permanently remove this employee from the roster?")) return;

        // Optimistic delete
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        if (selectedEmployeeId === id) {
            setSelectedEmployeeId('');
            setSearchTerm('');
            setBaseSalary('');
            setBankName('');
            setAccountNumber('');
        }
        setIsDropdownOpen(true);

        try {
            await fetch(`/api/employees?id=${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error("Failed to delete employee", error);
        }
    };

    const handleAllowanceChange = (key: string, value: string) => {
        setAllowances(prev => ({
            ...prev,
            [key]: Number(value) || 0
        }));
    };

    const handleDeductionChange = (key: 'pension' | 'paye', value: string) => {
        setDeductions(prev => ({
            ...prev,
            [key]: Number(value) || 0
        }));
    };

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        const totalAllowances = Object.values(allowances).reduce((a, b) => a + b, 0);
        const result = calculatePayroll(
            Number(baseSalary), 
            totalAllowances,
            deductions.pension,
            deductions.paye
        );
        setBreakdown(result);
    };

    const handleSave = () => {
        if (onSave && breakdown && selectedEmployeeId) {
            const empInfo = employees.find(e => e.id === selectedEmployeeId);
            onSave({
                employeeId: selectedEmployeeId,
                employeeName: empInfo?.name || 'Unknown',
                baseSalary: Number(baseSalary),
                allowancesList: allowances,
                bankName,
                accountNumber,
                breakdown
            });
            // Reset form
            setSelectedEmployeeId('');
            setSearchTerm('');
            setBaseSalary('');
            setBankName('');
            setAccountNumber('');
            setBreakdown(null);
        }
    };

    if (loading) {
        return <div className="p-6 text-slate-400">Loading employees...</div>;
    }

    return (
        <div className="payroll-form-wrapper">
            <form onSubmit={handleCalculate} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Employee</label>
                    <input 
                        type="text"
                        placeholder="Type to search employee name..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsDropdownOpen(true);
                            setSelectedEmployeeId('');
                            setBaseSalary('');
                            setBreakdown(null);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                        className="w-full bg-main/50 border border-border-subtle rounded-xl px-4 py-3 text-sm text-strong focus:outline-none focus:border-brand-teal transition-colors"
                        required={!selectedEmployeeId}
                    />
                    {isDropdownOpen && (
                        <div className="absolute top-[70px] left-0 w-full max-h-48 overflow-y-auto bg-panel border border-border-subtle rounded-xl shadow-2xl z-50 py-2 custom-scrollbar">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map(emp => (
                                    <div 
                                        key={emp.id} 
                                        className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm text-slate-300 transition-colors flex justify-between items-center group"
                                        onMouseDown={(e) => {
                                            e.preventDefault(); // Prevents input onBlur from firing before click registers
                                            handleEmployeeClick(emp);
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-strong">{emp.name}</span>
                                            <span className="text-[10px] bg-white/5 border border-border-subtle px-2 py-0.5 rounded text-slate-500">{emp.id.substring(0, 8)}</span>
                                        </div>
                                        <button 
                                            onMouseDown={(e) => handleDeleteEmployee(emp.id, e)}
                                            className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 p-1.5 rounded"
                                            title="Delete Employee"
                                        >
                                            <span className="material-symbols-outlined text-[14px] leading-none">delete</span>
                                        </button>
                                    </div>
                                ))
                            ) : null}
                            
                            {filteredEmployees.length === 0 && searchTerm.trim() !== '' ? (
                                <div 
                                    className="px-4 py-3 hover:bg-primary/10 cursor-pointer text-sm tracking-wide text-primary transition-colors flex items-center justify-center font-bold"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleAddCustomEmployee();
                                    }}
                                >
                                    <span className="material-symbols-outlined text-[18px] mr-1">person_add</span>
                                    Add &apos;{searchTerm}&apos; as new employee
                                </div>
                            ) : filteredEmployees.length === 0 && searchTerm.trim() === '' ? (
                                <div className="px-4 py-3 text-xs text-slate-500 text-center">Search to find an employee.</div>
                            ) : null}
                        </div>
                    )}
                </div>

                <Input
                    label="Basic Salary (₦)"
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value)}
                    required
                />
                
                <div className="pt-2 border-t border-border-subtle flex flex-col gap-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Allowances</span>
                    <Input
                        label="Housing Allowance (₦)"
                        type="number"
                        value={allowances.housing || ''}
                        onChange={(e) => handleAllowanceChange('housing', e.target.value)}
                    />
                    <Input
                        label="Transport Allowance (₦)"
                        type="number"
                        value={allowances.transport || ''}
                        onChange={(e) => handleAllowanceChange('transport', e.target.value)}
                    />
                    <Input
                        label="Lunch Allowance (₦)"
                        type="number"
                        value={allowances.lunch || ''}
                        onChange={(e) => handleAllowanceChange('lunch', e.target.value)}
                    />
                    <Input
                        label="Wardrobe Allowance (₦)"
                        type="number"
                        value={allowances.wardrobe || ''}
                        onChange={(e) => handleAllowanceChange('wardrobe', e.target.value)}
                    />
                    <Input
                        label="Education Allowance (₦)"
                        type="number"
                        value={allowances.education || ''}
                        onChange={(e) => handleAllowanceChange('education', e.target.value)}
                    />
                </div>

                <div className="pt-2 border-t border-border-subtle flex flex-col gap-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deductions</span>
                    <Input
                        label="Pension (₦)"
                        type="number"
                        value={deductions.pension || ''}
                        onChange={(e) => handleDeductionChange('pension', e.target.value)}
                    />
                    <Input
                        label="P.A.Y.E (₦)"
                        type="number"
                        value={deductions.paye || ''}
                        onChange={(e) => handleDeductionChange('paye', e.target.value)}
                    />
                </div>

                <div className="pt-2 border-t border-border-subtle flex flex-col gap-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bank Details</span>
                    <Input
                        label="Bank Name"
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. Guarantee Trust Bank"
                        required
                    />
                    <Input
                        label="Account Number"
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="e.g. 0123456789"
                        required
                    />
                </div>

                <Button type="submit" variant="primary" fullWidth className="mt-4">Calculate Net Salary</Button>
            </form>

            {breakdown && (
                <div className="breakdown-section animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="breakdown-item">
                        <span>Basic Salary</span>
                        <span>₦{Number(baseSalary).toLocaleString()}</span>
                    </div>
                    <div className="breakdown-item text-brand-teal">
                        <span>Total Allowances</span>
                        <span>+₦{(breakdown.gross - Number(baseSalary)).toLocaleString()}</span>
                    </div>
                    <div className="breakdown-item">
                        <span className="font-bold">Gross Pay</span>
                        <span className="font-bold">₦{breakdown.gross.toLocaleString()}</span>
                    </div>
                    
                    <div className="mt-4 mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Deductions (-₦{breakdown.totalDeductions.toLocaleString()})</span>
                    </div>
                    
                    <div className="breakdown-item deduction">
                        <span>Pension</span>
                        <span>-₦{breakdown.pension.toLocaleString()}</span>
                    </div>
                    <div className="breakdown-item deduction">
                        <span>P.A.Y.E</span>
                        <span>-₦{breakdown.paye.toLocaleString()}</span>
                    </div>
                    
                    <div className="breakdown-item total text-xl">
                        <span>Net Take-home</span>
                        <span>₦{breakdown.net.toLocaleString()}</span>
                    </div>
                    
                    <Button variant="secondary" fullWidth className="mt-4" onClick={handleSave}>
                        Add to Batch Roster
                    </Button>
                </div>
            )}

            <style jsx>{`
                .payroll-form-wrapper {
                    padding: 24px;
                }
                .breakdown-section {
                    margin-top: 24px;
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .breakdown-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 6px 0;
                    font-size: 13px;
                    color: #94a3b8;
                }
                .deduction { color: #f87171; }
                .total {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px dashed rgba(255, 255, 255, 0.1);
                    font-weight: 900;
                    color: #fff;
                }
                .mt-4 { margin-top: 20px; }
            `}</style>
        </div>
    );
};
