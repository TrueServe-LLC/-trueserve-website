"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { TrendingUp, Zap, ShieldCheck } from "lucide-react";

function MerchantSignupContent() {
    const [step, setStep] = useState(1);

    return (
        <div className="min-h-screen bg-[#0c0e13] text-white font-sans selection:bg-[#e8a230]/30 selection:text-black overflow-x-hidden">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&family=Barlow+Condensed:ital,wght@0,700;0,800;1,700;1,800&family=Bebas+Neue&display=swap');
                .bebas { font-family: 'Bebas Neue', sans-serif; }
                .barlow-cond { font-family: 'Barlow Condensed', sans-serif; }
                
                .fi-input {
                    background: #131720;
                    border: 1px solid #2a2f3a;
                    border-radius: 4px;
                    padding: 12px 16px;
                    width: 100%;
                    outline: none;
                    font-size: 14px;
                    color: #fff;
                    transition: border-color 0.2s;
                }
                .fi-input:focus { border-color: #e8a230; }
                .fi-input::placeholder { color: #555; }
                
                .fi-label {
                    font-family: 'Barlow Condensed', sans-serif;
                    font-weight: 800;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: #e8a230;
                    margin-bottom: 8px;
                    display: block;
                }
            ` }} />

            {/* ── TOP NAV TABS ── */}
            <div className="flex bg-[#080a0f] border-b border-white/5">
                <Link href="/merchant/signup" className="px-8 py-4 bg-[#e8a230] text-black font-bold text-xs uppercase tracking-widest">Merchant Sign-up</Link>
                <Link href="/driver/signup" className="px-8 py-4 text-[#555] hover:text-white transition-colors font-bold text-xs uppercase tracking-widest">Driver Sign-up</Link>
            </div>

            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-50px)]">
                
                {/* ── LEFT COLUMN ── */}
                <div className="w-full lg:w-1/2 p-10 lg:p-24 space-y-16">
                    {/* Logo Section */}
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full border-2 border-[#e8a230] flex items-center justify-center">
                            <span className="text-[#e8a230] text-xl">✓</span>
                        </div>
                        <span className="barlow-cond text-2xl font-black uppercase tracking-widest">TrueServe</span>
                    </div>

                    <div className="space-y-8">
                        <div className="inline-block px-3 py-1 border border-[#e8a230] rounded flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#e8a230]" />
                            <span className="barlow-cond font-black text-[10px] uppercase tracking-[0.2em] text-[#e8a230]">PARTNER PROTOCOLS</span>
                        </div>

                        <h1 className="italic text-white text-[80px] lg:text-[110px] leading-[0.85] font-black uppercase tracking-tighter">
                            PARTNER<br />
                            <span className="text-[#e8a230]">PROTOCOLS.</span>
                        </h1>

                        <p className="max-w-md text-[#888] font-medium text-lg leading-relaxed">
                            Engineered for merchant success. List your restaurant, reach more customers, and grow without losing control of your brand.
                        </p>
                    </div>

                    <div className="space-y-4 max-w-lg">
                        {[
                            { title: "Rapid Growth", desc: "Expand reach without losing control of your brand.", icon: "📈" },
                            { title: "Native Protocol", desc: "Secure web-hook integrations for seamless orders.", icon: "≡" },
                            { title: "Premium Fleet", desc: "Professionally vetted brand ambassadors.", icon: "✓" }
                        ].map((card) => (
                            <div key={card.title} className="bg-[#0f1219] border border-white/5 p-6 flex items-center gap-6 rounded-sm">
                                <div className="w-12 h-12 bg-[#131720] border border-[#2a2f3a] rounded flex items-center justify-center text-[#e8a230] text-xl">{card.icon}</div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">{card.title}</h3>
                                    <p className="text-[#555] text-sm">{card.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div className="w-full lg:w-1/2 bg-[#0c0e13] border-l border-white/5 p-10 lg:p-24 flex items-center justify-center">
                    <div className="max-w-[500px] w-full">
                        <div className="mb-12">
                            <h2 className="italic text-white text-5xl font-black uppercase tracking-tight">START YOUR <span className="text-[#e8a230]">PARTNERSHIP.</span></h2>
                            <p className="barlow-cond font-black text-[10px] uppercase tracking-[0.3em] text-[#555] mt-2">ESTABLISH YOUR DIGITAL STOREFRONT IN MINUTES</p>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center justify-between relative mb-12">
                            <div className="absolute top-[14px] left-8 right-8 h-[1px] bg-white/5" />
                            {[
                                { id: 1, label: "IDENTITY" },
                                { id: 2, label: "GEOGRAPHY" },
                                { id: 3, label: "PARTNERSHIP" }
                            ].map((s) => (
                                <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                                    <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${s.id === 1 ? 'bg-[#e8a230] text-black' : 'bg-[#131720] border border-[#2a2f3a] text-[#555]'}`}>{s.id}</div>
                                    <span className={`barlow-cond font-black text-[10px] uppercase tracking-widest ${s.id === 1 ? 'text-[#e8a230]' : 'text-[#2a2f3a]'}`}>{s.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="barlow-cond font-black text-[12px] uppercase tracking-[0.2em] text-[#e8a230] border-b border-white/5 pb-4 mb-8">IDENTITY & CREDENTIALS</h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="fi-label">BUSINESS NAME *</label>
                                        <input type="text" className="fi-input" placeholder="Ex: The Gourmet Bistro" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="fi-label">CONTACT NAME *</label>
                                            <input type="text" className="fi-input" placeholder="Legal representative" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="fi-label">PHONE NUMBER *</label>
                                            <input type="tel" className="fi-input" placeholder="(336) 000-0000" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="fi-label">EMAIL ADDRESS *</label>
                                            <input type="email" className="fi-input" placeholder="partner@yourplace.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="fi-label">PASSWORD *</label>
                                            <input type="password" className="fi-input" placeholder="••••••••" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full bg-[#e8a230] text-black font-black uppercase text-sm py-5 rounded-md hover:brightness-110 transition-all flex items-center justify-center gap-2">
                                CONTINUE →
                            </button>
                            
                            <div className="text-center">
                                <p className="text-[#555] text-xs font-bold uppercase tracking-widest">
                                    Existing partner? <Link href="/merchant/login" className="text-[#e8a230] hover:underline">Login here</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MerchantSignupPage() {
    return <MerchantSignupContent />;
}
