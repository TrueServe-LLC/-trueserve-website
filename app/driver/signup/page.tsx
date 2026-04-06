"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";

export default function DriverSignupPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const signInWithProvider = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
                prompt: 'select_account',
            }
        }
    });

    if (error) {
        alert(`Authentication Failure: ${error.message}`);
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0e13] text-[#F0EDE8] selection:bg-[#e8a230]/30 overflow-x-hidden font-barlow-cond">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
            {/* BRAND SIDE */}
            <div className="relative overflow-hidden hidden lg:flex flex-col justify-end p-20 border-r border-white/5 bg-[#06080b]">
                <div 
                    className="absolute inset-0 z-0 opacity-40 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-1000"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80')" }}
                ></div>
                <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-t from-[#0c0e13] via-[#0c0e13]/60 to-transparent"></div>
                
                <div className="relative z-10 space-y-12">
                    <div className="px-6 py-2 bg-black/60 border border-white/10 rounded-full w-fit backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#e8a230] animate-pulse shadow-[0_0_10px_rgba(232,162,48,0.5)]"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e8a230] italic">Fleet Open Enrollment</span>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h1 className="text-8xl font-bebas italic text-white uppercase leading-[0.9] tracking-tighter">
                            Partner <br /><span className="text-[#e8a230]">Application.</span>
                        </h1>
                        <p className="text-slate-500 font-semibold uppercase tracking-[0.4em] text-[11px] italic">// Regional Logistics Expansion 2024</p>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="flex items-center gap-6 group">
                            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-xl group-hover:bg-[#e8a230]/10 group-hover:border-[#e8a230]/30 transition-all">💵</div>
                            <div className="space-y-1">
                                <h4 className="text-lg font-bebas italic uppercase tracking-wider text-white">Elite Yield</h4>
                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 italic">Industry-leading payout structures</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 group">
                            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-xl group-hover:bg-[#e8a230]/10 group-hover:border-[#e8a230]/30 transition-all">📍</div>
                            <div className="space-y-1">
                                <h4 className="text-lg font-bebas italic uppercase tracking-wider text-white">Grid Optimized</h4>
                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 italic">Advanced AI-driven dispatch cycles</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 group">
                            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-xl group-hover:bg-[#e8a230]/10 group-hover:border-[#e8a230]/30 transition-all">⚡️</div>
                            <div className="space-y-1">
                                <h4 className="text-lg font-bebas italic uppercase tracking-wider text-white">Instant Settlement</h4>
                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 italic">Verify and withdraw earnings same-day</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scanline Texture Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
            </div>

            {/* FORM SIDE */}
            <div className="relative flex items-center justify-center p-8 bg-[#0c0e13]">
                <div className="absolute top-12 left-12 lg:hidden">
                    <Logo size="sm" />
                </div>
                <Link href="/driver/login" className="absolute top-12 right-12 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#e8a230] transition-colors italic">Login Terminal →</Link>
                
                <div className="w-full max-w-md space-y-12 animate-fade-in-up">
                    <div className="space-y-1">
                        <h2 className="text-4xl font-bebas italic text-white uppercase tracking-wider">Join The Fleet</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Approval Lifecycle: ~24 Hours</p>
                    </div>

                    <div className="space-y-10">
                        {/* Progress Tracker */}
                        <div className="pb-4 border-b border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e8a230] italic">
                                {step === 1 ? "Module 01: Identity" : step === 2 ? "Module 02: Logistics" : "Module 03: Manifest"}
                            </span>
                            <div className="flex gap-1">
                                <div className={`w-8 h-1 rounded-full ${step >= 1 ? 'bg-[#e8a230]' : 'bg-white/5'}`}></div>
                                <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-[#e8a230]' : 'bg-white/5'}`}></div>
                                <div className={`w-8 h-1 rounded-full ${step >= 3 ? 'bg-[#e8a230]' : 'bg-white/5'}`}></div>
                            </div>
                        </div>

                        {step === 1 && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl flex flex-col items-center">
                                     <p className="text-[9px] uppercase font-black tracking-widest text-slate-600 mb-6 italic group-hover:text-white transition-colors relative z-10">// Faster Synchronization</p>
                                     <button onClick={() => signInWithProvider('google')} className="w-full bg-white/[0.03] border border-white/10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/[0.08] transition-all flex items-center justify-center gap-3 italic">
                                         <span className="text-[#e8a230]">G</span> Sync With Google
                                     </button>
                                     <div className="flex items-center gap-3 w-full my-6 opacity-20"><div className="flex-1 h-px bg-white"></div><span className="text-[8px] font-black uppercase tracking-widest">OR</span><div className="flex-1 h-px bg-white"></div></div>
                                </div>
                                
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 italic ml-2">First Name</label>
                                            <input type="text" placeholder="ALEX" className="su-input w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 px-6 text-white font-bold tracking-widest outline-none focus:border-[#e8a230]/30 transition-all placeholder:text-slate-800 text-sm" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 italic ml-2">Last Name</label>
                                            <input type="text" placeholder="SMITH" className="su-input w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 px-6 text-white font-bold tracking-widest outline-none focus:border-[#e8a230]/30 transition-all placeholder:text-slate-800 text-sm" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 italic ml-2">Email Terminal</label>
                                        <input type="email" placeholder="ALEX@FLEET.COM" className="su-input w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 px-6 text-white font-bold tracking-widest outline-none focus:border-[#e8a230]/30 transition-all placeholder:text-slate-800 text-sm" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 italic ml-2">Mobile Interface</label>
                                        <input type="tel" placeholder="+1 (555) 000-0000" className="su-input w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 px-6 text-white font-bold tracking-widest outline-none focus:border-[#e8a230]/30 transition-all placeholder:text-slate-800 text-sm" />
                                    </div>
                                </div>
                                <button onClick={() => setStep(2)} className="w-full bg-[#e8a230] text-black font-black uppercase tracking-[0.3em] py-5 rounded-2xl text-[11px] transition-all hover:scale-[1.02] active:scale-95 shadow-glow shadow-[#e8a230]/20 italic">
                                    Next: Logistics Asset →
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 italic ml-2">What is your mobility asset?</label>
                                        <select className="su-input w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 px-6 text-white font-bold tracking-widest outline-none focus:border-[#e8a230]/30 transition-all uppercase text-xs appearance-none">
                                            <option className="bg-[#0c0e13]">Standard Vehicle (4-Wheels)</option>
                                            <option className="bg-[#0c0e13]">Bicycle (Human Powered)</option>
                                            <option className="bg-[#0c0e13]">Electric / Commuter Scooter</option>
                                            <option className="bg-[#0c0e13]">Motorcycle (Internal Combustion)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 italic ml-2">Primary Logistics Sector</label>
                                        <input type="text" placeholder="E.G. CHARLOTTE, NC" className="su-input w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 px-6 text-white font-bold tracking-widest outline-none focus:border-[#e8a230]/30 transition-all placeholder:text-slate-800 text-sm" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 italic ml-2">Fleet Referral Code (Optional)</label>
                                        <input type="text" placeholder="XXXXXX" className="su-input w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 px-6 text-white font-bold tracking-widest outline-none focus:border-[#e8a230]/30 transition-all placeholder:text-slate-800 text-sm" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4">
                                     <button onClick={() => setStep(3)} className="w-full bg-[#e8a230] text-black font-black uppercase tracking-[0.3em] py-5 rounded-2xl text-[11px] transition-all hover:scale-[1.02] shadow-glow shadow-[#e8a230]/20 italic">
                                        Submit Manifest →
                                     </button>
                                     <button onClick={() => setStep(1)} className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:text-white transition-colors italic">
                                        ← Recalibrate Identity
                                     </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-10 animate-fade-in text-center">
                                 <div className="w-24 h-24 bg-[#e8a230]/10 border border-[#e8a230]/20 rounded-full flex items-center justify-center text-4xl mx-auto shadow-[0_0_50px_rgba(232,162,48,0.1)]">🚚</div>
                                 <div className="space-y-4">
                                     <h3 className="text-3xl font-bebas italic text-white uppercase tracking-wider">Manifest Recorded!</h3>
                                     <p className="text-xs text-slate-500 font-medium leading-relaxed italic opacity-80">
                                         Application synchronizing with regional headquarters. You will receive a secure mission code via SMS within the next 24-hour cycle.
                                     </p>
                                 </div>
                                 <button onClick={() => router.push('/')} className="w-full bg-white/[0.03] border border-white/10 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl text-[10px] transition-all hover:bg-white/10 italic">
                                     Return to Sector Alpha →
                                 </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

