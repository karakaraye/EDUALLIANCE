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
        <div className="bg-white min-h-screen text-black font-sans p-8 max-w-7xl mx-auto print:p-0 print:m-0">
            <style jsx global>{`
                @media print {
                    @page { margin: 10mm; size: landscape; }
                    body { 
                        visibility: visible !important;
                        background: white !important; 
                    }
                    nav, footer, .no-print { display: none !important; }
                }
            `}</style>

            <div className="mb-8 border-b-2 border-black pb-4">
                <h1 className="text-3xl font-black uppercase tracking-widest">Edualliance Financials</h1>
                <h2 className="text-xl font-bold mt-2">Certified Payroll Record</h2>
                <div className="flex justify-between mt-4 text-sm font-bold">
                    <span>Batch ID: {id.toUpperCase()}</span>
                    <span>Payroll Month: {month || 'N/A'}</span>
                    <span>Total Employees: {employees.length}</span>
                </div>
            </div>

            <table className="w-full text-left text-xs border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 border-b-2 border-black">
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
                            <tr key={i} className="border-b border-gray-300">
                                <td className="p-2 border border-gray-300 font-bold">{emp.employeeName}</td>
                                <td className="p-2 border border-gray-300 font-mono text-[10px]">
                                    <div>{emp.bankName || 'N/A'}</div>
                                    <div>{emp.accountNumber || 'N/A'}</div>
                                </td>
                                <td className="p-2 border border-gray-300 text-right">{formatCurrency(emp.baseSalary)}</td>
                                <td className="p-2 border border-gray-300 text-[10px]">
                                    {allowancesArr.length > 0 ? (
                                        <ul className="list-disc pl-4 m-0">
                                            {allowancesArr.map(([k, v]) => (
                                                <li key={k} className="capitalize">{k}: {formatCurrency(Number(v))}</li>
                                            ))}
                                        </ul>
                                    ) : '-'}
                                </td>
                                <td className="p-2 border border-gray-300 text-right text-red-600">
                                    -{formatCurrency(emp.breakdown.pension)}
                                </td>
                                <td className="p-2 border border-gray-300 text-right text-red-600">
                                    -{formatCurrency(emp.breakdown.paye)}
                                </td>
                                <td className="p-2 border-gray-300 border-l-2 text-right font-black bg-gray-50">
                                    {formatCurrency(emp.breakdown.net)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="mt-16 flex justify-between px-10 text-sm">
                <div className="text-center">
                    <div className="w-48 border-b border-black mb-2"></div>
                    <span className="font-bold">Prepared By (HR)</span>
                </div>
                <div className="text-center">
                    <div className="w-48 border-b border-black mb-2"></div>
                    <span className="font-bold">Authorized By (Finance)</span>
                </div>
            </div>
            
            <button 
                onClick={() => window.print()}
                className="no-print fixed bottom-10 right-10 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 shadow-xl"
            >
                Print Record Now
            </button>
        </div>
    );
}
