"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

function DriverSignupContent() {
    const [step, setStep] = useState(1);
    const [vehicle, setVehicle] = useState("car");

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
                    src="/driver_signup_bg_v3_1775197461975.png" 
                    alt="" 
                    className="w-full h-full object-cover grayscale opacity-[0.15] brightness-[0.4] filter contrast(1.1)"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
            </div>

            {/* ── HEADER ── */}
            <header className="relative z-50 flex items-center justify-between px-10 py-8 max-w-[1400px] mx-auto">
                <Logo size="md" />
                <div className="flex gap-8 items-center">
                    <Link href="/driver/login" className="barlow-cond font-black text-[11px] uppercase tracking-[0.25em] text-[#5A5550] hover:text-[#e8a230] transition-colors">Fleet Authorization</Link>
                </div>
            </header>

            <main className="relative z-10 flex flex-col items-center pt-10 pb-40 px-6 max-w-7xl mx-auto">
                
                {/* ── HERO SECTION ── */}
                <div className="text-center space-y-3 mb-20 animate-up">
                    <h1 className="bebas italic text-[80px] lg:text-[124px] leading-[0.88] tracking-tight">
                        FLEET<span className="text-[#e8a230]">PROTOCOLS.</span>
                    </h1>
                    <p className="barlow-cond font-black text-[12px] lg:text-[14px] uppercase tracking-[0.45em] text-[#5A5550]">
                        ESTABLISH YOUR MOBILE LOGISTICS HUB
                    </p>
                </div>

                {/* ── THREE MAIN PILLARS ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-[1100px] mb-8 animate-up [animation-delay:0.1s]">
                    {[
                        { title: "FAIR PAY", desc: "Competitive base pay + tips deposited weekly into your hub.", icon: "💰" },
                        { title: "FLEX HOURS", desc: "Drive when you want — you are your own operational boss.", icon: "🕒" },
                        { title: "LOCAL PRIDE", desc: "Deliver for the best neighborhood restaurants in your city.", icon: "📍" }
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

                {/* ── PLATFORM FEATURES GRID ── */}
                <div className="w-full max-w-[1000px] mb-32 animate-up [animation-delay:0.2s]">
                    <div className="flex items-center gap-6 mb-6 justify-center">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#e8a230]/20" />
                        <span className="barlow-cond font-black text-[11px] uppercase tracking-[0.4em] text-[#e8a230] opacity-50">OPERATIONAL REQUIREMENTS</span>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#e8a230]/20" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: "IDENTIFICATION", desc: "18+ years old with valid driver's license.", icon: "🪪" },
                            { label: "FLEET ASSETS", desc: "Reliable vehicle or bike with active insurance.", icon: "🏎️" },
                            { label: "MOBILE HUB", desc: "Smartphone with active data and GPS uplink.", icon: "📱" },
                            { label: "BACKGROUND", desc: "Secure vetting and background verification protocols.", icon: "🛡️" }
                        ].map((item) => (
                            <div key={item.label} className="blur-card p-6 flex items-center gap-6 rounded-2xl border-l-2 border-l-[#e8a230]/30 shadow-2xl">
                                <div className="w-12 h-12 flex items-center justify-center bg-[#0d0d0d] border border-white/5 rounded-xl text-xl grayscale opacity-30">{item.icon}</div>
                                <div className="flex flex-col">
                                    <span className="bebas text-[22px] tracking-wider text-white/90">{item.label}</span>
                                    <span className="barlow-cond text-[10px] font-black text-[#444] uppercase tracking-widest italic">{item.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── CORE ENROLLMENT FORM ── */}
                <div className="w-full max-w-[620px] bg-[#050505]/60 border border-white/5 rounded-[3rem] p-12 lg:p-20 backdrop-blur-[50px] animate-up [animation-delay:0.3s] shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
                    <div className="text-center space-y-3 mb-16">
                        <h2 className="bebas italic text-5xl lg:text-7xl tracking-wide uppercase leading-tight">START YOUR <span className="text-[#e8a230]">APPLICATION.</span></h2>
                        <p className="barlow-cond font-black text-[11px] uppercase tracking-[0.35em] text-[#5A5550]">5 MINUTES · APPROVAL WITHIN 24 HOURS</p>
                    </div>

                    {/* Multi-Step Timeline */}
                    <div className="flex items-center justify-between relative px-6 mb-20">
                        <div className="absolute top-[14px] left-14 right-14 h-[1px] bg-[#1c1f28]" />
                        {[
                            { id: 1, label: "COMMUNICATION" },
                            { id: 2, label: "VEHICLE" },
                            { id: 3, label: "DOCS" },
                            { id: 4, label: "FINAL" }
                        ].map((s) => (
                            <div key={s.id} className="relative z-10 flex flex-col items-center gap-4">
                                <div className={`w-[30px] h-[30px] flex items-center justify-center text-[10px] font-black font-mono transition-all duration-700 rounded-full ${step >= s.id ? 'bg-[#e8a230] text-black shadow-[0_0_25px_rgba(232,162,48,0.5)]' : 'bg-[#0a0a0a] border border-[#1c1f28] text-[#1c1f28]'}`}>
                                    {s.id}
                                </div>
                                <span className={`barlow-cond text-[10px] font-black uppercase tracking-[0.18em] ${step === s.id ? 'text-[#e8a230]' : 'text-[#2a2f3a]'}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6 pt-4">
                        <div className="mb-10 text-left">
                            <h3 className="bebas italic text-[32px] tracking-wider text-white">PERSONAL INFORMATION</h3>
                            <div className="h-[2px] w-14 bg-[#e8a230] mt-2" />
                        </div>

                        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); setStep(prev => Math.min(prev + 1, 4)); }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="barlow-cond text-[11px] font-black uppercase tracking-[0.25em] text-[#e8a230]">FIRST NAME *</label>
                                    <input type="text" className="fi w-full bg-[#030303] border border-white/10 text-[15px] px-7 py-5 text-white outline-none transition-all rounded-2xl" placeholder="ALEX" required />
                                </div>
                                <div className="space-y-3">
                                    <label className="barlow-cond text-[11px] font-black uppercase tracking-[0.25em] text-[#e8a230]">LAST NAME *</label>
                                    <input type="text" className="fi w-full bg-[#030303] border border-white/10 text-[15px] px-7 py-5 text-white outline-none transition-all rounded-2xl" placeholder="JOHNSON" required />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="barlow-cond text-[11px] font-black uppercase tracking-[0.25em] text-[#5A5550]">EMAIL ADDRESS *</label>
                                    <input type="email" className="fi w-full bg-[#030303] border border-white/10 text-[15px] px-7 py-5 text-white outline-none transition-all rounded-2xl" placeholder="YOU@EMAIL.COM" required />
                                </div>
                                <div className="space-y-3">
                                    <label className="barlow-cond text-[11px] font-black uppercase tracking-[0.25em] text-[#5A5550]">PHONE NUMBER *</label>
                                    <input type="tel" className="fi w-full bg-[#030303] border border-white/10 text-[15px] px-7 py-5 text-white outline-none transition-all rounded-2xl" placeholder="(336) 000-0000" required />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <label className="barlow-cond text-[11px] font-black uppercase tracking-[0.25em] text-[#e8a230] ml-1 block">VEHICLE TYPE *</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['car', 'bicycle', 'scooter'].map((type) => (
                                        <button 
                                            key={type}
                                            type="button" 
                                            onClick={() => setVehicle(type)}
                                            className={`flex flex-col items-center justify-center p-6 border transition-all gap-4 rounded-[2rem] ${vehicle === type ? 'bg-[#1a1200] border-[#e8a230] text-[#e8a230] shadow-[0_0_25px_rgba(232,162,48,0.25)] scale-[1.02]' : 'bg-[#030303] border-white/5 text-[#222] hover:border-white/10'}`}
                                        >
                                            <div className={`text-4xl transition-transform duration-300 ${vehicle === type ? 'scale-110 opacity-100' : 'opacity-20 grayscale'}`}>
                                                {type === 'car' ? '🏎️' : type === 'bicycle' ? '🚲' : '🛵'}
                                            </div>
                                            <span className="bebas text-lg tracking-wider font-bold">{type}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-[#e8a230] hover:scale-[1.02] active:scale-[0.98] text-black bebas italic text-[26px] tracking-wider py-6 rounded-2xl transition-all shadow-[0_30px_60px_rgba(232,162,48,0.25)] mt-6">
                                CONTINUE APPLICATION →
                            </button>
                        </form>

                        <div className="text-center pt-12">
                            <p className="barlow-cond text-[12px] font-black text-[#2a2f3a] uppercase tracking-[0.2em]">
                                ALREADY A DRIVER? <Link href="/driver/login" className="text-[#e8a230] hover:text-white transition-colors ml-3 border-b border-white opacity-40 hover:opacity-100">LOG IN HERE</Link>
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

export default function DriverSignupPage() {
    return <DriverSignupContent />;
}
