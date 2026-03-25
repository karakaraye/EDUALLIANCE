'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Navigation = () => {
    const pathname = usePathname();
    const [isDarkMode, setIsDarkMode] = React.useState(true);
    const [role, setRole] = React.useState<string | null>(null);

    React.useEffect(() => {
        setRole(localStorage.getItem('edualliance_role') || 'ADMIN');
        // Run once on client mount to sync state with html root
        const theme = localStorage.getItem('edualliance_theme') || 'dark';
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        } else {
            document.documentElement.classList.remove('dark');
            setIsDarkMode(false);
        }
    }, []);

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
        <header className="flex items-center justify-between whitespace-nowrap border-b border-border-subtle bg-main/80 backdrop-blur-md px-6 lg:px-10 py-3 sticky top-0 z-50">
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
                            href="/"
                            className={`text-sm font-semibold flex items-center gap-2 group relative transition-colors ${isActive('/') ? 'text-primary' : 'text-slate-400 hover:text-strong'}`}
                        >
                            <span className="material-symbols-outlined text-[20px]">dashboard</span> Dashboard
                            {isActive('/') && <div className="h-0.5 w-full bg-primary absolute -bottom-[19px] rounded-full"></div>}
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

            <div className="flex flex-1 justify-end gap-6 items-center">
                <div className="relative w-72 hidden md:block">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">search</span>
                    <input
                        className="w-full h-10 pl-10 pr-4 rounded-full bg-panel border border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary text-sm text-strong placeholder:text-slate-600 transition-all outline-none"
                        placeholder="Search operations..."
                        type="text"
                    />
                </div>

                <button 
                    onClick={toggleTheme}
                    className="flex justify-center items-center size-10 rounded-full border border-border-subtle bg-panel hover:opacity-80 text-strong shadow-sm transition-all mr-2"
                    title="Toggle Theme"
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {isDarkMode ? 'light_mode' : 'dark_mode'}
                    </span>
                </button>

                <Link href="/loans/new">
                    <button className="flex items-center justify-center rounded-lg h-10 px-5 bg-white hover:bg-slate-200 transition-all text-slate-950 text-sm font-bold tracking-tight shadow-md">
                        <span className="material-symbols-outlined mr-2 text-[20px]">add</span>
                        <span>Add Record</span>
                    </button>
                </Link>

                <div className="flex items-center gap-2 ml-2">
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-1 ring-border-subtle ring-offset-2 ring-offset-surface cursor-pointer"
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBmlfkXIUB8Aqf1awBccTMIhK_rES2fLtpZ1rMXh9UYdLj38CWKDvUvqkhEmtzCshdqpW2AjLYJgbTc_ILMTkIYUXoDQbeHDi1zWOOvg7JXBXpxbJISeheRc_EWz603tp0pFfJXKOkMgWuSnw5q8zUHQAlKVouccVnqLHTOk09hXIfQrkAVDiWTWKDGNcOg1wYM0rH0WkFKOpwxnO07PXcAyVjI0t6vF2Tj7xffhJ2UoNvxfjoDb_7__1G0guR9O3rBsTmz3D0ePOSw")' }}>
                    </div>
                    <button 
                        onClick={() => { localStorage.removeItem('edualliance_role'); window.location.href='/login'; }}
                        className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors ml-1"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </header>
    );
};
