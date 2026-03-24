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
                    src="/diverse_welcoming_drivers_hero_1774378336060.png"
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
                    <Link href="/driver/login" className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all italic border-b-2 border-transparent hover:border-primary pb-1">Fleet Login</Link>
                    <Link href="#signup" className="badge-solid-primary !py-3.5 !px-10 !text-[11px] h-glow">
                        Join Fleet
                    </Link>
                </div>
            </nav>

            <main className="container mx-auto py-32 space-y-56 animate-fade-in relative z-10 px-8 max-w-7xl">
                {/* ── HERO ────────────────────────────────────────────────────────── */}
                <div className="flex flex-col items-center text-center space-y-12 max-w-5xl mx-auto glow-blur-primary px-4">
                    <div className="flex items-center gap-4 text-emerald-500/60 font-black uppercase tracking-[0.6em] text-[10px] italic">
                        <div className="w-12 h-px bg-emerald-500/20" />
                        Driver Opportunities
                        <div className="w-12 h-px bg-emerald-500/20" />
                    </div>
                    
                    <h1 className="text-4xl md:text-7xl font-serif text-white tracking-tighter leading-[1.1] animate-slide-up max-w-4xl">
                        Earn on your own <br />
                        <span className="italic text-primary drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]">schedule with TrueServe LLC.</span>
                    </h1>
                    
                    <p className="text-slate-500 text-base md:text-xl font-bold leading-relaxed max-w-3xl italic">
                        Join South Carolina drivers delivering food in your area. Simple signup, real-time orders, and weekly payouts waiting for you.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
                        <Link href="#signup" className="badge-solid-primary !px-12 !py-5 !text-xs">
                            Sign up as a driver
                        </Link>
                        <Link href="tel:+18645550312" className="badge-outline-white !px-12 !py-5 !text-xs h-glow bg-primary/10 border-primary/20 text-white">
                            Call with questions
                        </Link>
                    </div>
                </div>

                {/* ── BENEFITS ────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                    {[
                        { icon: '💸', title: 'Fair Pay', desc: 'Secure earnings deposited directly to you each week.' },
                        { icon: '📅', title: 'Flex Hours', desc: 'Drive when you want. You are your own boss.' },
                        { icon: '🏠', title: 'Local Pride', desc: 'Deliver for the best neighborhood restaurants.' }
                    ].map((feat, i) => (
                        <div key={i} className="p-12 rounded-[3.5rem] bg-white/[0.01] border border-white/5 space-y-8 hover:border-emerald-500/40 transition-all text-center hover:scale-[1.02] active:scale-95 group backdrop-blur-3xl">
                            <div className="text-6xl group-hover:scale-110 transition-transform filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{feat.icon}</div>
                            <h3 className="text-2xl text-white font-black italic uppercase tracking-widest">{feat.title}</h3>
                            <p className="text-slate-500 text-sm font-bold italic leading-relaxed">{feat.desc}</p>
                        </div>
                    ))}
                </div>

                {/* ── ENROLLMENT FORM ────────────────────────────────────────── */}
                <div id="signup" className="scroll-mt-48 text-center py-24 px-4">
                    <div className="space-y-6 mb-32">
                        <div className="flex items-center justify-center gap-4 text-emerald-500/50 font-black uppercase tracking-[0.6em] text-[10px] italic">
                            <div className="w-12 h-px bg-emerald-500/10" />
                            Enrollment Portal
                            <div className="w-12 h-px bg-emerald-500/10" />
                        </div>
                        <h2 className="text-4xl md:text-6xl text-white font-serif tracking-tighter leading-none uppercase h-glow">
                            Join the <span className="text-primary italic">Team.</span>
                        </h2>
                    </div>

                    <div className="relative z-10 mx-auto max-w-4xl py-12">
                        <DriverApplicationForm />
                    </div>
                </div>

                {/* ── REQUIREMENTS ────────────────────────────────────────────── */}
                <section className="py-32 mb-20 mx-auto max-w-6xl">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[4rem] p-14 md:p-24 space-y-16 overflow-hidden relative group backdrop-blur-2xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
                        
                        <div className="space-y-6 relative z-10 text-center">
                            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.6em] italic mb-6 block">Ready to go?</label>
                            <h3 className="text-4xl md:text-6xl text-white font-black italic tracking-tighter leading-tight uppercase h-glow">Requirements.</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            {[
                                "18+ & South Carolina ID",
                                "License & Insurance",
                                "Reliable Vehicle / Bike",
                                "Social Security ID",
                                "Smart Phone (iOS/Android)",
                                "Professional Attitude"
                            ].map((req, i) => (
                                <div key={i} className="flex items-center gap-8 p-10 bg-black/60 border border-white/5 rounded-3xl group transition-all hover:border-emerald-500/40">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/30 text-xl">✓</div>
                                    <span className="text-slate-300 text-sm font-black uppercase tracking-widest italic">{req}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-32 bg-black border-t border-white/10 max-w-7xl mx-auto px-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-16">
                    <div className="flex items-center gap-6">
                        <img src="/logo.png" alt="Logo" className="w-14 h-14 rounded-2xl" />
                        <span className="text-slate-600 tracking-[0.5em] text-sm font-black uppercase italic">TrueServe &copy; {new Date().getFullYear()}</span>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-x-16 gap-y-8 text-[11px] font-black uppercase tracking-[0.6em] text-slate-700 italic">
                        <Link href="/terms" className="hover:text-white transition-colors">Safety Guide</Link>
                        <Link href="/driver/login" className="hover:text-primary transition-colors text-primary font-black">Fleet Login</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
