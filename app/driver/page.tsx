"use client";

import { useEffect } from "react";
import Link from "next/link";
import DriverApplicationForm from "@/app/driver/DriverApplicationForm";

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
    { icon: "💸", title: "Fair Pay", desc: "Secure earnings deposited directly to you each week.", delay: "delay-100" },
    { icon: "📅", title: "Flex Hours", desc: "Drive when you want — you are your own boss.", delay: "delay-300" },
    { icon: "🏠", title: "Local Pride", desc: "Deliver for the best neighborhood restaurants.", delay: "delay-500" },
];

const requirements = [
    "18+ & South Carolina ID",
    "Valid Driver's License & Insurance",
    "Reliable Vehicle / Bike / Motorcycle",
    "Social Security Number",
    "Smart Phone (iOS or Android)",
    "Professional Attitude",
];

export default function DriverPortal() {
    useScrollReveal();

    return (
        <div className="min-h-screen bg-black text-slate-300 font-sans overflow-x-hidden selection:bg-primary/20">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <img src="/diverse_drivers.png" alt="" className="w-full h-full object-cover opacity-[0.15] blur-3xl scale-110 grayscale" />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/85 to-black" />
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
                        <Link href="/driver" className="text-primary">Fleet Hub</Link>
                    </div>
                </div>
                <div className="flex items-center gap-5">
                    <Link href="/driver/login" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all italic hidden sm:block">Login</Link>
                    <Link href="#signup" className="badge-solid-primary !py-2.5 !px-8 !text-[10px] !rounded-full h-glow">
                        Join Fleet
                    </Link>
                </div>
            </nav>

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <section className="relative z-10 flex flex-col items-center justify-center text-center min-h-[92vh] px-6 space-y-10">
                <div className="reveal flex items-center gap-4 text-white/40 font-black uppercase tracking-[0.6em] text-[10px] italic">
                    <div className="w-10 h-px bg-white/20" />
                    Fleet Enrollment
                    <div className="w-10 h-px bg-white/20" />
                </div>

                <h1 className="reveal delay-100 text-6xl md:text-[90px] font-serif text-white tracking-tight leading-[0.9] uppercase max-w-4xl mx-auto italic">
                    Drive.<br />
                    Deliver.<br />
                    <span className="text-primary not-italic font-black">Earn.</span>
                </h1>

                <p className="reveal delay-200 text-slate-400 text-base md:text-xl font-bold leading-relaxed max-w-xl mx-auto italic">
                    Set your own hours and earn competitive pay. Join our community of independent drivers making real money on their schedule.
                </p>

                <div className="reveal delay-300 flex flex-col sm:flex-row gap-4 items-center">
                    <Link href="#signup" className="group relative flex items-center gap-3 px-10 py-4 bg-primary text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-2xl hover:scale-105 transition-all duration-500 shadow-[0_0_50px_rgba(245,158,11,0.25)] italic">
                        Apply to Drive
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
                        Engineered for Driver Success
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

            {/* ── REQUIREMENTS (Scroll Reveal) ─────────────────────────────── */}
            <section className="relative z-10 py-24 px-8 max-w-5xl mx-auto">
                <div className="reveal text-center mb-14 space-y-3">
                    <h2 className="text-3xl md:text-5xl font-serif italic text-white uppercase tracking-tight">Fleet <span className="text-primary">Protocols.</span></h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Standard operational requirements</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requirements.map((req, i) => (
                        <div key={i} className={`reveal delay-${Math.min((i + 1) * 100, 600)} flex items-center gap-5 p-4 bg-white/[0.02] border border-white/5 rounded-full hover:border-primary/20 transition-all group`}>
                            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-black shrink-0">✓</div>
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">{req}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── ENROLLMENT FORM ────────────────────────────────────────────── */}
            <section id="signup" className="relative z-10 py-16 px-4 max-w-7xl mx-auto scroll-mt-24">
                <div className="reveal mb-16 text-center space-y-3">
                    <h2 className="text-3xl md:text-5xl font-serif italic text-white uppercase tracking-tight">Start your <span className="text-primary">Application.</span></h2>
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] italic">Takes about 5 minutes — approval within 24 hours</p>
                </div>
                <div className="reveal delay-100 w-full">
                    <DriverApplicationForm />
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
                        <Link href="/driver/login" className="hover:text-primary transition-colors text-primary">Fleet</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
