'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function InvestmentCertificatePage() {
    const params = useParams();
    const investorId = params.id as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [investor, setInvestor] = useState<any>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        fetch('/api/investors')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const found = data.find((inv: any) => inv.id === investorId);
                    setInvestor(found || null);
                }
            })
            .catch(e => {
                console.error("Failed to load investor", e);
            });
    }, [investorId]);

    if (!isMounted) return null;

    if (!investor) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-slate-500 bg-white min-h-screen">
                <span className="material-symbols-outlined text-4xl mb-4 text-red-500">error</span>
                <h2 className="text-xl font-bold text-slate-800">Investor Record Not Found</h2>
                <p className="mt-2 text-sm text-slate-600">The investment record you are looking for does not exist.</p>
                <Link href="/investors" className="mt-6 text-teal-600 hover:text-teal-700 font-bold text-sm">Return to Roster</Link>
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    const amount = Number(investor.amountInvested) || 0;
    const monthlyRate = Number(investor.interestRate) || 0;
    const annualRate = monthlyRate * 12;
    const tenor = investor.tenorMonths || 12;

    const startDate = new Date(investor.rawDate);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + tenor, startDate.getDate());
    
    const formatDate = (date: Date) => {
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'long' });
        const year = date.getFullYear();
        
        // Add ordinal suffix
        const suffix = (day: number) => {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        };
        
        return `${day}${suffix(day)} ${month}, ${year}`;
    };

    const numberToWords = (num: number) => {
        // Simple implementation for demo/standard amounts
        // In a real app, use a library like 'number-to-words'
        return "Amount in words placeholder"; 
    };

    return (
        <div className="min-h-screen bg-slate-200 py-12 px-4 print:bg-white print:p-0 flex flex-col items-center">
            
            {/* Action Bar */}
            <div className="w-full max-w-[850px] mb-8 flex justify-between items-center print:hidden">
                <div className="flex items-center gap-3">
                    <Link href="/investors" className="size-10 rounded-full bg-white flex items-center justify-center text-slate-600 hover:text-brand-teal shadow-md transition-all">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-slate-800">Investment Certificate</h1>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Official Document Generation</p>
                    </div>
                </div>
                <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-8 py-3 bg-brand-teal text-strong rounded-xl text-sm font-black hover:bg-teal-600 transition-all shadow-xl shadow-teal-900/20"
                >
                    <span className="material-symbols-outlined text-[20px]">print</span> Print Certificate
                </button>
            </div>

            {/* Certificate Paper */}
            <div className="w-full max-w-[850px] bg-white shadow-2xl print:shadow-none p-[80px] print:p-12 relative overflow-hidden border-[16px] border-slate-50 print:border-none min-h-[1100px]">
                
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-35deg]">
                    <div className="flex flex-col items-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.svg" alt="Watermark" className="w-[600px]" />
                        <span className="text-[120px] font-black uppercase mt-4">Edualliance</span>
                    </div>
                </div>

                {/* Header */}
                <div className="relative z-10 flex justify-between items-start mb-16">
                    <div className="flex items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.svg" alt="Edualliance Logo" className="w-16" />
                        <div>
                            <h2 className="text-2xl font-black text-[#1a3a5f] tracking-tight">Edualliance</h2>
                            <p className="text-[10px] font-bold text-brand-teal uppercase tracking-[0.2em] italic">We promote education</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[11px] font-black text-slate-800 tracking-widest">RC: 1928423</p>
                    </div>
                </div>

                {/* Certificate Date & No */}
                <div className="relative z-10 flex justify-between mb-20 text-[13px]">
                    <p className="font-bold">Date: <span className="font-normal">{formatDate(startDate)}</span></p>
                    <p className="font-bold">CERTIFICATE NO: <span className="font-normal">{investor.displayId || `ED/PH/INV/${investor.id.substring(0,4).toUpperCase()}`}</span></p>
                </div>

                {/* Title */}
                <div className="relative z-10 text-center mb-20">
                    <h1 className="text-4xl font-black text-[#1a3a5f] tracking-[0.1em] uppercase border-y-2 border-[#1a3a5f]/10 py-6">Investment Certificate</h1>
                </div>

                {/* Details Grid */}
                <div className="relative z-10 space-y-6 text-[15px] leading-relaxed max-w-[90%] mx-auto">
                    <div className="grid grid-cols-[200px_1fr] gap-4">
                        <span className="font-bold text-slate-600">Name Of Investor:</span>
                        <span className="font-bold text-black border-b border-dotted border-slate-300 pb-1">{investor.name}</span>
                    </div>
                    <div className="grid grid-cols-[200px_1fr] gap-4">
                        <span className="font-bold text-slate-600">Address Of Investor:</span>
                        <span className="text-black border-b border-dotted border-slate-300 pb-1">{investor.address || 'Not Provided'}</span>
                    </div>
                    <div className="grid grid-cols-[200px_1fr] gap-4">
                        <span className="font-bold text-slate-600">Phone Number (s):</span>
                        <span className="text-black border-b border-dotted border-slate-300 pb-1">{investor.phone || 'Not Provided'}</span>
                    </div>
                    
                    <div className="pt-8 space-y-5">
                        <div className="grid grid-cols-[200px_1fr] gap-4">
                            <span className="font-bold text-slate-600">Principal Amount:</span>
                            <span className="font-black text-black">{formatCurrency(amount)} <span className="font-normal italic text-slate-500 ml-2">({numberToWords(amount)})</span></span>
                        </div>
                        <div className="grid grid-cols-[200px_1fr] gap-4">
                            <span className="font-bold text-slate-600">Tenor:</span>
                            <span className="text-black font-bold">{tenor} Months</span>
                        </div>
                        <div className="grid grid-cols-[200px_1fr] gap-4">
                            <span className="font-bold text-slate-600">Monthly Interest Rate:</span>
                            <span className="text-black font-bold">{monthlyRate}%</span>
                        </div>
                        <div className="grid grid-cols-[200px_1fr] gap-4">
                            <span className="font-bold text-slate-600">Annual Interest Rate:</span>
                            <span className="text-black font-bold">{annualRate.toFixed(2)}%</span>
                        </div>
                        <div className="grid grid-cols-[200px_1fr] gap-4">
                            <span className="font-bold text-slate-600">Payment of Interest:</span>
                            <span className="text-black font-bold italic">Monthly</span>
                        </div>
                        <div className="grid grid-cols-[200px_1fr] gap-4">
                            <span className="font-bold text-slate-600">Effective Date:</span>
                            <span className="text-black font-bold">{formatDate(startDate)}</span>
                        </div>
                        <div className="grid grid-cols-[200px_1fr] gap-4">
                            <span className="font-bold text-slate-600">Termination Date:</span>
                            <span className="text-black font-bold">{formatDate(endDate)}</span>
                        </div>
                    </div>
                </div>

                {/* Proof Text */}
                <div className="relative z-10 mt-16 text-center max-w-[80%] mx-auto">
                    <p className="text-[14px] italic leading-relaxed text-slate-700">
                        This certificate is a legal proof that <span className="font-black text-black uppercase">Mr./Mrs/Ms {investor.name}</span> currently has a running investment with <span className="font-bold text-[#1a3a5f]">EDUALLIANCE LIMITED</span> based on the above stated terms and conditions.
                    </p>
                    <p className="mt-8 font-bold text-slate-800">Thank you.</p>
                </div>

                {/* Signatures */}
                <div className="relative z-10 mt-24 flex justify-between items-end px-10">
                    <div className="text-center">
                        <div className="w-[220px] mb-4">
                            {/* Signature Placeholder/Image if available */}
                            <div className="h-12 flex items-center justify-center opacity-30 italic text-[10px] text-slate-400">Signature & Stamp</div>
                            <div className="w-full border-b-2 border-slate-900"></div>
                        </div>
                        <p className="font-black text-slate-900 uppercase text-[12px]">Margaret Funke Obebe</p>
                        <p className="text-[10px] font-bold text-brand-teal uppercase tracking-widest mt-1">Operations</p>
                    </div>
                    <div className="text-center">
                        <div className="w-[220px] mb-4">
                            {/* Signature Placeholder */}
                            <div className="h-12 flex items-center justify-center opacity-30 italic text-[10px] text-slate-400">Signature</div>
                            <div className="w-full border-b-2 border-slate-900"></div>
                        </div>
                        <p className="font-black text-slate-900 uppercase text-[12px]">Moses Celestine, <span className="text-[9px] font-normal">MBA, ANIM, MCIB, FCA</span></p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Chief Executive Officer</p>
                    </div>
                </div>

                {/* Footer Decor */}
                <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-primary via-brand-teal to-primary print:hidden"></div>
            </div>
            
            {/* Print Instructions */}
            <div className="mt-8 max-w-[850px] w-full p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-xs font-bold flex items-center gap-3 print:hidden">
                <span className="material-symbols-outlined">info</span>
                For the best result, ensure "Background Graphics" is enabled in your browser's print settings.
            </div>
        </div>
    );
}
