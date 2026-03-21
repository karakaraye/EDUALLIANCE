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

    const handleEmployeeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedEmployeeId(id);
        const emp = employees.find(e => e.id === id);
        
        if (emp) {
            setBaseSalary(emp.basicSalary?.toString() || '0');
            setBreakdown(null);
        } else {
            setBaseSalary('');
            setBreakdown(null);
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
                breakdown
            });
            // Reset form
            setSelectedEmployeeId('');
            setBaseSalary('');
            setBreakdown(null);
        }
    };

    if (loading) {
        return <div className="p-6 text-slate-400">Loading employees...</div>;
    }

    return (
        <div className="payroll-form-wrapper">
            <form onSubmit={handleCalculate} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Employee</label>
                    <select 
                        value={selectedEmployeeId} 
                        onChange={handleEmployeeSelect}
                        className="w-full bg-main/50 border border-border-subtle rounded-xl px-4 py-3 text-sm text-strong focus:outline-none focus:border-brand-teal transition-colors"
                        required
                    >
                        <option value="" disabled>Select an employee</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </select>
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
