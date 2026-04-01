import React from 'react';

export const Footer = () => {
    return (
        <footer className="print:hidden px-10 py-8 border-t border-border-subtle bg-main mt-auto">
            <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">Edualliance Executive Remake © 2024</p>
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                        <span className="size-1.5 rounded-full bg-primary"></span> System Online
                    </span>
                    <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Enterprise Secure Encryption Active</span>
                </div>
            </div>
        </footer>
    );
};
