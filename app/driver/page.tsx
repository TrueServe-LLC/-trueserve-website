"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import DriverApplicationForm from "@/app/driver/DriverApplicationForm";

export const dynamic = "force-dynamic";

export default function DriverPortal() {
    return (
        <div className="min-h-screen bg-black text-slate-300 font-sans overflow-x-hidden selection:bg-primary/20">
            {/* ── BACKGROUND CORE ────────────────────────────────────────────── */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <img
                    src="/diverse_drivers.png"
                    alt="Driver Background"
                    className="w-full h-full object-cover opacity-20 blur-2xl scale-110 grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
            </div>

            <nav className="sticky top-0 z-50 backdrop-blur-3xl bg-black/60 border-b border-white/10 px-8 py-5 flex justify-between items-center transition-all">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-xl border border-white/10 group-hover:scale-110 transition-transform shadow-lg" />
                        <span className="text-2xl font-black text-white tracking-widest italic uppercase">True<span className="text-primary not-italic tracking-widest text-lg">Serve</span></span>
                    </Link>
                    <div className="h-6 w-px bg-white/10 mx-2 hidden lg:block"></div>
                    <nav className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.4em] italic">
                        <Link href="/restaurants" className="text-slate-500 hover:text-white transition-colors">Marketplace</Link>
                        <Link href="/driver" className="text-primary">Fleet Hub</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/driver/login" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all italic border-b-2 border-transparent hover:border-primary pb-1">Fleet Login</Link>
                    <Link href="#signup" className="badge-solid-primary !py-2.5 !px-8 !text-[10px] !rounded-full h-glow">
                        Join Fleet
                    </Link>
                </div>
            </nav>

            <main className="container mx-auto py-20 animate-fade-in relative z-10 px-8 max-w-7xl space-y-24">
                
                {/* ── PLATFORM FEATURES (NOW THE HERO) ────────────────────────── */}
                <div className="flex flex-col items-center text-center space-y-12 max-w-6xl mx-auto px-4 pt-10">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-px bg-primary/20 mb-4" />
                        <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight uppercase italic leading-none">
                            Platform <span className="text-primary not-italic font-black">Features.</span>
                        </h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] italic opacity-60">Engineered for Driver Success</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
                        {[
                            { icon: '💸', title: 'Fair Pay', desc: 'Secure earnings deposited directly to you each week.' },
                            { icon: '📅', title: 'Flex Hours', desc: 'Drive when you want. You are your own boss.' },
                            { icon: '🏠', title: 'Local Pride', desc: 'Deliver for the best neighborhood restaurants.' }
                        ].map((feat, i) => (
                            <div key={i} className="p-8 rounded-[3rem] bg-white/[0.01] border border-white/5 space-y-6 hover:border-primary/40 transition-all text-center hover:scale-[1.02] active:scale-95 group backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="text-5xl group-hover:scale-110 transition-transform filter drop-shadow-[0_0_15px_rgba(255,245,11,0.1)] relative z-10">{feat.icon}</div>
                                <h3 className="text-xl text-white font-black italic uppercase tracking-widest leading-none relative z-10">{feat.title}</h3>
                                <p className="text-slate-500 text-[11px] font-bold italic leading-relaxed max-w-[200px] mx-auto relative z-10">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── ENROLLMENT FORM ────────────────────────────────────────── */}
                <div id="signup" className="scroll-mt-48 pb-44 px-4 flex flex-col items-center relative z-10 w-full">
                    <div className="w-full max-w-7xl mx-auto">
                        <DriverApplicationForm />
                    </div>
                </div>

                {/* ── REQUIREMENTS ────────────────────────────────────────────── */}
                <section className="py-20 mb-20 mx-auto max-w-6xl opacity-40 hover:opacity-100 transition-opacity duration-1000">
                    <div className="bg-white/[0.01] border border-white/5 rounded-[4rem] p-16 space-y-12 overflow-hidden relative group backdrop-blur-3xl shadow-xl">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[120px] rounded-full opacity-50 translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-[4s]" />
                        
                        <div className="space-y-4 relative z-10 text-center">
                            <h3 className="text-4xl md:text-6xl text-white font-serif italic tracking-tighter leading-tight uppercase">Fleet <span className="text-primary not-italic">Protocols.</span></h3>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Standard operational requirements</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                            {[
                                "18+ & South Carolina ID",
                                "License & Insurance",
                                "Reliable Vehicle / Bike",
                                "Social Security ID",
                                "Smart Phone (iOS/Android)",
                                "Professional Attitude"
                            ].map((req, i) => (
                                <div key={i} className="flex items-center gap-6 p-5 bg-black/40 border border-white/5 rounded-full group transition-all hover:border-primary/20 shadow-md">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 text-xs shadow-glow-sm">✓</div>
                                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">{req}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-24 bg-black border-t border-white/10 max-w-7xl mx-auto px-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-16 text-[11px] font-black uppercase tracking-[0.5em] text-slate-700 italic">
                    <div className="flex items-center gap-6">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl opacity-40" />
                        <span>TrueServe &copy; {new Date().getFullYear()}</span>
                    </div>
                    
                    <div className="flex gap-16 text-slate-600">
                        <Link href="/terms" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/driver/login" className="hover:text-primary transition-colors text-primary font-black">Fleet</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
