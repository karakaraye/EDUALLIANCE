'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PrintPayrollPage() {
    const params = useParams();
    const id = params.id as string;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [employees, setEmployees] = useState<any[]>([]);
    const [month, setMonth] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const data = localStorage.getItem(`payroll_details_${id}`);
        const monthData = localStorage.getItem(`payroll_month_${id}`);
        if (data) {
            setEmployees(JSON.parse(data));
        }
        if (monthData) {
            setMonth(monthData);
        }

        const timer = setTimeout(() => {
            window.print();
        }, 500);
        return () => clearTimeout(timer);
    }, [id]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    if (!isMounted) return null;

    if (employees.length === 0) {
        return (
            <div className="p-10 font-sans text-center">
                <h2>No Detailed Record Found</h2>
                <p>This payroll batch may have been created on another device or prior to the print update.</p>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen text-black font-sans p-8 max-w-4xl mx-auto print:p-0 print:m-0">
            <style jsx global>{`
                @media print {
                    @page { margin: 10mm; size: portrait; }
                    body { 
                        visibility: visible !important;
                        background: white !important; 
                    }
                    nav, footer, .no-print { display: none !important; }
                    
                    /* Force a hard page break after each employee payslip so they print on separate sheets */
                    .print-break {
                        page-break-after: always;
                    }
                    /* Prevent an empty blank page at the very end of the stack */
                    .print-break:last-child {
                        page-break-after: auto;
                    }
                }
            `}</style>

            <button 
                onClick={() => window.print()}
                className="no-print fixed top-10 right-10 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 shadow-xl z-50 flex items-center gap-2"
            >
                <span className="material-symbols-outlined">print</span> Print Full Packet
            </button>

            {/* Master Summary Sheet */}
            <div className="print-break mb-20 pb-16 border-b-4 border-black print:mb-0 print:pb-0 print:border-none">
                <div className="mb-8 border-b-2 border-black pb-4">
                    <h1 className="text-3xl font-black uppercase tracking-widest text-[#006059]">Edualliance Financials</h1>
                    <h2 className="text-xl font-bold mt-2">Certified Master Payroll Record</h2>
                    <div className="flex justify-between mt-4 text-sm font-bold text-gray-600">
                        <span>Batch ID: {id.toUpperCase()}</span>
                        <span>Payroll Month: {month || 'N/A'}</span>
                        <span>Total Employees: {employees.length}</span>
                    </div>
                </div>

                <table className="w-full text-left text-xs border-collapse border border-gray-300 mb-10">
                    <thead>
                        <tr className="bg-gray-100 border-b-2 border-black text-gray-700">
                            <th className="p-2 border border-gray-300 w-[15%]">Name</th>
                            <th className="p-2 border border-gray-300 w-[15%]">Bank Details</th>
                            <th className="p-2 border border-gray-300 text-right w-[10%]">Basic Salary</th>
                            <th className="p-2 border border-gray-300 w-[20%]">Allowances</th>
                            <th className="p-2 border border-gray-300 text-right w-[10%]">Pension</th>
                            <th className="p-2 border border-gray-300 text-right w-[10%]">P.A.Y.E</th>
                            <th className="p-2 border-gray-300 border-l-2 text-right font-black w-[10%] bg-gray-50">Net Disbursed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp, i) => {
                            const allowObj = emp.allowancesList || {};
                            const allowancesArr = Object.entries(allowObj).filter(([, val]) => Number(val) > 0);
                            
                            return (
                                <tr key={`master-${i}`} className="border-b border-gray-300 hover:bg-gray-50 transition-colors">
                                    <td className="p-2 border border-gray-300 font-bold">{emp.employeeName}</td>
                                    <td className="p-2 border border-gray-300 font-mono text-[10px]">
                                        <div>{emp.bankName || 'N/A'}</div>
                                        <div>{emp.accountNumber || 'N/A'}</div>
                                    </td>
                                    <td className="p-2 border border-gray-300 text-right text-gray-800 font-mono">{formatCurrency(emp.baseSalary)}</td>
                                    <td className="p-2 border border-gray-300 text-[10px]">
                                        {allowancesArr.length > 0 ? (
                                            <ul className="list-disc pl-4 m-0 text-gray-700">
                                                {allowancesArr.map(([k, v]) => (
                                                    <li key={k} className="capitalize">{k}: {formatCurrency(Number(v))}</li>
                                                ))}
                                            </ul>
                                        ) : <span className="text-gray-400 italic">None</span>}
                                    </td>
                                    <td className="p-2 border border-gray-300 text-right text-red-600 font-mono">
                                        -{formatCurrency(emp.breakdown.pension)}
                                    </td>
                                    <td className="p-2 border border-gray-300 text-right text-red-600 font-mono">
                                        -{formatCurrency(emp.breakdown.paye)}
                                    </td>
                                    <td className="p-2 border-gray-300 border-l-2 text-right font-black bg-gray-50 text-[#006059] font-mono">
                                        {formatCurrency(emp.breakdown.net)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <div className="flex justify-between px-10 text-sm mt-16 text-gray-600">
                    <div className="text-center">
                        <div className="w-48 border-b border-gray-400 mb-2"></div>
                        <span className="font-bold">Prepared By (HR)</span>
                    </div>
                    <div className="text-center">
                        <div className="w-48 border-b border-gray-400 mb-2"></div>
                        <span className="font-bold">Authorized By (Finance)</span>
                    </div>
                </div>
            </div>

            {employees.map((emp, idx) => {
                const allowObj = emp.allowancesList || {};
                const allowancesArr = Object.entries(allowObj).filter(([, val]) => Number(val) > 0);
                const totalAllowances = allowancesArr.reduce((sum, [,v]) => sum + Number(v), 0);
                
                return (
                    <div key={idx} className="print-break mb-16 pb-16 border-b-2 border-dashed border-gray-300 print:mb-0 print:pb-0 print:border-none">
                        {/* Payslip Header */}
                        <div className="flex justify-between items-start mb-6 border-b-2 border-black pb-4">
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-widest text-[#006059]">Edualliance</h1>
                                <h2 className="text-lg font-bold mt-1 text-gray-600">Official Payslip</h2>
                            </div>
                            <div className="text-right text-sm">
                                <p><span className="font-bold">Batch ID:</span> {id.toUpperCase()}</p>
                                <p><span className="font-bold">Month:</span> {month || 'N/A'}</p>
                                <p><span className="font-bold">Date Printed:</span> {new Date().toLocaleDateString('en-GB')}</p>
                            </div>
                        </div>

                        {/* Employee Details Box */}
                        <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-50 p-5 border border-gray-200 rounded-lg">
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Employee Name</p>
                                <p className="text-xl font-black text-black">{emp.employeeName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Deposit Information</p>
                                <p className="text-sm font-bold text-black">{emp.bankName || 'N/A'}</p>
                                <p className="text-sm font-mono text-gray-700">{emp.accountNumber || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Financials Table */}
                        <table className="w-full text-left border-collapse mb-10">
                            <thead>
                                <tr className="border-b-2 border-black bg-gray-100 uppercase text-[10px] tracking-widest text-gray-600">
                                    <th className="p-3">Earnings</th>
                                    <th className="p-3 text-right">Amount</th>
                                    <th className="p-3 border-l-2 border-white pl-4">Deductions</th>
                                    <th className="p-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {/* Base Salary Row */}
                                <tr className="border-b border-gray-200">
                                    <td className="p-3 font-bold text-gray-800">Basic Salary</td>
                                    <td className="p-3 text-right text-gray-800 font-mono">{formatCurrency(emp.baseSalary)}</td>
                                    
                                    <td className="p-3 border-l-2 border-gray-100 font-bold text-gray-800 pl-4">P.A.Y.E Tax</td>
                                    <td className="p-3 text-right text-red-600 font-mono">-{formatCurrency(emp.breakdown.paye)}</td>
                                </tr>
                                
                                {/* Allowances / Pension Row */}
                                <tr>
                                    <td className="p-3 font-bold align-top text-gray-800">
                                        Allowances
                                        {allowancesArr.length > 0 && (
                                            <ul className="list-disc pl-5 mt-2 text-xs text-gray-600 font-normal">
                                                {allowancesArr.map(([k, v]) => (
                                                    <li key={k} className="capitalize mb-1">{k}: {formatCurrency(Number(v))}</li>
                                                ))}
                                            </ul>
                                        )}
                                        {allowancesArr.length === 0 && <p className="text-xs text-gray-400 mt-1 font-normal italic">No allowances logged.</p>}
                                    </td>
                                    <td className="p-3 text-right align-top text-gray-800 font-mono pt-3">
                                        {formatCurrency(totalAllowances)}
                                    </td>
                                    
                                    <td className="p-3 border-l-2 border-gray-100 font-bold align-top text-gray-800 pl-4">Pension</td>
                                    <td className="p-3 text-right align-top text-red-600 font-mono pt-3">-{formatCurrency(emp.breakdown.pension)}</td>
                                </tr>
                            </tbody>
                            <tfoot className="border-t-2 border-black bg-gray-50">
                                <tr>
                                    <td className="p-4 font-black text-right text-gray-600" colSpan={3}>NET PAY DISBURSED</td>
                                    <td className="p-4 font-black text-right text-2xl text-[#006059]">{formatCurrency(emp.breakdown.net)}</td>
                                </tr>
                            </tfoot>
                        </table>

                        {/* Signatures */}
                        <div className="flex justify-between px-10 text-sm mt-16 text-gray-600">
                            <div className="text-center">
                                <div className="w-48 border-b border-gray-400 mb-2"></div>
                                <span className="font-bold">Prepared By (HR)</span>
                            </div>
                            <div className="text-center">
                                <div className="w-48 border-b border-gray-400 mb-2"></div>
                                <span className="font-bold">Authorized By (Finance)</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
