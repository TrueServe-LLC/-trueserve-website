"use client";

import Link from "next/link";
import { useState } from "react";
import ModeToggle from "@/components/ModeToggle";

export default function MerchantPortal() {
    const [selectedPlan, setSelectedPlan] = useState<string>("");

    const scrollToForm = (plan: string) => {
        setSelectedPlan(plan);
        const form = document.getElementById("inquiry-form");
        if (form) {
            form.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30 font-sans">
            {/* Standardized Replit-Style Top-Nav */}
            <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-black/60 border-b border-white/5 px-6 py-4 flex justify-between items-center text-sans">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-8 h-8 rounded-full border border-white/10 shadow-lg" />
                        <span className="text-xl font-black tracking-tighter text-white uppercase italic">True<span className="text-primary tracking-tight">Serve</span></span>
                    </Link>
                    <div className="h-6 w-px bg-white/10 mx-2"></div>
                    <nav className="flex items-center gap-1">
                        <Link href="/restaurants" className="nav-link px-6 text-slate-400">🍴 Order Food</Link>
                        <Link href="/merchant" className="nav-link px-6 text-primary bg-primary/5 rounded-full">📊 Partner Hub</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/login?role=merchant" className="nav-link text-primary border-b border-primary/20 hover:border-primary transition-all pb-0.5">Partner Entry</Link>
                    <ModeToggle />
                    <Link href="/merchant-signup" className="btn-standard py-3 px-8 text-[9px] shadow-primary/10">
                        Get Started
                    </Link>
                </div>
            </nav>

            <main className="container py-12 md:py-24 px-4 md:px-8 pb-40 font-sans">
                 {/* Replit-Style Header Title Stack */}
                 <div className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto px-2">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-3xl shadow-xl font-sans">🏬</div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-tight">
                                Partner Hub
                            </h1>
                            <p className="text-slate-500 text-xs md:text-sm font-black uppercase tracking-widest mt-1">
                                High-margin marketplace protocols for local gems
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Enclosure (Replit-Style Card) */}
                <div className="max-w-7xl mx-auto bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 md:p-16 shadow-2xl space-y-32">
                    
                    {/* Hero Section inside Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32 items-center">
                        <div className="space-y-12">
                            <div>
                                <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-6 leading-tight uppercase">Scale Without <br />The Split.</h2>
                                <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-lg mb-8 italic">
                                    Zero hidden fees. Fair dispatch algorithms. A marketplace that prioritizes your direct relationship with customers.
                                </p>
                                <Link href="/merchant-signup" className="btn-standard px-12 py-5 text-xs shadow-primary/20">Begin Onboarding →</Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 pt-4">
                                {[
                                    { label: "Flex Scale", value: "15% Split", icon: "🌱" },
                                    { label: "Pro Scale", value: "0% Split", icon: "🚀" },
                                    { label: "Setup Fee", value: "$0 USD", icon: "✨" },
                                    { label: "Storefront", icon: "🌐", value: "Included" }
                                ].map((row, i) => (
                                    <div key={i} className="flex flex-col p-8 bg-white/[0.03] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.06] transition-all shadow-xl group cursor-pointer" onClick={() => scrollToForm(row.label)}>
                                        <div className="text-2xl mb-4 group-hover:scale-110 transition-transform">{row.icon}</div>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{row.label}</p>
                                        <p className="text-2xl font-black text-white group-hover:text-primary transition-colors tracking-tighter uppercase italic">{row.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA Visual Block */}
                        <div id="inquiry-form" className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-[3.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                            <div className="relative bg-black/60 border border-white/10 rounded-[3rem] p-12 md:p-20 shadow-2xl text-center overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 text-8xl opacity-5">📈</div>
                                <h3 className="text-4xl md:text-5xl font-black text-white italic tracking-tight mb-6 uppercase">Partner <br />Entry</h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-12 pb-8 border-b border-white/5 leading-relaxed italic">Selection: {selectedPlan || "Standard Synchronization"}</p>
                                <Link href="/merchant-signup" className="badge-solid-primary w-full py-6 text-xs shadow-primary/30 uppercase tracking-[0.2em]">Begin Operational Link →</Link>
                                <p className="mt-8 text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">Est. Review: <span className="text-slate-500">24 Business Hours</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Value Props Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-sans px-4">
                        {[
                            { icon: '🎯', title: 'Customer Hub', desc: 'Instantly connect with hungry diners in your neighborhood grid.' },
                            { icon: '⚡', title: 'Elite Dispatch', desc: 'High-velocity engine that ensures food stays hot and fresh.' },
                            { icon: '🌐', title: 'Digital Base', desc: 'Free professional storefront for your business operations.' },
                            { icon: '💎', title: 'Direct Margin', desc: 'Zero hidden fees and a split that respects your bottom line.' }
                        ].map((row, i) => (
                            <div key={i} className="space-y-6 group">
                                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform opacity-60">{row.icon}</div>
                                <h3 className="text-lg font-black text-white italic tracking-tight uppercase">{row.title}</h3>
                                <p className="text-slate-500 text-[11px] font-medium leading-relaxed uppercase tracking-wider">{row.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Feature Stack */}
                    <div className="p-12 md:p-20 bg-primary/[0.03] border border-primary/10 rounded-[4rem] text-center shadow-2xl">
                        <h2 className="text-4xl md:text-6xl font-black mb-8 text-white italic tracking-tighter uppercase leading-none">Marketplace <br />Revolution.</h2>
                        <p className="text-slate-500 text-lg mb-16 max-w-3xl mx-auto font-medium italic">TrueServe isn't just an app. We're a delivery standard designed to help local gems flourish without sacrificing their hard-earned margins.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
                            {[
                                { label: "Local Priority", icon: "📍", desc: "We prioritize local brands over global chains." },
                                { label: "Fair Splits", icon: "🤝", desc: "Drivers earn more, restaurants keep more." },
                                { label: "Rapid Sync", icon: "🔄", desc: "Integration with your POS in minutes." }
                            ].map((item) => (
                                <div key={item.label} className="p-10 rounded-[2.5rem] bg-black/60 border border-white/5 flex flex-col items-center group cursor-pointer hover:border-primary/20 transition-all">
                                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                                    <h4 className="text-[11px] font-black uppercase text-white tracking-widest mb-2">{item.label}</h4>
                                    <p className="text-[10px] text-slate-500 font-medium italic">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-20 bg-black border-t border-white/5">
                <div className="container max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 border border-white/10 rounded-full" />
                        <span className="font-black text-slate-500 tracking-tighter text-xl uppercase italic">TrueServe Network &copy; {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-end gap-x-12 gap-y-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-600">
                        <Link href="/restaurants" className="hover:text-white transition-colors">Marketplace</Link>
                        <Link href="/driver" className="hover:text-emerald-400 transition-colors">Fleet Hub</Link>
                        <Link href="/login?role=merchant" className="hover:text-primary transition-colors text-primary italic">Partner Entry</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
