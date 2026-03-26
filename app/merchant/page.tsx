"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import MerchantSignupForm from "@/app/merchant-signup/MerchantSignupForm";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

// Relying on global scroll reveal in layout.tsx

const features = [
    { icon: "🚀", title: "Rapid Growth", desc: "Expand your reach without losing control of your branding.", delay: "delay-100" },
    { icon: "🔗", title: "Native Protocol", desc: "Secure web-hook integrations for seamless order management.", delay: "delay-300" },
    { icon: "💎", title: "Premium Fleet", desc: "Our drivers are professionally vetted brand ambassadors.", delay: "delay-500" },
];

const perks = [
    { icon: "🔄", title: "Direct POS Sync", desc: "Automated Toast & Clover integration." },
    { icon: "💎", title: "Elite Drivers", desc: "Vetted ambassadors representing your brand." },
    { icon: "📈", title: "Higher Margins", desc: "Low commission rates that support your growth." },
    { icon: "🛠️", title: "Merchant Portal", desc: "Real-time analytics and menu management." },
];

export default function MerchantPortal() {

    return (
        <div className="min-h-screen bg-black text-slate-300 font-sans overflow-x-hidden selection:bg-primary/20">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
                    style={{
                        backgroundImage: "url('/merchant_hero_cinematic_1774395289646.png')",
                        filter: "blur(48px) brightness(0.3) saturate(1.3)",
                        opacity: 0.9,
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
            </div>

            {/* Nav */}
            <nav className="sticky top-0 z-50 backdrop-blur-3xl bg-black/70 border-b border-white/8 px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <Logo size="md" />
                    <div className="h-5 w-px bg-white/10 hidden lg:block" />
                    <div className="hidden lg:flex gap-8 text-[10px] font-black uppercase tracking-[0.4em] italic">
                        <Link href="/restaurants" className="text-slate-500 hover:text-white transition-colors">Marketplace</Link>
                        <Link href="/merchant" className="text-primary">Partners</Link>
                    </div>
                </div>
                <div className="flex items-center gap-5">
                    <Link href="/merchant/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all border border-white/10 rounded-full px-5 py-2 hover:bg-white/5 italic hidden sm:block">Login</Link>
                    <Link href="#signup" className="badge-solid-primary !py-2.5 !px-8 !text-[10px] !rounded-full h-glow">
                        Join Network
                    </Link>
                </div>
            </nav>

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <section className="relative z-10 flex flex-col items-center justify-center text-center min-h-[92vh] px-6 space-y-10">
                <div className="reveal flex items-center gap-4 text-white/40 font-black uppercase tracking-[0.6em] text-[10px] italic">
                    <div className="w-10 h-px bg-white/20" />
                    Partner Onboarding
                    <div className="w-10 h-px bg-white/20" />
                </div>

                <h1 className="reveal delay-100 text-6xl md:text-[90px] font-serif text-white tracking-tight leading-[0.9] uppercase max-w-4xl mx-auto italic">
                    Scale.<br />
                    Integrate.<br />
                    <span className="text-primary not-italic font-black">Thrive.</span>
                </h1>

                <p className="reveal delay-200 text-slate-400 text-base md:text-xl font-bold leading-relaxed max-w-xl mx-auto italic">
                    Join an elite logistics network designed to prioritize local margins and high-velocity synchronizations.
                </p>

                <div className="reveal delay-300 flex flex-col sm:flex-row gap-4 items-center">
                    <Link href="#signup" className="badge-solid-primary !rounded-full !py-4 !px-12 !text-[11px] h-glow">
                        Start Your Application
                        <span className="ml-3 group-hover:translate-x-1.5 transition-transform duration-500 text-lg leading-none">→</span>
                    </Link>
                    <Link href="#features" className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors italic">
                        Learn More ↓
                    </Link>
                </div>

                {/* Scroll indicator */}
                <div className="reveal delay-400 absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-600 italic">Scroll</span>
                    <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent animate-pulse" />
                </div>
            </section>

            <section id="features" className="relative z-10 w-full py-20">
                <div className="w-full flex flex-col items-center px-8">
                    <div className="w-16 h-0.5 bg-primary/40 rounded-full mb-10 reveal" />
                    
                    <div className="reveal text-center mb-16 space-y-4 w-full max-w-4xl">
                        <h2 className="text-5xl md:text-7xl font-black tracking-[calc(-0.06em)] leading-none uppercase italic">
                            <span className="text-white mr-1">Partner</span>
                            <span className="text-primary not-italic">PROTOCOLS.</span>
                        </h2>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Engineered for Merchant Success</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
                        {features.map((feat, i) => (
                            <div key={i} className={`reveal-scale ${feat.delay} p-12 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col items-center text-center hover:border-primary/30 transition-all hover:scale-[1.02] group backdrop-blur-3xl shadow-2xl relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-500 relative z-10">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
                                    {feat.icon}
                                </div>
                                <h3 className="text-2xl text-white font-[900] italic uppercase tracking-tighter leading-none relative z-10 font-serif mb-4">{feat.title}</h3>
                                <p className="text-slate-500 text-[13px] font-bold italic leading-relaxed max-w-[220px] mx-auto relative z-10">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PERKS LIST (Scroll Reveal) ────────────────────────────────── */}
            <section className="relative z-10 w-full py-24">
                <div className="w-full flex flex-col items-center px-8">
                    <div className="flex items-center justify-center gap-10 text-primary font-black uppercase tracking-[0.6em] text-[9px] mb-20 opacity-40 select-none w-full reveal">
                        <div className="flex-1 h-px bg-primary/20 max-w-[100px]" />
                        <span className="shrink-0 px-4">Platform Features</span>
                        <div className="flex-1 h-px bg-primary/20 max-w-[100px]" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
                        {perks.map((p, i) => (
                            <div key={i} className={`reveal delay-${(i + 1) * 100} flex items-center gap-6 p-8 bg-[#0d0d0e] border border-white/5 rounded-2xl hover:border-primary/20 transition-all group shadow-2xl`}>
                                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                                    {p.icon}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-white italic tracking-wide uppercase">{p.title}</p>
                                    <p className="text-xs text-slate-500 italic font-bold leading-tight">{p.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── ENROLLMENT FORM ────────────────────────────────────────────── */}
            <section id="signup" className="relative z-10 w-full py-16 scroll-mt-24">
                <div className="w-full flex flex-col items-center px-6">
                    <div className="reveal mb-14 text-center space-y-3 w-full max-w-3xl">
                        <h2 className="text-3xl md:text-5xl font-serif italic text-white uppercase tracking-tight">Start your <span className="text-primary">Partnership.</span></h2>
                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] italic">Establish your digital storefront in minutes</p>
                    </div>
                    <div className="reveal delay-100 w-full max-w-3xl">
                        <MerchantSignupForm />
                    </div>
                </div>
            </section>


            <footer className="relative z-10 py-20 bg-black border-t border-white/5 max-w-7xl mx-auto px-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.5em] text-slate-700 italic">
                    <div className="flex items-center gap-5">
                        <Logo size="sm" className="opacity-40 hover:opacity-100 transition-opacity" showPlus={false} />
                        <span>TrueServe &copy; {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex gap-12">
                        <Link href="/terms" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/merchant/login" className="hover:text-primary transition-colors text-primary">Portal</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
