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
                        <h1 className="text-6xl md:text-[110px] leading-[0.85] text-white font-serif font-bold tracking-tight italic">
                            Delivering with <br />
                            <span className="text-primary not-italic">TrueServe</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-300 font-medium leading-relaxed">
                            Join South Carolina drivers delivering food in your area. Simple signup, real-time orders, and weekly payouts waiting for you.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                            <Link href="/driver-signup" className="badge-solid-primary px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] rounded-full shadow-2xl">
                                Sign up as a driver
                            </Link>
                            <Link href="tel:+10000000000" className="badge-solid-primary !bg-primary/10 !text-primary border border-primary/20 hover:!bg-primary/20 px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] rounded-full backdrop-blur-md">
                                Call with questions
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── FEATURES ────────────────────────────────────────────────────── */}
                <section className="py-32 bg-[#0a0a0b]">
                    <div className="container mx-auto px-6 max-w-7xl space-y-32">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                            <div className="space-y-10">
                                <div className="flex items-center gap-4 text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">
                                    <div className="w-8 h-px bg-slate-800" />
                                    Driver Portal
                                </div>
                                <h2 className="text-5xl md:text-8xl text-white font-serif font-bold italic tracking-tight leading-[0.9]">
                                    Everything you need to deliver <span className="text-primary not-italic">efficiently.</span>
                                </h2>
                                <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                                    TrueServe LLC&apos;s driver portal gives you real-time orders, smart routing, and clear earnings in one place. Start earning today.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
                                    <Link href="/driver-signup" className="badge-solid-primary px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] rounded-full">
                                        Sign up as a driver
                                    </Link>
                                    <Link href="tel:+10000000000" className="badge-solid-primary !bg-primary/10 !text-primary border border-primary/20 hover:!bg-primary/20 px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] rounded-full">
                                        Call us with questions
                                    </Link>
                                </div>
                            </div>

                            <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/5 shadow-3xl group">
                                <img 
                                    src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop" 
                                    className="w-full h-full object-cover grayscale brightness-75 group-hover:scale-105 transition-transform duration-1000" 
                                    alt="Logistics"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>

                        {/* ── TRUST SECTION ──────────────────────────────────────────────── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center border-t border-white/5 pt-32">
                             <div className="space-y-10">
                                <div className="flex items-center gap-4 text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">
                                    <div className="w-8 h-px bg-slate-800" />
                                    Real Drivers
                                </div>
                                <h2 className="text-5xl md:text-8xl text-white font-serif font-bold italic tracking-tight leading-[0.9]">
                                    Drivers trust <br />
                                    <span className="text-primary not-italic">TrueServe</span> for flexible earnings.
                                </h2>
                                <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                                    See why drivers in South Carolina choose TrueServe LLC to earn on their own schedule with straightforward payouts.
                                </p>
                                <div className="pt-6">
                                    <Link href="/driver-signup" className="badge-outline-white inline-flex !border-white/20 hover:!border-primary !bg-white/5 hover:!bg-primary/10 !text-white px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] rounded-full">
                                        Start driving today
                                    </Link>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    { label: "Base Pay", value: "$3.00+", icon: "💰" },
                                    { label: "Mileage", value: "$0.70/mi", icon: "📍" },
                                    { label: "Wait Pay", value: "$0.25/min", icon: "⏰" },
                                    { label: "Tips", value: "100%", icon: "✨" }
                                ].map((row, i) => (
                                    <div key={i} className="flex flex-col p-10 bg-white/[0.03] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.06] transition-all shadow-xl group">
                                        <div className="text-3xl mb-6 group-hover:scale-110 transition-transform opacity-60 font-sans">{row.icon}</div>
                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 font-sans">{row.label}</p>
                                        <h4 className="text-3xl font-serif text-white group-hover:text-primary transition-colors italic leading-none">{row.value}</h4>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── REQUIREMENTS ─────────────────────────────────────────────── */}
                        <div className="p-16 md:p-32 bg-primary/[0.02] border border-primary/10 rounded-[5rem] shadow-2xl space-y-16">
                            <div className="text-center space-y-6">
                                <h2 className="text-5xl md:text-8xl text-white font-serif font-bold italic tracking-tighter leading-none">Fleet Entry <br />Requirements.</h2>
                                <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">Apply in minutes. Most protocols are synchronized instantly.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[
                                    "18+ years of age & State ID",
                                    "Valid driver's license",
                                    "Personal Car/Scooter/Bike",
                                    "Social Security Verification",
                                    "iOS / Android Device",
                                    "Clean Driving Protocol"
                                ].map((req, i) => (
                                    <div key={i} className="flex items-center gap-6 p-8 bg-black/40 border border-white/5 rounded-full group hover:border-primary/50 transition-all">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 text-xs font-sans not-italic">✓</div>
                                        <span className="text-slate-300 text-[11px] md:text-xs font-black uppercase tracking-widest truncate">{req}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-32 bg-[#080c14] border-t border-white/5">
                <div className="container px-8 flex flex-col md:flex-row justify-between items-center gap-12 relative">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-xl" />
                        <span className="font-serif text-slate-500 tracking-tight text-2xl italic uppercase">TrueServe Fleet &copy; {new Date().getFullYear()}</span>
                    </div>
                    
                    <div className="absolute top-0 right-8 md:-top-16 md:right-8">
                         <div className="badge-subtle-white !text-[9px] !px-4 !py-1.5 shadow-2xl">Built with TrueServe</div>
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
