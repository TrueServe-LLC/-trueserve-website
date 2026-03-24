"use client";

import { useRef, useState } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function DriverPortal() {
    return (
        <div className="min-h-screen bg-[#080c14] text-slate-300 selection:bg-primary/30 font-sans">
            <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#080c14]/80 border-b border-primary/10 px-8 py-5 flex justify-between items-center">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-xl border border-primary/20" />
                        <span className="text-2xl font-black text-white tracking-tight font-serif italic">True<span className="text-primary not-italic uppercase tracking-widest text-lg font-sans">Serve</span></span>
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
                        <p className="max-w-xl mx-auto text-base text-slate-400 font-medium leading-relaxed">
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

                {/* ── CONSOLIDATED FLEET HUB ────────────────────────────────────── */}
                <section className="py-48 bg-[#0a0a0b]">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="flex flex-col lg:flex-row gap-24 items-center">
                            <div className="flex-1 space-y-16">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 text-primary font-black uppercase tracking-[0.4em] text-[10px]">
                                        <div className="w-8 h-px bg-primary/30" />
                                        Fleet Operations
                                    </div>
                                    <h2 className="text-4xl md:text-6xl text-white font-serif font-bold italic tracking-tight leading-[0.9] uppercase">
                                        Everything you <br />
                                        need to deliver <br />
                                        <span className="text-primary not-italic">efficiently.</span>
                                    </h2>
                                    <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
                                        The <span className="text-primary">TrueServe</span> driver hub provides real-time traffic-syncing, smart batching, and transparent earnings in one cinematic interface.
                                    </p>
                                </div>

                                <div className="space-y-10 border-t border-white/5 pt-16">
                                    <div className="flex items-center gap-4 text-primary font-black uppercase tracking-[0.4em] text-[10px]">
                                        <div className="w-8 h-px bg-primary/30" />
                                        Earn on your terms
                                    </div>
                                    <div className="space-y-6 max-w-lg text-left">
                                        {[
                                            { step: "1", title: "Apply Online", desc: "Submit your credentials in under 5 minutes." },
                                            { step: "2", title: "Security Check", desc: "Rapid verification and background clearance." },
                                            { step: "3", title: "Scale Up", desc: "Accept your first order and start earning today." }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-6 group">
                                                <div className="flex-shrink-0 w-12 h-12 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-center text-primary font-bold text-lg group-hover:bg-primary group-hover:text-black transition-all">
                                                    {item.step}
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="text-white font-bold text-xl">{item.title}</h4>
                                                    <p className="text-slate-500 text-sm font-medium">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-8 text-left">
                                        <Link href="/driver-signup" className="badge-solid-primary !px-16 !py-6">
                                            Start Application <span>→</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 w-full flex flex-col items-center">
                                <div className="relative aspect-[4/5] w-full max-w-md lg:max-w-xl rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl group">
                                    <img 
                                        src="/driver_hero.png" 
                                        className="w-full h-full object-cover grayscale brightness-90 saturate-50 hover:grayscale-0 hover:saturate-100 transition-all duration-[1.5s] scale-105 group-hover:scale-100" 
                                        alt="Professional Courier Experience"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
                                    <div className="absolute bottom-10 left-10 right-10 p-8 bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/10 z-20">
                                          <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-3">Operator Verified</p>
                                          <p className="text-white text-base font-medium leading-relaxed italic uppercase tracking-tighter">&quot;TrueServe prioritizes driver freedom and fair pay.&quot;</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── REQUIREMENTS ─────────────────────────────────────────────── */}
                <section className="py-32 bg-[#080c14] border-t border-white/5">
                    <div className="container mx-auto px-6 max-w-7xl space-y-20">
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl md:text-6xl text-white font-serif font-bold italic tracking-tighter leading-none uppercase">Fleet Entry <br /><span className="text-primary not-italic">Requirements.</span></h2>
                            <p className="text-slate-500 text-sm md:text-base font-medium max-w-xl mx-auto">Apply in minutes. Most protocols are <span className="text-primary italic">synchronized instantly.</span></p>
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
                                <div key={i} className="flex items-center gap-6 p-6 bg-black/40 border border-white/5 rounded-2xl group hover:border-primary/50 transition-all">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 text-[10px] font-sans not-italic">✓</div>
                                    <span className="text-slate-300 text-[11px] font-black uppercase tracking-widest truncate">{req}</span>
                                </div>
                            ))}
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
                    
                    <div className="flex flex-wrap justify-center md:justify-end gap-x-12 gap-y-6 text-[11px] font-bold uppercase tracking-[0.4em] text-slate-600">
                        <Link href="/safety" className="hover:text-white transition-colors">Safety Standard</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Fleet Terms</Link>
                        <Link href="/driver/login" className="hover:text-white transition-colors text-primary italic">Fleet Entry</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
