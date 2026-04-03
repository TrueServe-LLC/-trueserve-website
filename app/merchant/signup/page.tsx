"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { TrendingUp, Zap, ShieldCheck, RefreshCw, BarChart3, Settings } from "lucide-react";

function MerchantSignupContent() {
    const [step, setStep] = useState(1);

    return (
        <div className="min-h-screen bg-[#000] text-white font-sans selection:bg-[#e8a230]/30 selection:text-black overflow-x-hidden">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&family=Barlow+Condensed:ital,wght@0,700;0,800;1,700;1,800&family=Bebas+Neue&display=swap');
                
                .bebas { font-family: 'Bebas Neue', sans-serif; }
                .barlow-cond { font-family: 'Barlow Condensed', sans-serif; }
                
                .fi::placeholder { color: #2a2f3a; }
                .fi:focus { border-color: #e8a230; background: rgba(19, 23, 32, 0.5); }
                
                @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                .animate-up { animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }

                .blur-card {
                    background: rgba(12, 14, 19, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    backdrop-filter: blur(20px);
                    transition: all 0.3s ease;
                }
                .blur-card:hover {
                    border-color: rgba(232, 162, 48, 0.2);
                    background: rgba(18, 20, 25, 0.5);
                }

                .nav-btn {
                    opacity: 0.3;
                    transition: all 0.3s ease;
                }
                .nav-btn:hover {
                    opacity: 1;
                    transform: translateY(-2px);
                }
            ` }} />

            {/* ── BACKGROUND IMAGE ── */}
            <div className="fixed inset-0 z-0">
                <img 
                    src="/merchant_signup_bg_v3_1775197447135.png" 
                    alt="" 
                    className="w-full h-full object-cover grayscale opacity-[0.12] brightness-[0.4] filter contrast(1.1)"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
            </div>

            {/* ── HEADER ── */}
            <header className="relative z-50 flex items-center justify-between px-10 py-8 max-w-[1400px] mx-auto">
                <Logo size="md" />
                <div className="hidden lg:flex gap-8 items-center">
                    <Link href="/merchant/login" className="barlow-cond font-black text-[11px] uppercase tracking-[0.25em] text-[#5A5550] hover:text-[#e8a230] transition-colors">Portal Authorization</Link>
                </div>
            </header>

            <main className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start justify-between min-h-[calc(100vh-140px)] gap-12 lg:gap-20 py-12 lg:py-20 px-6 max-w-[1400px] mx-auto">
                
                {/* ── LEFT COLUMN: HERO ── */}
                <div className="w-full lg:w-1/2 space-y-12 animate-up">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 bg-[#e8a230]/10 border border-[#e8a230]/20 rounded-md px-3 py-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#e8a230]" />
                            <span className="barlow-cond font-black text-[10px] uppercase tracking-[0.2em] text-[#e8a230]">PARTNER SIGNUP</span>
                        </div>
                        <h1 className="bebas italic text-[80px] lg:text-[110px] leading-[0.85] tracking-tight uppercase">
                            PARTNER<br />
                            <span className="text-[#e8a230]">SIGNUP.</span>
                        </h1>
                        <p className="text-[#5A5550] font-bold text-lg max-w-sm leading-tight italic">
                            Engineered for merchant success. List your restaurant, reach more customers, and grow without losing control of your brand.
                        </p>
                    </div>

                    <div className="space-y-4 max-w-md">
                        {[
                            { title: "Rapid Growth", desc: "Expand reach without losing control of your brand.", icon: <TrendingUp className="w-6 h-6 text-[#e8a230]" /> },
                            { title: "Native Protocol", desc: "Secure web-hook integrations for seamless orders.", icon: <Zap className="w-6 h-6 text-[#e8a230]" /> },
                            { title: "Premium Fleet", desc: "Professionally vetted brand ambassadors.", icon: <ShieldCheck className="w-6 h-6 text-[#e8a230]" /> }
                        ].map((card) => (
                            <div key={card.title} className="blur-card p-5 flex items-center gap-5 rounded-2xl border-l border-l-[#e8a230]/30 shadow-[0_5px_15px_rgba(0,0,0,0.3)] hover:scale-[1.02] transition-transform">
                                <div className="w-12 h-12 bg-[#0d0d0d] border border-white/5 rounded-xl flex items-center justify-center shadow-inner">{card.icon}</div>
                                <div className="space-y-0.5">
                                    <h3 className="bebas text-xl tracking-wider text-white">{card.title}</h3>
                                    <p className="barlow-cond text-[10px] font-bold text-[#444] uppercase tracking-widest">{card.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── RIGHT COLUMN: FORM BOX ── */}
                <div className="w-full lg:w-[540px] bg-[#050505]/60 border border-white/5 rounded-[2.5rem] p-10 lg:p-14 backdrop-blur-[50px] animate-up [animation-delay:0.2s] shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
                    <div className="space-y-2 mb-12">
                        <h2 className="bebas italic text-4xl lg:text-5xl tracking-wide uppercase leading-tight">START YOUR <span className="text-[#e8a230]">PARTNERSHIP.</span></h2>
                        <p className="barlow-cond font-black text-[10px] uppercase tracking-[0.3em] text-[#5A5550]">ESTABLISH YOUR DIGITAL STOREFRONT IN MINUTES</p>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center justify-between relative px-2 mb-12">
                        <div className="absolute top-[12px] left-10 right-10 h-px bg-[#1c1f28]" />
                        {[
                            { id: 1, label: "IDENTITY" },
                            { id: 2, label: "GEOGRAPHY" },
                            { id: 3, label: "PARTNERSHIP" }
                        ].map((s) => (
                            <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                                <div className={`w-6 h-6 flex items-center justify-center text-[9px] font-black font-mono transition-all duration-700 rounded-full ${step >= s.id ? 'bg-[#e8a230] text-black shadow-[0_0_20px_rgba(232,162,48,0.4)]' : 'bg-[#0a0a0a] border border-[#1c1f28] text-[#1c1f28]'}`}>
                                    {s.id}
                                </div>
                                <span className={`barlow-cond text-[9px] font-black uppercase tracking-[0.1em] ${step === s.id ? 'text-[#e8a230]' : 'text-[#2a2f3a]'}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6 pt-2">
                        <div className="mb-8">
                            <h3 className="barlow-cond text-[12px] font-black uppercase tracking-[0.25em] text-[#e8a230]">IDENTITY & CREDENTIALS</h3>
                            <div className="h-px w-full bg-white/5 mt-3" />
                        </div>

                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(prev => Math.min(prev + 1, 3)); }}>
                            <div className="space-y-2.5">
                                <label className="barlow-cond text-[10px] font-black uppercase tracking-[0.2em] text-[#5A5550]">BUSINESS NAME <span className="text-[#e8a230]">*</span></label>
                                <input type="text" className="fi w-full bg-[#030303] border border-white/5 text-[14px] px-6 py-4 text-white outline-none transition-all rounded-xl shadow-2xl" placeholder="EX: THE GOURMET BISTRO" required />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2.5">
                                    <label className="barlow-cond text-[10px] font-black uppercase tracking-[0.2em] text-[#5A5550]">CONTACT NAME <span className="text-[#e8a230]">*</span></label>
                                    <input type="text" className="fi w-full bg-[#030303] border border-white/5 text-[14px] px-6 py-4 text-white outline-none transition-all rounded-xl" placeholder="LEGAL REPRESENTATIVE" required />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="barlow-cond text-[10px] font-black uppercase tracking-[0.2em] text-[#5A5550]">PHONE NUMBER <span className="text-[#e8a230]">*</span></label>
                                    <input type="tel" className="fi w-full bg-[#030303] border border-white/5 text-[14px] px-6 py-4 text-white outline-none transition-all rounded-xl" placeholder="(336) 000-0000" required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2.5">
                                    <label className="barlow-cond text-[10px] font-black uppercase tracking-[0.2em] text-[#5A5550]">EMAIL ADDRESS <span className="text-[#e8a230]">*</span></label>
                                    <input type="email" className="fi w-full bg-[#030303] border border-white/5 text-[14px] px-6 py-4 text-white outline-none transition-all rounded-xl" placeholder="PARTNER@YOURPLACE.COM" required />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="barlow-cond text-[10px] font-black uppercase tracking-[0.2em] text-[#5A5550]">PASSWORD <span className="text-[#e8a230]">*</span></label>
                                    <input type="password" className="fi w-full bg-[#030303] border border-white/5 text-[14px] px-6 py-4 text-white outline-none transition-all rounded-xl" placeholder="••••••••" required />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-[#e8a230] hover:brightness-110 active:scale-[0.98] text-black bebas italic text-[24px] tracking-wider py-5 rounded-xl transition-all shadow-[0_20px_40px_rgba(232,162,48,0.2)] mt-4 uppercase">
                                CONTINUE →
                            </button>
                        </form>
                        
                        <div className="text-center pt-8">
                            <p className="barlow-cond text-[11px] font-black text-[#2a2f3a] uppercase tracking-[0.15em]">
                                ALREADY A PARTNER? <Link href="/merchant/login" className="text-[#e8a230] hover:text-white transition-colors ml-2 font-bold">LOGIN HERE</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── STICKY BOTTOM NAV (MOBILE) ── */}
            <nav className="fixed bottom-0 left-0 w-full z-[100] bg-[#080808]/95 backdrop-blur-[30px] border-t border-white/5 flex justify-around items-center px-6 py-4 lg:hidden shadow-[0_-25px_50px_rgba(0,0,0,0.8)]">
                {[
                   { label: 'HOME', icon: '🏠' },
                   { label: 'EXPLORE', icon: '🔍' },
                   { label: 'ORDERS', icon: '📋' },
                   { label: 'PROFILE', icon: '👤' }
                ].map((item) => (
                    <div key={item.label} className="nav-btn flex flex-col items-center gap-1.5 cursor-pointer">
                        <span className="text-[20px] filter grayscale brightness-[0.4]">{item.icon}</span>
                        <span className="barlow-cond text-[10px] font-black tracking-widest">{item.label}</span>
                    </div>
                ))}
            </nav>
        </div>
    );
}

export default function MerchantSignupPage() {
    return <MerchantSignupContent />;
}
