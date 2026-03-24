"use client";

import { useRef, useState, Suspense } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function DriverPortal() {
    const formRef = useRef<HTMLDivElement>(null);

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
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
                        <Link href="/driver" className="text-[11px] font-bold uppercase tracking-widest text-primary">Fleet Hub</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/driver/login" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white border-b-2 border-transparent hover:border-primary transition-all pb-1">Fleet Login</Link>
                    <Link href="/driver-signup" className="badge-solid-primary py-3 px-8 text-[10px] font-bold">
                        Driver Sign Up
                    </Link>
                </div>
            </nav>

            <main className="animate-fade-in">
                {/* ── HERO ────────────────────────────────────────────────────────── */}
                <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=2070&auto=format&fit=crop"
                            alt="Driver Hero"
                            className="w-full h-full object-cover grayscale opacity-30 scale-105 group-hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/80 via-[#0a0a0b]/40 to-[#0a0a0b]" />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5" />
                    </div>

                    <div className="relative z-10 max-w-5xl space-y-10">
                        <h1 className="text-5xl md:text-8xl leading-[0.9] text-white font-serif font-bold tracking-tight italic">
                            Delivering with <br />
                            <span className="text-primary not-italic">TrueServe</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-300 font-medium leading-relaxed">
                            Join South Carolina drivers delivering food in your area. Simple signup, real-time orders, and weekly payouts waiting for you.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                            <Link href="/driver-signup" className="badge-solid-primary px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-2xl">
                                Become a driver
                            </Link>
                            <Link href="tel:+10000000000" className="badge-solid-primary !bg-primary/10 !text-primary border border-primary/20 hover:!bg-primary/20 px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-full backdrop-blur-md">
                                Call with questions
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── FEATURES ────────────────────────────────────────────────────── */}
                <section className="py-24 bg-[#0a0a0b]">
                    <div className="container mx-auto px-6 max-w-7xl space-y-24">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                            <div className="space-y-8">
                                <div className="flex items-center gap-4 text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">
                                    <div className="w-8 h-px bg-slate-800" />
                                    Driver Portal
                                </div>
                                <h2 className="text-4xl md:text-6xl text-white font-serif font-bold italic tracking-tight leading-[1]">
                                    Everything you need to deliver <span className="text-primary not-italic">efficiently.</span>
                                </h2>
                                <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed max-w-xl">
                                    TrueServe LLC&apos;s driver portal gives you real-time orders, smart routing, and clear earnings in one place. Start earning today.
                                </p>
                            </div>

                            <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/5 shadow-3xl group">
                                <img 
                                    src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop" 
                                    className="w-full h-full object-cover grayscale brightness-75 group-hover:scale-105 transition-transform duration-1000" 
                                    alt="Logistics"
                                />
                            </div>
                        </div>

                        {/* ── DRIVER ONBOARDING: Single Block Design ─────────────────────── */}
                        <div className="flex justify-center w-full border-t border-white/5 pt-24">
                             <div className="flex flex-col md:flex-row gap-12 max-w-5xl w-full items-center bg-white/[0.02] p-10 md:p-16 rounded-[2.5rem] border border-white/5 shadow-3xl">
                                <div className="flex-1 space-y-8">
                                    <div className="flex items-center gap-4 text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">
                                        <div className="w-8 h-px bg-slate-800" />
                                        Fleet Enrollment
                                    </div>
                                    <h2 className="text-4xl md:text-6xl text-white font-serif font-bold italic tracking-tight leading-[1]">
                                        Earn on <br />
                                        <span className="text-primary not-italic">Your terms.</span>
                                    </h2>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">1</div>
                                            <div>
                                                <h4 className="text-white font-bold text-base">Apply Online</h4>
                                                <p className="text-slate-400 text-xs">Submit documents in minutes.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">2</div>
                                            <div>
                                                <h4 className="text-white font-bold text-base">Verification</h4>
                                                <p className="text-slate-400 text-xs">Vetting and protocols.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">3</div>
                                            <div>
                                                <h4 className="text-white font-bold text-base">Deliver</h4>
                                                <p className="text-slate-400 text-xs">Accept orders same-week.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <Link href="/driver-signup" className="badge-solid-primary !px-12 !py-4 !text-[10px]">
                                            Start Application <span>→</span>
                                        </Link>
                                    </div>
                                </div>
                                <div className="flex-1 relative aspect-[4/3] rounded-[2rem] overflow-hidden border border-white/10 shadow-3xl">
                                    <img 
                                        src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop" 
                                        className="w-full h-full object-cover grayscale brightness-75 group-hover:scale-105 transition-transform duration-1000" 
                                        alt="Delivery Driver"
                                    />
                                </div>
                             </div>
                        </div>

                        {/* ── REQUIREMENTS ─────────────────────────────────────────────── */}
                        <div className="p-12 md:p-24 bg-primary/[0.01] border border-primary/5 rounded-[4rem] shadow-2xl space-y-12">
                            <div className="text-center space-y-4">
                                <h2 className="text-4xl md:text-6xl text-white font-serif font-bold italic tracking-tighter leading-none">Fleet Entry <br />Requirements.</h2>
                                <p className="text-slate-400 text-base md:text-lg font-medium max-w-2xl mx-auto">Apply in minutes. Most protocols are synchronized instantly.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    "18+ years of age & State ID",
                                    "Valid driver's license",
                                    "Personal Car/Scooter/Bike",
                                    "Social Security Verification",
                                    "iOS / Android Device",
                                    "Clean Driving Protocol"
                                ].map((req, i) => (
                                    <div key={i} className="flex items-center gap-6 p-6 bg-black/40 border border-white/5 rounded-full group hover:border-primary/50 transition-all">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 text-[10px] font-sans not-italic">✓</div>
                                        <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest truncate">{req}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-24 bg-[#080c14] border-t border-white/5">
                <div className="container px-8 flex flex-col md:flex-row justify-between items-center gap-12 relative">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl" />
                        <span className="font-serif text-slate-500 tracking-tight text-xl italic uppercase">TrueServe Fleet &copy; {new Date().getFullYear()}</span>
                    </div>
                    
                    <div className="flex flex-wrap justify-center md:justify-end gap-x-12 gap-y-6 text-[11px] font-bold uppercase tracking-[0.4em] text-slate-600">
                        <Link href="/legal" className="hover:text-white transition-colors">Safety Standard</Link>
                        <Link href="/legal" className="hover:text-white transition-colors">Fleet Terms</Link>
                        <Link href="/driver/login" className="hover:text-white transition-colors text-primary italic">Fleet Entry</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
