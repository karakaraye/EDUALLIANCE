'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function OfferLetterPage() {
    const params = useParams();
    const loanId = params.id as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [loan, setLoan] = useState<any>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        fetch('/api/loans')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const found = data.find((l: any) => l.id.replace('#', '') === loanId);
                    setLoan(found || null);
                }
            })
            .catch(e => {
                console.error("Failed to load loan", e);
            });
    }, [loanId]);

    if (!isMounted) return null;

    if (!loan) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-slate-500 bg-white min-h-screen">
                <span className="material-symbols-outlined text-4xl mb-4 text-red-500">error</span>
                <h2 className="text-xl font-bold text-slate-800">Loan Not Found</h2>
                <p className="mt-2 text-sm text-slate-600">The loan record you are looking for does not exist.</p>
                <Link href="/loans" className="mt-6 text-brand-teal hover:opacity-80 font-bold text-sm">Return to Portfolio</Link>
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    const amount = Number(loan.amount) || 0;
    const rate = Number(loan.rate) || 0;
    const duration = Number(loan.durationMonths) || 0;

    return (
        <div className="min-h-screen bg-slate-100 py-12 px-4 print:bg-white print:p-0">
            {/* Header / Actions */}
            <div className="max-w-[800px] mx-auto mb-8 flex justify-between items-center print:hidden">
                <div className="flex items-center gap-2">
                    <Link href={`/loans/${loanId}`} className="size-10 rounded-full bg-white flex items-center justify-center text-slate-600 hover:text-brand-teal shadow-md border border-slate-200 transition-all">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">Loan Offer Letter</h1>
                        <p className="text-xs text-slate-500">Document generation for {loan.id}</p>
                    </div>
                </div>
                <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-8 py-3 bg-brand-gradient text-strong rounded-xl text-sm font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-[20px]">print</span> Print Letter
                </button>
            </div>

            {/* Document Paper */}
            <div className="max-w-[800px] mx-auto bg-white shadow-2xl print:shadow-none border border-slate-200 print:border-none p-[60px] print:p-10 font-serif text-[13px] leading-tight text-[#222]">
                
                {/* Letter Header */}
                <div className="flex justify-between items-start mb-10 border-b-2 border-slate-100 pb-8">
                    <div className="flex items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="Edualliance Logo" className="w-14" />
                        <div>
                            <h2 className="text-xl font-black text-[#1a3a5f] tracking-tight">Edualliance</h2>
                            <p className="text-[9px] font-bold text-brand-teal uppercase tracking-[0.2em] italic">We promote education</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-800 tracking-widest mb-1">RC: 1928423</p>
                        <p className="font-bold text-[11px]">Date: {loan.disburseDate}</p>
                    </div>
                </div>

                <div className="flex justify-between items-start mb-10">
                    <div>
                        <p className="mt-4">The Proprietor/Proprietress/Director</p>
                        <p className="font-bold uppercase">{loan.name}</p>
                        <p className="italic text-slate-400 text-[11px]">[Address Not Provided]</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold">Loan Number: {loan.id}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <p>Dear Sir/Madam,</p>
                    <p className="mt-4 font-bold underline">OFFER OF EDU LOAN FACILITY</p>
                </div>

                {/* Terms Table */}
                <div className="border-t border-l border-black mb-8">
                    <div className="grid grid-cols-[200px_1fr] border-b border-black">
                        <div className="p-2 border-r border-black font-bold bg-slate-50 print:bg-transparent">Borrower:</div>
                        <div className="p-2 border-r border-black font-bold uppercase">{loan.name}</div>
                    </div>
                    <div className="grid grid-cols-[200px_1fr] border-b border-black">
                        <div className="p-2 border-r border-black font-bold bg-slate-50 print:bg-transparent">Lender:</div>
                        <div className="p-2 border-r border-black font-bold">EDUALLIANCE LIMITED</div>
                    </div>
                    <div className="grid grid-cols-[200px_1fr] border-b border-black">
                        <div className="p-2 border-r border-black font-bold bg-slate-50 print:bg-transparent">Facility Type:</div>
                        <div className="p-2 border-r border-black">EDU SOFT LOAN</div>
                    </div>
                    <div className="grid grid-cols-[200px_1fr] border-b border-black">
                        <div className="p-2 border-r border-black font-bold bg-slate-50 print:bg-transparent">Amount:</div>
                        <div className="p-2 border-r border-black font-bold">{formatCurrency(amount)}</div>
                    </div>
                    <div className="grid grid-cols-[200px_1fr] border-b border-black">
                        <div className="p-2 border-r border-black font-bold bg-slate-50 print:bg-transparent">Tenor:</div>
                        <div className="p-2 border-r border-black">{duration} Months</div>
                    </div>
                    <div className="grid grid-cols-[200px_1fr] border-b border-black">
                        <div className="p-2 border-r border-black font-bold bg-slate-50 print:bg-transparent">Purpose:</div>
                        <div className="p-2 border-r border-black italic">Production/purchase of books, uniforms, stationery items and renovation.</div>
                    </div>
                    <div className="grid grid-cols-[200px_1fr] border-b border-black">
                        <div className="p-2 border-r border-black font-bold bg-slate-50 print:bg-transparent">Interest Rate:</div>
                        <div className="p-2 border-r border-black font-bold">{rate}% Flat Per Month</div>
                    </div>
                    <div className="grid grid-cols-[200px_1fr] border-b border-black">
                        <div className="p-2 border-r border-black font-bold bg-slate-50 print:bg-transparent">Management & Processing Fee:</div>
                        <div className="p-2 border-r border-black">2.5% (One off Payment)</div>
                    </div>
                    <div className="grid grid-cols-[200px_1fr] border-b border-black">
                        <div className="p-2 border-r border-black font-bold bg-slate-50 print:bg-transparent">Insurance Premium:</div>
                        <div className="p-2 border-r border-black">2% (One off Payment)</div>
                    </div>
                    <div className="grid grid-cols-[200px_1fr] border-b border-black">
                        <div className="p-2 border-r border-black font-bold bg-slate-50 print:bg-transparent">Credit Search and Legal Fee:</div>
                        <div className="p-2 border-r border-black">2% (One off Payment)</div>
                    </div>
                    <div className="grid grid-cols-[200px_1fr] border-b border-black">
                        <div className="p-2 border-r border-black font-bold bg-slate-50 print:bg-transparent">Repayment Source:</div>
                        <div className="p-2 border-r border-black">Proceeds from school</div>
                    </div>
                </div>

                <p className="mb-6">Kindly find attached repayment schedule.</p>

                <div className="mb-8">
                    <p className="font-bold underline mb-3 uppercase">Conditions Precedent to Disbursement</p>
                    <ul className="list-disc pl-6 space-y-2 text-[12px]">
                        <li>Accepted Offer Letter signed by authorized signatories of the Borrower.</li>
                        <li>Key Man Insurance Policy (Credit Life Assurance Policy) must be undertaken by the Proprietor/Director of the school noting Edualliance Limited as "First Loss Payee".</li>
                        <li>The Borrower (School) shall present the required number of signed Cheque Leaves in the name of the School.</li>
                        <li>Third party Guarantee with the required number of signed Cheque Leaves in the name of the School (where applicable).</li>
                        <li>A satisfactory visitation report to obtain all relevant information about the School for the purpose of KYC (Know Your Customer).</li>
                    </ul>
                </div>

                <div className="mb-10">
                    <p className="font-bold underline mb-3 uppercase">Other Condition</p>
                    <ul className="list-disc pl-6 space-y-2 text-[12px]">
                        <li>A late repayment fee of 5% on the outstanding installment will be charged as default fee after the due date of loan repayment. Our recovery team shall visit the borrower after two (2) working days if the stipulated installment (both outstanding loan amount and default fee) is not paid.</li>
                        <li>The Borrower hereby, acknowledges and gives consent that after one (1) month, upon the expiration of the loan tenor, Edualliance Limited shall take over the management of the Borrower's Business to receive proceeds from the Borrower's Business until the Lender recoups the principal amount, interest and default fee.</li>
                        <li>The Borrower hereby, grants an authority/right to Edualliance Limited to sale any of the Borrower's assets for the purpose of loan recovery after one (1) month of default.</li>
                        <li>Upon subsequent defaults, Edualliance Limited shall take all necessary legal actions against the borrower in order to recoup the loan principal, interests and default fees.</li>
                        <li>In accepting this offer, we hereby confirm that the interest rates and charges stated herein were negotiated and mutually agreed with the Lender. Execution of this offer letter therefore conveys our consent to the application of these interest rates and charges.</li>
                        <li>Full installment must be paid in an event of paying the due/current installment, in addition with other subsequent installment(s) while the loan is still running.</li>
                        <li>In an event of default, all out of pocket expenses, legal fees and other expenses incurred by Edualliance Limited towards recovery shall be for the account of the Borrower.</li>
                        <li>There may be a need, at the instance of the Lender to vary the terms of the facility in the event of changes in interest rates/or foreign exchange rates arising from any change in market conditions at any time after the drawdown of the facility.</li>
                    </ul>
                </div>

                <div className="mb-12">
                    <p>Yours faithfully,</p>
                    <div className="flex justify-between items-end mt-12">
                        <div className="text-center">
                            <div className="w-[180px] border-b border-black mb-2"></div>
                            <p className="font-bold">Chidiebere Margaret Funke</p>
                            <p className="text-[11px] text-red-600">Head Operations</p>
                        </div>
                        <div className="text-center">
                            <div className="w-[180px] border-b border-black mb-2"></div>
                            <p className="font-bold">Moses Celestine, <span className="text-[10px] font-normal">MBA, ANIM, MCIB, ACIP, ACA</span></p>
                            <p className="text-[11px]">Chief Executive Officer</p>
                        </div>
                    </div>
                </div>

                <div className="border-t-2 border-dotted border-slate-300 pt-8 mt-10">
                    <p className="font-bold mb-4 uppercase">Acceptance of Offer</p>
                    <p className="leading-loose">
                        I, <span className="inline-block w-[300px] border-b border-black"></span> of <span className="inline-block w-[300px] border-b border-black"></span> accept the terms and conditions of the loan dated <span className="inline-block w-[150px] border-b border-black"></span>.
                    </p>
                    <div className="mt-8 grid grid-cols-2 gap-10">
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-2 items-end">
                                <span>Designation:</span>
                                <div className="flex-1 border-b border-black"></div>
                            </div>
                            <div className="flex gap-2 items-end">
                                <span>Signature:</span>
                                <div className="flex-1 border-b border-black"></div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-2 items-end">
                                <span>Date:</span>
                                <div className="flex-1 border-b border-black"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Footer */}
                <div className="mt-[100px] text-center text-slate-400 text-[10px] print:block hidden">
                    1
                </div>
            </div>
        </div>
    );
}
