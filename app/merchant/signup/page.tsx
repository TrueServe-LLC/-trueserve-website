"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { TrendingUp, Zap, ShieldCheck } from "lucide-react";
import SignupLeftAnimation from "@/components/SignupLeftAnimation";

function MerchantSignupContent() {
    const [step, setStep] = useState(1);
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#000] text-white font-sans selection:bg-[#e8a230]/30 selection:text-black overflow-x-hidden relative">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&family=Barlow+Condensed:ital,wght@0,700;0,800;1,700;1,800&family=Bebas+Neue&display=swap');
                .bebas { font-family: 'Bebas Neue', sans-serif; }
                .barlow-cond { font-family: 'Barlow Condensed', sans-serif; }
                .animate-up { animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
                @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                .blur-card { background: rgba(12, 14, 19, 0.4); border: 1px solid rgba(255, 255, 255, 0.04); backdrop-filter: blur(20px); transition: all 0.3s ease; }
            ` }} />

            {/* ── TWO COLUMN LAYOUT ── */}
            <div className="flex flex-col lg:flex-row min-h-screen">
                
                {/* ── LEFT COLUMN (HERO & ANIMATION) ── */}
                <div className="w-full lg:w-[45%] relative border-r border-white/5 overflow-hidden min-h-[400px] lg:min-h-screen">
                    <SignupLeftAnimation type="merchant" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black z-10" />
                    
                    <div className="relative z-20 h-full flex flex-col justify-between p-10 lg:p-20">
                        <Logo size="lg" />
                        
                        <div className="animate-up">
                            <div className="inline-flex items-center gap-2 bg-[#e8a230]/10 border border-[#e8a230]/20 rounded-md px-3 py-1 mb-6">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#e8a230]" />
                                <span className="barlow-cond font-black text-[10px] uppercase tracking-[0.2em] text-[#e8a230]">PARTNER PROTOCOL</span>
                            </div>
                            <h1 className="bebas italic text-[70px] lg:text-[120px] leading-[0.85] tracking-tight uppercase mb-8">
                                PARTNER<br /><span className="text-[#e8a230]">SIGNUP.</span>
                            </h1>
                            <div className="grid gap-6 max-w-md">
                                {[
                                    { title: "Fair Play", desc: "Keep 100% of your tips + higher base rates.", icon: <Zap className="w-5 h-5 text-[#e8a230]" /> },
                                    { title: "Flex Hours", desc: "You are your own operational boss. Work when you want.", icon: <TrendingUp className="w-5 h-5 text-[#e8a230]" /> },
                                    { title: "Local Impact", desc: "Support independent restaurants in your own backyard.", icon: <ShieldCheck className="w-5 h-5 text-[#e8a230]" /> }
                                ].map((card) => (
                                    <div key={card.title} className="blur-card p-5 rounded-2xl flex items-center gap-5 hover:border-[#e8a230]/30 transition-all border-l-2 border-l-[#e8a230]">
                                        <div className="w-10 h-10 bg-black/40 flex items-center justify-center rounded-xl shrink-0">{card.icon}</div>
                                        <div>
                                            <h3 className="bebas text-xl text-white uppercase">{card.title}</h3>
                                            <p className="barlow-cond text-[9px] font-black tracking-widest text-[#5A5550] uppercase mt-0.5">{card.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN (ENROLLMENT FORM) ── */}
                <div className="w-full lg:w-[55%] bg-[#050505] relative flex items-center justify-center p-8 lg:p-20">
                    <div className="max-w-[500px] w-full animate-up [animation-delay:0.2s]">
                        <div className="mb-14">
                            <h2 className="bebas italic text-[44px] lg:text-[56px] leading-[0.95] uppercase mb-3">START YOUR <span className="text-[#e8a230]">PARTNERSHIP.</span></h2>
                            <p className="barlow-cond font-black text-[10px] uppercase tracking-[0.3em] text-[#5A5550]">ESTABLISH YOUR DIGITAL STOREFRONT IN MINUTES</p>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="barlow-cond text-[10px] font-black uppercase tracking-[0.2em] text-[#5A5550] ml-1">BUSINESS NAME *</label>
                                    <input type="text" className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl px-6 py-4 text-sm font-dm-sans outline-none focus:border-[#e8a230] transition-all" placeholder="BRAND NAME" />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="barlow-cond text-[10px] font-black uppercase tracking-[0.2em] text-[#5A5550] ml-1">LOCATION SERVICE</label>
                                    <input type="text" className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl px-6 py-4 text-sm font-dm-sans outline-none focus:border-[#e8a230] transition-all" placeholder="CITY / SECTOR" />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="barlow-cond text-[10px] font-black uppercase tracking-[0.2em] text-[#5A5550] ml-1">CONTACT EMAIL *</label>
                                <input type="email" className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl px-6 py-4 text-sm font-dm-sans outline-none focus:border-[#e8a230] transition-all" placeholder="PARTNER@EMAIL.COM" />
                            </div>

                            <div className="space-y-2.5 mb-8">
                                <label className="barlow-cond text-[10px] font-black uppercase tracking-[0.2em] text-[#5A5550] ml-1">SECURITY KEY</label>
                                <input type="password" className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl px-6 py-4 text-sm font-dm-sans outline-none focus:border-[#e8a230] transition-all" placeholder="••••••••" />
                            </div>

                            <button className="w-full bg-[#e8a230] text-black bebas italic text-3xl py-6 rounded-xl shadow-[0_20px_40px_rgba(232,162,48,0.25)] hover:scale-[1.02] active:scale-95 transition-all uppercase">BUILD STOREFRONT →</button>
                            
                            <div className="text-center pt-8">
                                <Link href="/merchant/login" className="barlow-cond font-black text-[11px] uppercase tracking-[0.25em] text-[#2a2f3a] hover:text-white transition-colors">ALREADY A PARTNER? LOGIN HUB</Link>
                            </div>
                        </div>
                    </div>
                    
                    {/* MOBILE NAV OVERLAY */}
                    <nav className="fixed lg:hidden bottom-0 left-0 w-full bg-[#080808]/95 backdrop-blur-2xl border-t border-white/5 flex justify-around py-4 z-50">
                        {['HOME', 'EXPLORE', 'ORDERS', 'PROFILE'].map(l => (
                             <div key={l} className="flex flex-col items-center opacity-30">
                                <div className="w-6 h-6 bg-white/10 rounded-full mb-1" />
                                <span className="barlow-cond text-[9px] font-black tracking-widest uppercase">{l}</span>
                             </div>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default function MerchantSignupPage() {
    return <MerchantSignupContent />;
}
