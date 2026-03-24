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
                    <Link href="/driver-signup" className="badge-solid-primary !py-3 !px-8 !text-sm">
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
                        <h1 className="text-4xl md:text-7xl leading-[1] text-white font-serif font-bold tracking-tight italic">
                            Delivering with <br />
                            <span className="text-primary not-italic uppercase tracking-widest text-3xl md:text-5xl">TrueServe</span>
                        </h1>
                        <p className="max-w-xl mx-auto text-sm md:text-base text-slate-400 font-medium leading-relaxed">
                            Join South Carolina drivers delivering food in your area. Simple signup, real-time orders, and weekly payouts waiting for you.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                            <Link href="/driver-signup" className="badge-solid-primary">
                                Become a driver
                            </Link>
                            <Link href="tel:+10000000000" className="badge-outline-white">
                                Call with questions
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── FEATURES ────────────────────────────────────────────────────── */}
                <section className="py-20 bg-[#0a0a0b]">
                    <div className="container mx-auto px-6 max-w-6xl space-y-20">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">
                                    <div className="w-8 h-px bg-slate-800" />
                                    Driver Portal
                                </div>
                                <h2 className="text-3xl md:text-5xl text-white font-serif font-bold italic tracking-tight leading-[1]">
                                    Everything you need to deliver <span className="text-primary not-italic uppercase text-2xl md:text-4xl">efficiently.</span>
                                </h2>
                                <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed max-w-xl">
                                    TrueServe LLC&apos;s driver portal gives you real-time orders, smart routing, and clear earnings in one place. Start earning today.
                                </p>
                            </div>

                            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 shadow-2xl group">
                                <img 
                                    src="https://images.unsplash.com/photo-1624513101683-162235c6de64?q=80&w=2070&auto=format&fit=crop" 
                                    className="w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-1000" 
                                    alt="Logistics"
                                />
                            </div>
                        </div>

                        {/* ── DRIVER ONBOARDING: De-boxed & Rescaled ─────────────────────── */}
                        <div className="border-t border-white/5 pt-32">
                             <div className="flex flex-col md:flex-row gap-16 max-w-7xl mx-auto w-full items-center py-12">
                                <div className="flex-1 space-y-8">
                                    <div className="flex items-center gap-4 text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">
                                        <div className="w-8 h-px bg-slate-800" />
                                        Fleet Enrollment
                                    </div>
                                    <h2 className="text-3xl md:text-6xl text-white font-serif font-bold italic tracking-tight leading-none uppercase">
                                        Earn on <br />
                                        <span className="text-primary not-italic">Your terms.</span>
                                    </h2>
                                    <div className="space-y-6 max-w-lg">
                                        {[
                                            { step: "1", title: "Apply Online", desc: "Submit documents in under 5 minutes." },
                                            { step: "2", title: "Verification", desc: "Quick background check and vetting." },
                                            { step: "3", title: "Start Earning", desc: "Accept orders and get paid same-week." }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-6">
                                                <div className="flex-shrink-0 w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                                                    {item.step}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold text-base">{item.title}</h4>
                                                    <p className="text-slate-500 text-sm">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-8">
                                        <Link href="/driver-signup" className="badge-solid-primary">
                                            Start Application <span>→</span>
                                        </Link>
                                    </div>
                                </div>
                                <div className="flex-1 relative aspect-square md:aspect-video w-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                                    <img 
                                        src="https://images.unsplash.com/photo-1624513101683-162235c6de64?q=80&w=2070&auto=format&fit=crop" 
                                        className="w-full h-full object-cover grayscale brightness-90 saturate-50 hover:saturate-100 transition-all duration-700" 
                                        alt="Modern Delivery Lifestyle"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-transparent to-transparent opacity-40" />
                                </div>
                             </div>
                        </div>

                        {/* ── REQUIREMENTS ─────────────────────────────────────────────── */}
                        <div className="p-10 md:p-16 border-t border-white/5 space-y-12">
                            <div className="text-center space-y-4">
                                <h2 className="text-3xl md:text-5xl text-white font-serif font-bold italic tracking-tighter leading-none uppercase">Fleet Entry <br />Requirements.</h2>
                                <p className="text-slate-500 text-sm md:text-base font-medium max-w-xl mx-auto">Apply in minutes. Most protocols are synchronized instantly.</p>
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
                                    <div key={i} className="flex items-center gap-6 p-5 bg-black/40 border border-white/5 rounded-2xl group hover:border-primary/50 transition-all">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 text-[10px] font-sans not-italic">✓</div>
                                        <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest truncate">{req}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-20 bg-[#080c14] border-t border-white/5">
                <div className="container px-8 flex flex-col md:flex-row justify-between items-center gap-8 relative">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
                        <span className="font-serif text-slate-600 tracking-tight text-lg italic uppercase">TrueServe Fleet &copy; {new Date().getFullYear()}</span>
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
