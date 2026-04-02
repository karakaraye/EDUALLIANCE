'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Navigation = () => {
    const pathname = usePathname();
    const [isDarkMode, setIsDarkMode] = React.useState(true);
    const [role, setRole] = React.useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [notifications, setNotifications] = React.useState<any[]>([]);
    const [showDropdown, setShowDropdown] = React.useState(false);

    React.useEffect(() => {
        setRole(sessionStorage.getItem('edualliance_role') || 'ADMIN');
        // Run once on client mount to sync state with html root
        const theme = localStorage.getItem('edualliance_theme') || 'dark';
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        } else {
            document.documentElement.classList.remove('dark');
            setIsDarkMode(false);
        }
        
        fetchAlerts();
        
        // Close dropdown on outside click
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.notif-dropdown')) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchAlerts = async () => {
        try {
            // Read from Local Storage since system is client-mocked
            const rawLoans = localStorage.getItem('edualliance_loans');
            const rawInvestors = localStorage.getItem('edualliance_investors');
            const rawExpenses = localStorage.getItem('edualliance_expenses');
            
            const loansRes = rawLoans ? JSON.parse(rawLoans) : [];
            const investorsRes = rawInvestors ? JSON.parse(rawInvestors) : [];
            const expensesRes = rawExpenses ? JSON.parse(rawExpenses) : [];

            const alerts: any[] = [];
            
            // Standardize today to midnight
            const today = new Date();
            today.setHours(0,0,0,0);
            
            // Current day + 3 days ahead
            const limitDate = new Date(today);
            limitDate.setDate(limitDate.getDate() + 3);

            // Check Loans (Client Collections)
            if (Array.isArray(loansRes)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                loansRes.forEach((loan: any) => {
                    if (loan.status !== 'Active' && loan.status !== 'Overdue') return;
                    const duration = Number(loan.durationMonths) || 12;
                    const startDate = new Date(loan.disburseDate);
                    const monthlyPayment = Number(loan.amount) / duration;
                    
                    for (let i = 1; i <= duration; i++) {
                        const dueDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, startDate.getDate());
                        dueDate.setHours(0,0,0,0);
                        
                        if (dueDate >= today && dueDate <= limitDate) {
                            // Check if this specific month index is paid
                            const rec = loan.repayments && loan.repayments[i];
                            let amountPaid = 0;
                            if (rec === true) amountPaid = monthlyPayment;
                            else if (typeof rec === 'number') amountPaid = rec;
                            
                            const isPaid = amountPaid >= monthlyPayment - 0.01;

                            if (!isPaid) {
                                alerts.push({
                                    type: 'LOAN_COLLECTION',
                                    title: 'Upcoming Loan Collection',
                                    desc: `collect (₦${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}) from ${loan.name}.`,
                                    date: dueDate,
                                });
                            }
                        }
                    }
                });
            }

            // Check Investors (Payout Remittances)
            if (Array.isArray(investorsRes)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                investorsRes.forEach((inv: any) => {
                    if (inv.status !== 'Active') return;
                    const startRawDate = new Date(inv.dateInvested);
                    const monthlyPayment = (Number(inv.amountInvested) / 12) + (Number(inv.amountInvested) * (Number(inv.interestRate) / 100));
                    
                    for (let i = 1; i <= 12; i++) {
                        const dueDate = new Date(startRawDate.getFullYear(), startRawDate.getMonth() + i, startRawDate.getDate());
                        dueDate.setHours(0,0,0,0);
                        
                        if (dueDate >= today && dueDate <= limitDate) {
                            // Check if payout exists in Expenses
                            const monthStr = dueDate.toISOString().slice(0, 7);
                            const paymentDesc = `Investor Payout - ${inv.name} (Payment ${i}/12, ${monthStr})`;
                            const isPaid = expensesRes.some((exp: any) => exp.desc === paymentDesc && exp.category === 'Investor Payout');

                            if (!isPaid) {
                                alerts.push({
                                    type: 'INVESTOR_PAYOUT',
                                    title: 'Investor Payout Due',
                                    desc: `remit (₦${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}) to ${inv.name}.`,
                                    date: dueDate,
                                });
                            }
                        }
                    }
                });
            }

            alerts.sort((a,b) => a.date.getTime() - b.date.getTime());
            setNotifications(alerts);

        } catch (e) {
            console.error("Failed to fetch notification alerts", e);
        }
    };

    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('edualliance_theme', 'light');
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('edualliance_theme', 'dark');
            setIsDarkMode(true);
        }
    };

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <header className="print:hidden flex items-center justify-between whitespace-nowrap border-b border-border-subtle bg-main/80 backdrop-blur-md px-6 lg:px-10 py-3 sticky top-0 z-50">
            <div className="flex items-center gap-10">
                <Link href="/" className="flex items-center gap-3">
                    <div className="size-9 bg-brand-teal rounded-lg flex items-center justify-center text-strong shadow-lg shadow-brand-teal/20">
                        <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                    </div>
                    <h2 className="text-strong text-xl font-extrabold tracking-tight">Edualliance</h2>
                </Link>

                <nav className="hidden xl:flex items-center gap-8">
                    {role === 'ADMIN' && (
                        <Link
                            href="/dashboard"
                            className={`text-sm font-semibold flex items-center gap-2 group relative transition-colors ${isActive('/dashboard') ? 'text-primary' : 'text-slate-400 hover:text-strong'}`}
                        >
                            <span className="material-symbols-outlined text-[20px]">dashboard</span> Dashboard
                            {isActive('/dashboard') && <div className="h-0.5 w-full bg-primary absolute -bottom-[19px] rounded-full"></div>}
                        </Link>
                    )}

                    {(role === 'ADMIN' || role === 'LOANS') && (
                        <Link
                            href="/loans"
                            className={`text-sm font-medium flex items-center gap-2 transition-colors ${isActive('/loans') ? 'text-primary' : 'text-slate-400 hover:text-strong'}`}
                        >
                            <span className="material-symbols-outlined text-[20px]">payments</span> Loans
                            {isActive('/loans') && <div className="h-0.5 w-full bg-primary absolute -bottom-[19px] rounded-full"></div>}
                        </Link>
                    )}

                    {(role === 'ADMIN' || role === 'FINANCE') && (
                        <Link
                            href="/payroll"
                            className={`text-sm font-medium flex items-center gap-2 transition-colors ${isActive('/payroll') ? 'text-primary' : 'text-slate-400 hover:text-strong'}`}
                        >
                            <span className="material-symbols-outlined text-[20px]">group</span> Payroll
                            {isActive('/payroll') && <div className="h-0.5 w-full bg-primary absolute -bottom-[19px] rounded-full"></div>}
                        </Link>
                    )}

                    {(role === 'ADMIN' || role === 'FINANCE') && (
                        <Link
                            href="/expenses"
                            className={`text-sm font-medium flex items-center gap-2 transition-colors ${isActive('/expenses') ? 'text-primary' : 'text-slate-400 hover:text-strong'}`}
                        >
                            <span className="material-symbols-outlined text-[20px]">receipt_long</span> Expenses
                            {isActive('/expenses') && <div className="h-0.5 w-full bg-primary absolute -bottom-[19px] rounded-full"></div>}
                        </Link>
                    )}

                    {(role === 'ADMIN' || role === 'INVESTORS') && (
                        <Link
                            href="/investors"
                            className={`text-sm font-medium flex items-center gap-2 transition-colors ${isActive('/investors') ? 'text-primary' : 'text-slate-400 hover:text-strong'}`}
                        >
                            <span className="material-symbols-outlined text-[20px]">handshake</span> Investors
                            {isActive('/investors') && <div className="h-0.5 w-full bg-primary absolute -bottom-[19px] rounded-full"></div>}
                        </Link>
                    )}

                    {role === 'ADMIN' && (
                        <Link
                            href="/reports"
                            className={`text-sm font-medium flex items-center gap-2 transition-colors ${isActive('/reports') ? 'text-primary' : 'text-slate-400 hover:text-strong'}`}
                        >
                            <span className="material-symbols-outlined text-[20px]">monitoring</span> Reports
                            {isActive('/reports') && <div className="h-0.5 w-full bg-primary absolute -bottom-[19px] rounded-full"></div>}
                        </Link>
                    )}
                </nav>
            </div>

            <div className="flex flex-1 justify-end gap-3 lg:gap-6 items-center">
                <div className="relative w-full max-w-[200px] xl:max-w-xs hidden md:block">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">search</span>
                    <input
                        className="w-full h-10 pl-10 pr-4 rounded-full bg-panel border border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary text-sm text-strong placeholder:text-slate-600 transition-all outline-none"
                        placeholder="Search operations..."
                        type="text"
                    />
                </div>

                <button 
                    onClick={toggleTheme}
                    className="flex justify-center items-center size-10 rounded-full border border-border-subtle bg-panel hover:opacity-80 text-strong shadow-sm transition-all"
                    title="Toggle Theme"
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {isDarkMode ? 'light_mode' : 'dark_mode'}
                    </span>
                </button>

                {/* Notifications Bell Tracker */}
                <div className="relative notif-dropdown">
                    <button 
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex justify-center items-center size-10 rounded-full border border-border-subtle bg-panel hover:bg-slate-800 text-strong shadow-sm transition-all relative ml-2 mr-2"
                        title="Alerts & Notifications"
                    >
                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                        {notifications.length > 0 && (
                            <span className="absolute top-0 right-0 size-3 bg-red-500 border-2 border-surface rounded-full animate-pulse"></span>
                        )}
                    </button>

                    {showDropdown && (
                        <div className="absolute top-14 right-0 w-80 bg-panel border border-border-subtle rounded-xl shadow-2xl p-4 z-50 animate-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-4 border-b border-border-subtle pb-3">
                                <h3 className="text-sm font-black text-strong flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-500 text-[18px]">warning</span> 
                                    Upcoming Approaching Actions
                                </h3>
                                <span className="text-xs font-bold text-slate-500 bg-surface px-2 py-0.5 rounded-md">{notifications.length}</span>
                            </div>
                            
                            <div className="max-h-96 overflow-y-auto pr-1 flex flex-col gap-3">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-2">
                                        <span className="material-symbols-outlined text-4xl opacity-50">task_alt</span>
                                        <p className="text-xs font-bold italic text-center">No pending financial maneuvers due<br/> within the 3-day projection.</p>
                                    </div>
                                ) : (
                                    notifications.map((alert, idx) => (
                                        <div key={idx} className={`p-3 rounded-lg border flex flex-col gap-1 transition-all ${alert.type === 'LOAN_COLLECTION' ? 'bg-brand-teal/5 border-brand-teal/30 hover:bg-brand-teal/10' : 'bg-primary/5 border-primary/30 hover:bg-primary/10'}`}>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-[10px] uppercase font-black tracking-widest ${alert.type === 'LOAN_COLLECTION' ? 'text-brand-teal' : 'text-primary'}`}>
                                                    {alert.title}
                                                </span>
                                                <span className="text-[10px] text-strong bg-surface border border-border-subtle px-1.5 py-0.5 rounded font-mono shadow-sm">
                                                    {alert.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-300 font-medium leading-relaxed">{alert.desc}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 ml-2">
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-1 ring-border-subtle ring-offset-2 ring-offset-surface cursor-pointer"
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBmlfkXIUB8Aqf1awBccTMIhK_rES2fLtpZ1rMXh9UYdLj38CWKDvUvqkhEmtzCshdqpW2AjLYJgbTc_ILMTkIYUXoDQbeHDi1zWOOvg7JXBXpxbJISeheRc_EWz603tp0pFfJXKOkMgWuSnw5q8zUHQAlKVouccVnqLHTOk09hXIfQrkAVDiWTWKDGNcOg1wYM0rH0WkFKOpwxnO07PXcAyVjI0t6vF2Tj7xffhJ2UoNvxfjoDb_7__1G0guR9O3rBsTmz3D0ePOSw")' }}>
                    </div>
                    <button 
                        onClick={() => { sessionStorage.removeItem('edualliance_role'); window.location.href='/'; }}
                        className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors ml-1"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </header>
    );
};
