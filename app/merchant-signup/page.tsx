"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function MerchantSignupPage() {
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
                <div className="flex gap-8 items-center">
                    <Link href="/merchant/login" className="barlow-cond font-black text-[11px] uppercase tracking-[0.25em] text-[#5A5550]">Portal Authorization</Link>
                </div>
            </header>

            <main className="relative z-10 flex flex-col items-center pt-10 pb-40 px-6 max-w-7xl mx-auto text-center">
                <div className="space-y-3 mb-20 animate-up">
                    <h1 className="bebas italic text-[80px] lg:text-[124px] leading-[0.88] tracking-tight text-white uppercase">
                        PARTNER<span className="text-[#e8a230]">PROTOCOLS.</span>
                    </h1>
                    <p className="barlow-cond font-black text-[12px] lg:text-[14px] uppercase tracking-[0.45em] text-[#5A5550]">
                        ENGINEERED FOR MERCHANT SUCCESS
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-[1100px] mb-8 animate-up [animation-delay:0.1s]">
                    {[
                        { title: "RAPID GROWTH", desc: "Expand your reach without losing control of your branding.", icon: "🚀" },
                        { title: "NATIVE PROTOCOL", desc: "Secure web-hook integrations for seamless order management.", icon: "🔗" },
                        { title: "PREMIUM FLEET", desc: "Our drivers are professionally vetted brand ambassadors.", icon: "💎" }
                    ].map((card) => (
                        <div key={card.title} className="blur-card p-10 flex flex-col items-center text-center space-y-5 rounded-[2.5rem]">
                            <div className="text-4xl grayscale brightness-200">{card.icon}</div>
                            <div className="space-y-2">
                                <h3 className="bebas italic text-[28px] tracking-wider">{card.title}</h3>
                                <p className="barlow-cond text-[11px] font-bold text-[#5A5550] leading-relaxed max-w-[220px] uppercase tracking-wider">{card.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="w-full max-w-[620px] bg-[#050505]/60 border border-white/5 rounded-[3rem] p-12 lg:p-20 backdrop-blur-[50px] animate-up shadow-2xl">
                    <h2 className="bebas italic text-5xl lg:text-7xl mb-12">START YOUR <span className="text-[#e8a230]">PARTNERSHIP.</span></h2>
                    
                    <form className="space-y-8 text-left" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                         <div className="space-y-3">
                            <label className="barlow-cond text-[11px] font-black uppercase tracking-[0.25em] text-[#e8a230]">BUSINESS NAME *</label>
                            <input type="text" className="fi w-full bg-[#030303] border border-white/10 text-[16px] px-7 py-5 text-white outline-none rounded-2xl" placeholder="EX: THE GOURMET BISTRO" required />
                        </div>
                        <button type="submit" className="w-full bg-[#e8a230] text-black bebas italic text-[26px] tracking-wider py-6 rounded-2xl transition-all shadow-xl">
                            CONTINUE AUTHORIZATION →
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
