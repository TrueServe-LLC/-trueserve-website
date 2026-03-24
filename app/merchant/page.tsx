"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import MerchantSignupForm from "@/app/merchant-signup/MerchantSignupForm";

export const dynamic = "force-dynamic";

export default function MerchantPortal() {
    return (
        <div className="min-h-screen bg-black text-slate-300 font-sans overflow-x-hidden selection:bg-primary/20">
            {/* ── BACKGROUND BLUR CORE ────────────────────────────────────────── */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <img
                    src="/admin_bg.png"
                    alt="Blurred Background"
                    className="w-full h-full object-cover opacity-10 blur-3xl scale-110"
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
                        <Link href="/merchant" className="text-primary">Partners</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/login?role=merchant" className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all italic border-b-2 border-transparent hover:border-primary pb-1">Sign In</Link>
                    <Link href="#signup" className="badge-solid-primary !py-3.5 !px-10 !text-[11px] h-glow">
                        Get Started
                    </Link>
                </div>
            </nav>

            <main className="container mx-auto py-32 space-y-56 animate-fade-in relative z-10 px-8 max-w-7xl">
                {/* ── HERO ────────────────────────────────────────────────────────── */}
                <div className="flex flex-col items-center text-center space-y-12 max-w-5xl mx-auto glow-blur-primary">
                    <div className="flex items-center gap-4 text-primary font-black uppercase tracking-[0.6em] text-[10px] italic">
                        <div className="w-12 h-px bg-primary/40" />
                        Merchant Expansion
                        <div className="w-12 h-px bg-primary/40" />
                    </div>
                    
                    <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] italic animate-slide-up">
                        Recapture您的 <br />
                        <span className="text-primary not-italic drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]">Profits.</span>
                    </h1>
                    
                    <p className="text-slate-400 text-lg md:text-2xl font-bold leading-relaxed max-w-3xl italic">
                        A dedicated platform to help local restaurants grow. Zero commission options, real support, and fair splits for every order.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-8 pt-6">
                        <Link href="#signup" className="badge-solid-primary !px-16 !py-6 !text-sm">
                            Join Network
                        </Link>
                        <Link href="tel:+18645550312" className="badge-outline-white !px-16 !py-6 !text-sm h-glow">
                            Support: (864) 555-0312
                        </Link>
                    </div>
                </div>

                {/* ── VALUE PROPS ───────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                    {[
                        { icon: '🏠', title: 'Local Priority', desc: 'Supporting independent neighborhood favorites.' },
                        { icon: '💰', title: 'Fair Splits', desc: 'Keep what you earn with transparent pricing.' },
                        { icon: '🤝', title: 'Real People', desc: 'Direct access to our South Carolina support team.' }
                    ].map((feat, i) => (
                        <div key={i} className="p-12 rounded-[3.5rem] bg-white/[0.01] border border-white/5 space-y-8 hover:border-primary/40 transition-all text-center hover:scale-[1.02] active:scale-95 group backdrop-blur-xl">
                            <div className="text-6xl group-hover:scale-110 transition-transform filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{feat.icon}</div>
                            <h3 className="text-2xl text-white font-black italic uppercase tracking-widest">{feat.title}</h3>
                            <p className="text-slate-500 text-sm font-bold italic leading-relaxed">{feat.desc}</p>
                        </div>
                    ))}
                </div>

                {/* ── POS HARMONY SECTION ───────────────────────────────────── */}
                <div className="py-24 max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center bg-black/40 border border-white/5 rounded-[4rem] p-16 md:p-24 backdrop-blur-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 -z-10 group-hover:scale-175 transition-transform duration-[3s]">
                             <img src="/logo.png" alt="Logo Watermark" className="w-64 h-64 opacity-20" />
                        </div>
                        
                        <div className="space-y-8">
                             <div className="inline-flex px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary italic">
                                Built for Ecosystems
                             </div>
                             <h2 className="text-4xl md:text-6xl text-white font-black italic tracking-tighter leading-none uppercase h-glow">
                                Seamless <br />
                                <span className="text-primary not-italic">POS Harmony.</span>
                             </h2>
                             <p className="text-slate-400 text-lg font-bold italic leading-relaxed max-w-sm">
                                TrueServe isn't just a delivery app—it's an extension of your tech stack. Our infrastructure is built for API-first operators.
                             </p>
                        </div>

                        <div className="grid grid-cols-2 gap-10">
                             {[
                                { name: "Toast Ready", desc: "Automated menu sync & real-time order injection via Toast Partner API." },
                                { name: "Direct Hooks", desc: "Native protocol support for high-volume kitchen printers and displays." },
                                { name: "Hub Aware", desc: "Smart inventory management that talks back to your POS automatically." },
                                { name: "Pro Splits", desc: "Automated daily payouts tied directly to your digital register history." }
                             ].map((item, i) => (
                                 <div key={i} className="space-y-3">
                                     <h4 className="text-[11px] font-black uppercase text-white italic tracking-widest">{item.name}</h4>
                                     <div className="w-8 h-1 bg-primary/30 rounded-full" />
                                     <p className="text-[10px] font-bold text-slate-500 italic leading-relaxed">{item.desc}</p>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>

                {/* ── SIGNUP FORM ─────────────────────────────────────────────── */}
                <div id="signup" className="space-y-24 scroll-mt-48 text-center py-20">
                    <div className="space-y-6">
                        <div className="flex items-center justify-center gap-4 text-primary font-black uppercase tracking-[0.6em] text-[10px] italic">
                            <div className="w-12 h-px bg-primary/40" />
                            Partner Onboarding
                            <div className="w-12 h-px bg-primary/40" />
                        </div>
                        <h2 className="text-4xl md:text-7xl text-white font-black italic tracking-tighter leading-none uppercase h-glow">
                            Partner <span className="text-primary not-italic">TrueServe.</span>
                        </h2>
                    </div>

                    <div className="bg-white/[0.01] border border-white/10 rounded-[4rem] p-10 md:p-24 shadow-3xl mx-auto max-w-6xl relative overflow-hidden backdrop-blur-3xl glow-blur-primary">
                        <MerchantSignupForm />
                    </div>
                </div>

                {/* ── PLANS ────────────────────────────────────── */}
                <div className="space-y-24 max-w-6xl mx-auto pt-32">
                    <div className="text-center space-y-6">
                        <h3 className="text-4xl md:text-6xl text-white font-black italic uppercase tracking-tighter h-glow">Plans that Fit.</h3>
                        <p className="text-slate-500 text-lg font-bold italic">No hidden fees. Total transparency.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">
                        {[
                            {
                                name: "Flex Plan",
                                amount: "15%",
                                sub: "per order",
                                desc: "No monthly commitment. Pay as you go.",
                                features: ["Live Tracking", "Local Priority", "Toast & Clover Ready"]
                            },
                            {
                                name: "Pro Plan",
                                amount: "0%",
                                sub: "+ $199/mo",
                                desc: "Best for high volume kitchens. Keep it all.",
                                features: ["Priority Support", "Toast POS Integration", "Dedicated Manager"]
                            }
                        ].map((plan, i) => (
                            <div key={i} className="flex flex-col p-14 rounded-[3.5rem] border border-white/5 bg-black/40 space-y-10 hover:border-primary/40 hover:bg-white/[0.02] transition-all backdrop-blur-2xl group active:scale-[0.98]">
                                <div className="space-y-6 flex-grow">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">{plan.name}</h4>
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-6xl md:text-8xl font-black text-white tracking-widest leading-none italic">{plan.amount}</span>
                                        <span className="text-slate-600 text-sm font-black uppercase tracking-widest italic">{plan.sub}</span>
                                    </div>
                                    <p className="text-slate-500 text-base font-bold italic leading-relaxed max-w-sm">{plan.desc}</p>
                                </div>
                                <ul className="space-y-6 border-t border-white/10 pt-10">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-4 text-slate-400 text-[11px] font-black uppercase tracking-[0.4em] italic">
                                            <span className="text-primary text-xl">✓</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── FOOTER CTA ────────────────────────────────────────────────── */}
                <div className="py-44 text-center max-w-5xl mx-auto space-y-16">
                     <h2 className="text-5xl md:text-8xl text-white font-black italic leading-[0.95] tracking-tighter h-glow uppercase">
                        The Future <br />
                        <span className="text-primary not-italic">Is Yours.</span>
                    </h2>
                    <div className="pt-10">
                         <Link href="#signup" className="badge-solid-primary !px-24 !py-8 !text-lg">
                            Apply Today
                         </Link>
                    </div>
                </div>
            </main>

            <footer className="py-32 bg-black border-t border-white/10 max-w-7xl mx-auto px-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-16">
                    <div className="flex items-center gap-6">
                        <img src="/logo.png" alt="Logo" className="w-14 h-14 rounded-2xl" />
                        <span className="text-slate-600 tracking-[0.5em] text-sm font-black uppercase italic">TrueServe &copy; {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-x-16 gap-y-8 text-[11px] font-black uppercase tracking-[0.6em] text-slate-700 italic">
                        <Link href="/restaurants" className="hover:text-white transition-colors">Order Now</Link>
                        <Link href="/driver" className="hover:text-primary transition-colors">Drive</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Privacy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
