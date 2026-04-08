'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PayrollEntryForm } from '@/components/forms/PayrollEntryForm';

export default function RunPayrollPage() {
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [employees, setEmployees] = useState<any[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [payrollMonth, setPayrollMonth] = useState('');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    const handleAddEmployee = (data: any) => {
        setEmployees(prev => [...prev, data]);
    };

    const handleRemoveEmployee = (index: number) => {
        setEmployees(prev => prev.filter((_, i) => i !== index));
    };

    const handleFinalize = async () => {
        if (employees.length === 0 || !payrollMonth) return;
        setSubmitting(true);

        try {
            const response = await fetch('/api/payroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employees, month: payrollMonth })
            });

            if (response.ok) {
                const resData = await response.json();
                if (resData.periodId) {
                    localStorage.setItem(`payroll_details_${resData.periodId}`, JSON.stringify(employees));
                    localStorage.setItem(`payroll_month_${resData.periodId}`, payrollMonth);
                }
                router.push('/payroll');
                router.refresh();
            } else {
                console.error('Failed to submit payroll');
                setSubmitting(false);
            }
        } catch (error) {
            console.error('Error submitting payroll:', error);
            setSubmitting(false);
        }
    };

    const totalBasic = employees.reduce((sum, emp) => sum + Number(emp.baseSalary), 0);
    const totalAllowances = employees.reduce((sum, emp) => {
        return sum + Object.values(emp.allowancesList || {}).reduce((a: any, b: any) => Number(a) + Number(b), 0);
    }, 0);
    const totalDeductions = employees.reduce((sum, emp) => sum + emp.breakdown.totalDeductions, 0);
    const totalNet = employees.reduce((sum, emp) => sum + emp.breakdown.net, 0);

    if (!isMounted) return null;

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 max-w-6xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={() => router.back()}
                        className="text-slate-500 hover:text-strong flex items-center gap-1 text-xs font-bold transition-colors w-fit"
                    >
                        <span className="material-symbols-outlined text-[14px]">arrow_back</span> Back to Payroll
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-strong tracking-tight">Run New Payroll Batch</h1>
                        <p className="text-slate-500 text-sm mt-1">Add employee salaries to calculate allowances, pensions, and finalize the disbursement sequence.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left side: Entry Form */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        {/* Month Selector */}
                        <div className="bg-panel border border-border-subtle rounded-2xl p-6">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Payroll Month</label>
                            <input 
                                type="month" 
                                value={payrollMonth}
                                onChange={(e) => setPayrollMonth(e.target.value)}
                                className="w-full bg-main/50 border border-border-subtle rounded-xl px-4 py-3 text-sm text-strong focus:outline-none focus:border-brand-teal transition-colors"
                                required
                            />
                        </div>

                        <div className="bg-panel border border-border-subtle rounded-2xl overflow-hidden">
                            <div className="p-4 border-b border-border-subtle bg-main/20">
                                <h3 className="text-sm font-bold text-strong flex items-center gap-2">
                                    <span className="material-symbols-outlined text-brand-teal text-[18px]">person_add</span>
                                    Add Employee
                                </h3>
                            </div>
                            <PayrollEntryForm onSave={handleAddEmployee} />
                        </div>
                    </div>

                    {/* Right side: Batch List & Summary */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-panel border border-border-subtle p-4 rounded-xl">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Total Basic</span>
                                <h4 className="text-strong font-bold">{formatCurrency(totalBasic)}</h4>
                            </div>
                            <div className="bg-panel border border-green-500/20 p-4 rounded-xl">
                                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest block mb-1">Total Allowances</span>
                                <h4 className="text-strong font-bold">{formatCurrency(totalAllowances)}</h4>
                            </div>
                            <div className="bg-panel border border-red-500/20 p-4 rounded-xl">
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-1">Total Deductions</span>
                                <h4 className="text-strong font-bold">{formatCurrency(totalDeductions)}</h4>
                            </div>
                            <div className="bg-gradient-to-br from-panel to-[#0a0c10] border border-brand-teal/30 p-4 rounded-xl">
                                <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest block mb-1">Net Payout Info</span>
                                <h4 className="text-strong font-black text-lg">{formatCurrency(totalNet)}</h4>
                            </div>
                        </div>

                        {/* Employee Batch Table */}
                        <div className="bg-panel border border-border-subtle rounded-2xl flex-1 flex flex-col overflow-hidden min-h-[400px]">
                            <div className="p-5 border-b border-border-subtle bg-main/20 flex justify-between items-center">
                                <h3 className="text-base font-bold text-strong">Batch Roster</h3>
                                <div className="px-3 py-1 bg-white/5 border border-border-subtle rounded-full text-[10px] font-black text-slate-300">
                                    {employees.length} Staff Included
                                </div>
                            </div>
                            
                            {employees.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                                    <span className="material-symbols-outlined text-[48px] opacity-20 mb-4">group</span>
                                    <p className="font-bold text-sm">No employees added yet.</p>
                                    <p className="text-xs mt-1">Use the form on the left to start building this payroll batch.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto w-full max-w-[100vw]">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-main/40 border-b border-border-subtle">
                                                <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Employee</th>
                                                <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Gross Base</th>
                                                <th className="px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Net Take-Home</th>
                                                <th className="px-5 py-3 w-[60px]"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-subtle">
                                            {employees.map((emp, idx) => (
                                                <tr key={idx} className="hover:bg-white/[0.02]">
                                                    <td className="px-5 py-4">
                                                        <div className="flex flex-col items-start gap-1">
                                                            <span className="text-sm font-bold text-strong">{emp.employeeName}</span>
                                                            <span className="text-[9px] font-mono bg-white/5 border border-border-subtle px-2 py-0.5 rounded text-slate-400">
                                                                {emp.bankName} - {emp.accountNumber}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-slate-400">{formatCurrency(emp.breakdown.gross)}</td>
                                                    <td className="px-5 py-4 text-sm font-black text-brand-teal text-right">{formatCurrency(emp.breakdown.net)}</td>
                                                    <td className="px-5 py-4 text-right">
                                                        <button 
                                                            onClick={() => handleRemoveEmployee(idx)}
                                                            className="text-red-400 hover:text-red-300 opacity-50 hover:opacity-100 transition-opacity"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Footer Action */}
                            <div className="p-6 border-t border-border-subtle bg-main/20 flex justify-end">
                                <button 
                                    onClick={handleFinalize}
                                    disabled={employees.length === 0 || submitting || !payrollMonth}
                                    className="px-6 py-2.5 rounded-lg bg-brand-teal hover:bg-brand-teal/80 disabled:opacity-50 disabled:cursor-not-allowed text-strong text-sm font-bold transition-all shadow-lg shadow-brand-teal/20"
                                >
                                    {submitting ? (
                                        <span className="material-symbols-outlined animate-spin">refresh</span>
                                    ) : (
                                        <span className="material-symbols-outlined">send</span>
                                    )}
                                    {submitting ? 'Processing...' : 'Submit Draft for Approval'}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
