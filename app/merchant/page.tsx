"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import MerchantSignupForm from "@/app/merchant-signup/MerchantSignupForm";

export const dynamic = "force-dynamic";

export default function MerchantPortal() {
    return (
        <div className="min-h-screen bg-black text-slate-300 font-sans overflow-x-hidden selection:bg-primary/20">
            {/* ── BACKGROUND CORE ────────────────────────────────────────────── */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <img
                    src="/merchant_hero_cinematic_1774395289646.png"
                    alt="Merchant Background"
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
                        <Link href="/merchant" className="text-primary">Establishment Hub</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/merchant/login" className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all italic border-b-2 border-transparent hover:border-primary pb-1">Portal Login</Link>
                    <Link href="#signup" className="badge-solid-primary !py-3 !px-8 !text-[11px] !rounded-full h-glow">
                        Join Network
                    </Link>
                </div>
            </nav>

            <main className="container mx-auto py-20 space-y-24 animate-fade-in relative z-10 px-8 max-w-7xl">
                
                {/* ── PLATFORM FEATURES (NOW THE HERO) ────────────────────────── */}
                <div className="flex flex-col items-center text-center space-y-12 max-w-6xl mx-auto px-4 pt-10">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-px bg-primary/20 mb-4" />
                        <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight uppercase italic leading-none">
                            Platform <span className="text-primary not-italic font-black">Features.</span>
                        </h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] italic opacity-60">Engineered for Merchant Success</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
                        {[
                            { icon: '🚀', title: 'Rapid Growth', desc: 'Expand your reach without losing control of your branding.' },
                            { icon: '🔗', title: 'Native Protocol', desc: 'Secure web-hook integrations for seamless order management.' },
                            { icon: '💎', title: 'Premium Fleet', desc: 'Our drivers are professionally vetted brand ambassadors.' }
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
                        <MerchantSignupForm />
                    </div>
                </div>

                {/* ── SECONDARY VISIONARY SECTIONS ─────────────────────────── */}
                <div className="max-w-6xl mx-auto opacity-40 hover:opacity-100 transition-opacity duration-1000">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative group h-[400px]">
                            <img 
                                src="/merchant_hero_cinematic_1774395289646.png" 
                                alt="Merchant Ambience" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                        </div>
                        <div className="space-y-8 p-12 bg-white/[0.01] border border-white/5 rounded-[2.5rem] backdrop-blur-3xl">
                             <h2 className="text-3xl text-white font-black italic tracking-tighter leading-none uppercase h-glow">
                                Powering <br />
                                <span className="text-primary not-italic">Elite Commerce.</span>
                             </h2>
                             <p className="text-slate-400 text-sm font-bold italic leading-relaxed">
                                TrueServe integrates directly with your existing POS to provide a lossless delivery experience that prioritizes your margin.
                             </p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-24 bg-black border-t border-white/10 max-w-7xl mx-auto px-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-16 text-[11px] font-black uppercase tracking-[0.5em] text-slate-700 italic">
                    <div className="flex items-center gap-6">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl opacity-50" />
                        <span>TrueServe &copy; {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex gap-16">
                        <Link href="/terms" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/login?role=merchant" className="hover:text-primary transition-colors text-primary uppercase">Portal</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
