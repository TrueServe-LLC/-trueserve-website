"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import SignupLeftAnimation from "@/components/SignupLeftAnimation";
import { useRouter } from "next/navigation";

export default function DriverSignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [vehicle, setVehicle] = useState("car");

    return (
        <div className="min-h-screen bg-[#0c0e13] text-white font-sans selection:bg-[#e8a230]/30 selection:text-black overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&family=Barlow+Condensed:ital,wght@0,700;0,800;1,700;1,800&family=Bebas+Neue&display=swap');
                
                .fi::placeholder { color: #2a2f3a; }
                .fi:focus { border-color: #e8a230; background: #131720; }
                
                @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                .animate-up { animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }

                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                }
            ` }} />

            <div className="flex flex-col lg:grid lg:grid-cols-2 min-h-screen">
                {/* ── LEFT PANEL ── */}
                <div className="relative overflow-hidden hidden lg:flex flex-col justify-end p-[52px] min-h-screen border-r border-[#1c1f28]">
                    <div className="absolute inset-0 z-0">
                        <img 
                            src="/driver_login_background_v2.png" 
                            alt="Fleet Background" 
                            className="w-full h-full object-cover grayscale opacity-[0.15] brightness-[0.7]"
                        />
                    </div>
                    <SignupLeftAnimation type="driver" />
                    <div className="absolute inset-0 z-1 bg-gradient-to-t from-[#080a10] via-transparent to-[#080a10]/80 opacity-95" />
                    
                    <div className="absolute top-[48px] left-[52px] z-10 flex items-center gap-3">
                        <Logo size="md" />
                    </div>

                    <div className="relative z-10 max-w-lg space-y-4 animate-up text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#140e00]/80 border border-[#3a2800] backdrop-blur-md">
                            <span className="s-badge-dot w-1.5 h-1.5 bg-[#e8a230] rounded-full shadow-[0_0_10px_#e8a230]"></span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#e8a230]">Fleet Protocols</span>
                        </div>

                        <h1 className="font-bebas italic text-[72px] lg:text-[84px] font-[800] leading-[0.92] text-white uppercase drop-shadow-[0_2px_24px_rgba(0,0,0,0.85)]">
                            Fleet <br />
                            <span className="text-[#e8a230]">Protocols.</span>
                        </h1>

                        <p className="text-[13px] text-[#fff]/55 leading-[1.65] max-w-[360px] drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)]">
                            Your city, your schedule, your earnings. Join the TrueServe fleet and start making money delivering for local restaurants today.
                        </p>

                        <div className="space-y-[4px] pt-4 w-full">
                            {[
                                { name: "Fair Pay", desc: "Competitive base pay + tips deposited weekly.", icon: "💰" },
                                { name: "Flex Hours", desc: "Drive when you want — you are your own boss.", icon: "🕒" },
                                { name: "Local Pride", desc: "Deliver for the best neighborhood restaurants.", icon: "📍" }
                            ].map((item) => (
                                <div key={item.name} className="flex items-center gap-4 p-[12px] bg-[#080a10]/72 border border-white/7 backdrop-blur-md w-full max-w-[440px]">
                                    <div className="w-8 h-8 flex items-center justify-center bg-[#e8a230]/14 border border-[#e8a230]/24 text-sm">{item.icon}</div>
                                    <div className="flex flex-col">
                                        <span className="text-[12px] font-bold text-[#e6e6e6]">{item.name}</span>
                                        <span className="text-[10px] text-white/35">{item.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-1 pt-2 w-full max-w-[440px]">
                            {[
                                { label: "18+ years old" },
                                { label: "Driver's license" },
                                { label: "Vehicle or bike" },
                                { label: "Smartphone" }
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-2 px-3 py-2 bg-[#080a10]/72 border border-white/5 backdrop-blur-md">
                                    <div className="w-4 h-4 flex items-center justify-center bg-[#e8a230]/14 border border-[#e8a230]/28 text-[#e8a230] text-[8px] font-bold">✓</div>
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="bg-[#0c0e13] flex flex-col items-center justify-start py-12 px-8 lg:px-[60px] overflow-y-auto min-h-screen">
                    <div className="w-full max-w-[440px] space-y-10">
                        <div className="space-y-1 text-left">
                            <h2 className="font-bebas italic text-[34px] font-[800] text-white uppercase tracking-tight">Start Your <span className="text-[#e8a230]">Application.</span></h2>
                            <p className="text-[10px] font-bold text-[#444] uppercase tracking-[0.2em] ml-0.5">5 minutes · Approval within 24 hours</p>
                        </div>

                        {/* Steps UI */}
                        <div className="flex items-center justify-between relative px-2">
                           <div className="absolute top-[13px] left-10 right-10 h-px bg-[#1c1f28] z-0" />
                           {[
                             { id: 1, label: "You" },
                             { id: 2, label: "Vehicle" },
                             { id: 3, label: "Docs" },
                             { id: 4, label: "Approve" }
                           ].map((s) => (
                             <div key={s.id} className="relative z-10 flex flex-col items-center gap-1.5 min-w-[50px]">
                                <div className={`w-[26px] h-[26px] flex items-center justify-center text-[10px] font-bold font-mono transition-all duration-300 ${step >= s.id ? 'bg-[#e8a230] text-black shadow-[0_0_15px_rgba(232,162,48,0.3)]' : 'bg-[#131720] border border-[#2a2f3a] text-[#2a2f3a]'}`}>
                                    {s.id}
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-[0.1em] ${step === s.id ? 'text-[#e8a230]' : 'text-[#2a2f3a]'}`}>
                                    {s.label}
                                </span>
                             </div>
                           ))}
                        </div>

                        <div className="space-y-4">
                            <div className="border-b border-[#1c1f28] pb-1.5 mb-6">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#e8a230]">Personal Information</span>
                            </div>

                            <form className="space-y-3.5" onSubmit={(e) => { e.preventDefault(); setStep(prev => Math.min(prev + 1, 4)); }}>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#555] ml-0.5">First Name *</label>
                                        <input type="text" className="fi w-full bg-[#0f1219] border border-[#2a2f3a] text-[13px] px-3.5 py-3 text-white outline-none transition-all rounded-none" placeholder="Alex" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#555] ml-0.5">Last Name *</label>
                                        <input type="text" className="fi w-full bg-[#0f1219] border border-[#2a2f3a] text-[13px] px-3.5 py-3 text-white outline-none transition-all rounded-none" placeholder="Johnson" required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#555] ml-0.5">Email Address *</label>
                                        <input type="email" className="fi w-full bg-[#0f1219] border border-[#2a2f3a] text-[13px] px-3.5 py-3 text-white outline-none transition-all rounded-none" placeholder="you@email.com" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#555] ml-0.5">Phone Number *</label>
                                        <input type="tel" className="fi w-full bg-[#0f1219] border border-[#2a2f3a] text-[13px] px-3.5 py-3 text-white outline-none transition-all rounded-none" placeholder="(336) 000-0000" required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#555] ml-0.5">Date of Birth *</label>
                                        <input type="date" className="fi w-full bg-[#0f1219] border border-[#2a2f3a] text-[13px] px-3.5 py-3 text-white outline-none transition-all rounded-none" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#555] ml-0.5">Zip Code *</label>
                                        <input type="text" maxLength={5} className="fi w-full bg-[#0f1219] border border-[#2a2f3a] text-[13px] px-3.5 py-3 text-white outline-none transition-all rounded-none" placeholder="28306" required />
                                    </div>
                                </div>

                                <div className="space-y-3.5 pt-2">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#555] ml-0.5 block">Vehicle Type *</label>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {['car', 'bicycle', 'scooter'].map((type) => (
                                            <button 
                                                key={type}
                                                type="button" 
                                                onClick={() => setVehicle(type)}
                                                className={`flex flex-col items-center justify-center p-3 border transition-all gap-2 rounded-none ${vehicle === type ? 'bg-[#1a1200] border-[#e8a230] text-[#e8a230]' : 'bg-[#0f1219] border-[#2a2f3a] text-[#444] hover:border-[#444]'}`}
                                            >
                                                <div className={`text-xl transition-opacity ${vehicle === type ? 'opacity-100' : 'opacity-40'}`}>
                                                    {type === 'car' ? '🚗' : type === 'bicycle' ? '🚲' : '🛵'}
                                                </div>
                                                <span className="text-[9px] font-bold uppercase tracking-[0.1em]">{type}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-2">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#555] ml-0.5">Create Password *</label>
                                    <input type="password" className="fi w-full bg-[#0f1219] border border-[#2a2f3a] text-[13px] px-3.5 py-3 text-white outline-none transition-all rounded-none" placeholder="At least 8 characters" required />
                                </div>

                                <button type="submit" className="w-full bg-[#e8a230] hover:opacity-90 active:scale-[0.99] text-black font-bold uppercase tracking-[0.16em] text-[13px] py-[15px] transition-all mt-2">
                                    Continue →
                                </button>
                            </form>

                            <div className="text-center pt-2">
                                <p className="text-[11px] font-bold text-[#333]">
                                    Already a driver? <Link href="/driver/login" className="text-[#e8a230] hover:brightness-125 transition-colors ml-1 font-[600]">Login here</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
