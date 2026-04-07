import React from 'react';
import Logo from "@/components/Logo";
import Link from "next/link";

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-[#0a0d12] text-[#c8d8e8] font-barlow-cond">
            <nav className="border-b border-white/5 p-6 flex justify-between items-center">
                <Logo size="sm" />
                <Link href="/" className="text-xs font-black uppercase tracking-widest text-[#e8a230] italic hover:underline">← Return Home</Link>
            </nav>
            
            <main className="max-w-xl mx-auto py-24 px-6 space-y-12 text-center">
                <header className="space-y-4">
                    <div className="w-16 h-16 bg-[#e8a230]/10 border border-[#e8a230]/20 rounded-full flex items-center justify-center text-3xl mx-auto shadow-glow">📡</div>
                    <h1 className="text-5xl font-bebas italic text-white uppercase tracking-wider">Mission Support</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#333] italic">// Secure Comms Uplink V.1.0</p>
                </header>

                <div className="space-y-6">
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                        <h3 className="text-white font-bebas text-2xl italic uppercase tracking-widest">Connect via Email</h3>
                        <p className="text-sm text-slate-500 italic">For fleet assistance, technical issues, or merchant support:</p>
                        <a href="mailto:support@trueservedelivery.com" className="block text-2xl font-bebas italic text-[#e8a230] hover:scale-105 transition-transform">support@trueservedelivery.com</a>
                    </div>

                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                        <h3 className="text-white font-bebas text-2xl italic uppercase tracking-widest">SMS Assistance</h3>
                        <p className="text-sm text-slate-500 italic">Reply <strong>HELP</strong> to any automated message for instant protocol assistance or <strong>STOP</strong> to terminate mission notifications.</p>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#222]">TrueServe Tactical Command // Charlotte, NC Sector</p>
                </div>
            </main>
        </div>
    );
}
