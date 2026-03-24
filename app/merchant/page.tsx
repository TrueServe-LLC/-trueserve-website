"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import ModeToggle from "@/components/ModeToggle";

export const dynamic = "force-dynamic";

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
        <div className="min-h-screen bg-[#080c14] text-slate-300 selection:bg-primary/30 font-sans">
            {/* Standardized Sticky Nav */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#080c14]/80 border-b border-white/5 px-8 py-5 flex justify-between items-center">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-xl" />
                        <span className="text-2xl font-black text-white tracking-tight font-serif italic text-white">TrueServe</span>
                    </Link>
                    <div className="h-6 w-px bg-white/10 mx-2 hidden lg:block"></div>
                    <nav className="hidden lg:flex items-center gap-8">
                        <Link href="/restaurants" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Marketplace</Link>
                        <Link href="/merchant" className="text-[11px] font-bold uppercase tracking-widest text-primary">Partner Hub</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/login?role=merchant" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white border-b-2 border-transparent hover:border-primary transition-all pb-1">Sign In</Link>
                    <Suspense fallback={<div className="w-10 h-10 bg-white/5 rounded-full animate-pulse"></div>}>
                        <ModeToggle />
                    </Suspense>
                    <Link href="/merchant-signup" className="badge-solid-primary py-3 px-8 text-[10px] font-bold">
                        Join Network
                    </Link>
                </div>
            </nav>

            <main className="container py-24 space-y-48 animate-fade-in">
                 {/* Premium Header Title Stack */}
                 <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 max-w-6xl">
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-4xl shadow-2xl">🏬</div>
                        <h1 className="text-5xl md:text-8xl font-serif text-white tracking-tight leading-none italic">
                            The Partner Hub.
                        </h1>
                        <p className="text-slate-500 text-sm md:text-lg font-bold uppercase tracking-[0.2em] mt-4">
                            Logistics engineered for the neighborhood gems.
                        </p>
                    </div>
                </div>

                {/* Main Content Enclosure */}
                <div className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 md:p-24 shadow-3xl space-y-48">
                    
                    {/* Hero Section inside Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-12">
                            <h2 className="text-4xl md:text-6xl text-white font-serif leading-tight italic">Scale Without <br /><span className="text-primary not-italic">the Split.</span></h2>
                            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-lg mb-8">
                                Zero hidden fees. Fair dispatch algorithms. A marketplace that prioritizes your direct relationship with customers. 
                                We don&apos;t just deliver food; we deliver sustainability for your business.
                            </p>
                            <Link href="/merchant-signup" className="badge-solid-primary px-16 py-6 text-xs font-black shadow-primary/20">Begin Onboarding →</Link>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-12">
                                {[
                                    { label: "Flex Scale", value: "15% Split", icon: "🌱" },
                                    { label: "Pro Scale", value: "0% Split", icon: "🚀" },
                                    { label: "Setup Fee", value: "$0 USD", icon: "✨" },
                                    { label: "Storefront", icon: "🌐", value: "Included" }
                                ].map((row, i) => (
                                    <div key={i} className="flex flex-col p-10 bg-white/[0.03] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.06] transition-all shadow-xl group cursor-pointer" onClick={() => scrollToForm(row.label)}>
                                        <div className="text-3xl mb-6 group-hover:scale-110 transition-transform opacity-60">{row.icon}</div>
                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">{row.label}</p>
                                        <p className="text-2xl font-serif text-white group-hover:text-primary transition-colors italic">{row.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA Visual Block */}
                        <div id="inquiry-form" className="relative group aspect-square lg:aspect-auto lg:h-full">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/10 rounded-[4rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative bg-[#080c14] border border-white/10 rounded-[4rem] p-16 md:p-24 shadow-3xl text-center overflow-hidden h-full flex flex-col justify-center min-h-[500px]">
                                <img src="/Users/lcking992/.gemini/antigravity/brain/6ab4212f-1910-4d39-a07f-8099fe107ea1/trueserve_restaurant_partner_tech_1774363830507.png" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-[#080c14]/60 to-transparent"></div>
                                <div className="relative z-10 space-y-8">
                                    <h3 className="text-4xl md:text-5xl text-white font-serif italic tracking-tight uppercase">Partner <br />Entry</h3>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest pb-8 border-b border-white/10">Selection: {selectedPlan || "Standard Synchronization"}</p>
                                    <Link href="/merchant-signup" className="badge-solid-primary w-full py-8 text-xs font-black shadow-primary/40 uppercase tracking-[0.2em]">Begin Operational Link →</Link>
                                    <p className="mt-8 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Est. Review: <span className="text-slate-300">24 Business Hours</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Value Props Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-16 px-4 border-t border-white/5 pt-24">
                        {[
                            { icon: '🎯', title: 'Customer Hub', desc: 'Instantly connect with hungry diners in your neighborhood grid.' },
                            { icon: '⚡', title: 'Elite Dispatch', desc: 'High-velocity engine that ensures food stays hot and fresh.' },
                            { icon: '🌐', title: 'Digital Base', desc: 'Free professional storefront for your business operations.' },
                            { icon: '💎', title: 'Direct Margin', desc: 'Zero hidden fees and a split that respects your bottom line.' }
                        ].map((row, i) => (
                            <div key={i} className="space-y-8 group">
                                <div className="text-5xl group-hover:scale-110 transition-transform opacity-30">{row.icon}</div>
                                <h3 className="text-2xl text-white font-serif italic">{row.title}</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">{row.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Feature Stack */}
                    <div className="p-16 md:p-32 bg-primary/[0.02] border border-primary/10 rounded-[5rem] text-center shadow-2xl space-y-12">
                        <h2 className="text-5xl md:text-8xl text-white font-serif italic leading-none tracking-tighter">Marketplace <br />Revolution.</h2>
                        <p className="text-slate-400 text-lg md:text-2xl mb-16 max-w-3xl mx-auto font-medium leading-relaxed">TrueServe isn&apos;t just an app. We&apos;re a delivery standard designed to help local gems flourish without sacrificing their hard-earned margins.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto pt-12">
                            {[
                                { label: "Local Priority", icon: "📍", desc: "We prioritize local brands over global chains." },
                                { label: "Fair Splits", icon: "🤝", desc: "Drivers earn more, restaurants keep more." },
                                { label: "Rapid Sync", icon: "🔄", desc: "Integration with your POS in minutes." }
                            ].map((item) => (
                                <div key={item.label} className="p-12 rounded-[3.5rem] bg-[#080c14] border border-white/5 flex flex-col items-center group cursor-pointer hover:border-primary/30 transition-all shadow-xl">
                                    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform opacity-40">{item.icon}</div>
                                    <h4 className="text-[12px] font-bold uppercase text-white tracking-[0.2em] mb-4">{item.label}</h4>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-32 bg-[#080c14] border-t border-white/5">
                <div className="container px-8 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-xl" />
                        <span className="font-serif text-slate-500 tracking-tight text-2xl italic uppercase">TrueServe Network &copy; {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-end gap-x-12 gap-y-6 text-[11px] font-bold uppercase tracking-[0.4em] text-slate-600">
                        <Link href="/restaurants" className="hover:text-white transition-colors">Marketplace</Link>
                        <Link href="/driver" className="hover:text-primary transition-colors">Fleet Hub</Link>
                        <Link href="/login?role=merchant" className="hover:text-primary transition-colors text-primary italic">Partner Entry</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
