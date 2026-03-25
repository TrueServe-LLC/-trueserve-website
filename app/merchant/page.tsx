"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import MerchantSignupForm from "@/app/merchant-signup/MerchantSignupForm";

export const dynamic = "force-dynamic";

function useScrollReveal() {
    useEffect(() => {
        const elements = document.querySelectorAll(".reveal, .reveal-left, .reveal-scale");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );
        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);
}

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
    useScrollReveal();

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
                    <Link href="/" className="flex items-center gap-3 group">
                        <img src="/logo.png" alt="TrueServe" className="w-9 h-9 rounded-xl border border-white/10 group-hover:scale-110 transition-transform" />
                        <span className="text-xl font-black text-white tracking-widest italic uppercase">True<span className="text-primary not-italic">Serve</span></span>
                    </Link>
                    <div className="h-5 w-px bg-white/10 hidden lg:block" />
                    <div className="hidden lg:flex gap-8 text-[10px] font-black uppercase tracking-[0.4em] italic">
                        <Link href="/restaurants" className="text-slate-500 hover:text-white transition-colors">Marketplace</Link>
                        <Link href="/merchant" className="text-primary">Partners</Link>
                    </div>
                </div>
                <div className="flex items-center gap-5">
                    <Link href="/merchant/login" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all italic hidden sm:block">Login</Link>
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
                    <Link href="#signup" className="group relative flex items-center gap-3 px-10 py-4 bg-primary text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-2xl hover:scale-105 transition-all duration-500 shadow-[0_0_50px_rgba(245,158,11,0.25)] italic">
                        Start Your Application
                        <span className="group-hover:translate-x-1.5 transition-transform duration-500">→</span>
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

            {/* ── PLATFORM FEATURES (Scroll Reveal) ────────────────────────── */}
            <section id="features" className="relative z-10 py-32 px-8 max-w-7xl mx-auto">
                <div className="text-center space-y-4 mb-20">
                    <div className="reveal flex items-center justify-center gap-4 text-white/30 font-black uppercase tracking-[0.6em] text-[10px] italic">
                        <div className="w-10 h-px bg-primary/30" />
                        Engineered for Merchant Success
                        <div className="w-10 h-px bg-primary/30" />
                    </div>
                    <h2 className="reveal delay-100 text-4xl md:text-6xl font-serif text-white tracking-tight uppercase italic leading-none">
                        Platform <span className="text-primary not-italic font-black">Features.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                    {features.map((feat, i) => (
                        <div key={i} className={`reveal-scale ${feat.delay} p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-5 hover:border-primary/30 transition-all hover:scale-[1.02] group backdrop-blur-3xl shadow-xl relative overflow-hidden text-center`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="text-5xl group-hover:scale-110 transition-transform duration-500 relative z-10">{feat.icon}</div>
                            <h3 className="text-lg text-white font-black italic uppercase tracking-widest leading-none relative z-10">{feat.title}</h3>
                            <p className="text-slate-500 text-[11px] font-bold italic leading-relaxed max-w-[200px] mx-auto relative z-10">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── PERKS LIST (Scroll Reveal) ────────────────────────────────── */}
            <section className="relative z-10 py-24 px-8 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {perks.map((p, i) => (
                        <div key={i} className={`reveal delay-${(i + 1) * 100} flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-primary/20 transition-all group`}>
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">{p.icon}</div>
                            <div>
                                <p className="text-[13px] font-black text-white italic tracking-wide">{p.title}</p>
                                <p className="text-[11px] text-slate-500 italic font-bold leading-tight">{p.desc}</p>
                            </div>
                        </div>
                    ))}
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
                        <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-xl opacity-40" />
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
