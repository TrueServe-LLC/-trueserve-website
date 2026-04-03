"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { Activity, Clock, MapPin } from "lucide-react";
import SignupLeftAnimation from "@/components/SignupLeftAnimation";

function DriverSignupContent() {
    const [step, setStep] = useState(1);
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#000] text-white font-sans selection:bg-[#3dd68c]/30 selection:text-black overflow-x-hidden relative">
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
                    <SignupLeftAnimation type="driver" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black z-10" />
                    
                    <div className="relative z-20 h-full flex flex-col justify-between p-10 lg:p-20">
                        <Logo size="lg" />
                        
                        <div className="animate-up">
                            <div className="inline-flex items-center gap-2 bg-[#3dd68c]/10 border border-[#3dd68c]/20 rounded-md px-3 py-1 mb-6">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#3dd68c]" />
                                <span className="barlow-cond font-black text-[10px] uppercase tracking-[0.2em] text-[#3dd68c]">FLEET ENROLLMENT</span>
                            </div>
                            <h1 className="bebas italic text-[70px] lg:text-[120px] leading-[0.85] tracking-tight uppercase mb-8">
                                DRIVER<br /><span className="text-[#3dd68c]">SIGNUP.</span>
                            </h1>
                            <div className="grid gap-6 max-w-md">
                                {[
                                    { title: "Maximum Yield", desc: "Keep 100% of your tips + higher base rates.", icon: <Activity className="w-5 h-5 text-[#3dd68c]" /> },
                                    { title: "Flexible Grid", desc: "Work when you want. You are mission control.", icon: <Clock className="w-5 h-5 text-[#3dd68c]" /> },
                                    { title: "Elite Fleet", desc: "Access the most exclusive local delivery routes.", icon: <MapPin className="w-5 h-5 text-[#3dd68c]" /> }
                                ].map((card) => (
                                    <div key={card.title} className="blur-card p-5 rounded-2xl flex items-center gap-5 hover:border-[#3dd68c]/30 transition-all border-l-2 border-l-[#3dd68c]">
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
                            <h2 className="bebas italic text-[44px] lg:text-[56px] leading-[0.95] uppercase mb-3">START YOUR <span className="text-[#3dd68c]">APPLICATION.</span></h2>
                            <p className="barlow-cond font-black text-[10px] uppercase tracking-[0.3em] text-[#5A5550]">5 MINUTES · APPROVAL WITHIN 24 HOURS</p>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="barlow-cond text-[10px] font-black uppercase tracking-[0.2em] text-[#5A5550] ml-1">FIRST NAME *</label>
                                    <input type="text" className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl px-6 py-4 text-sm font-dm-sans outline-none focus:border-[#3dd68c] transition-all" placeholder="START MISSION" />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="barlow-cond text-[10px] font-black uppercase tracking-[0.2em] text-[#5A5550] ml-1">LAST NAME *</label>
                                    <input type="text" className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl px-6 py-4 text-sm font-dm-sans outline-none focus:border-[#3dd68c] transition-all" placeholder="COMMAND" />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="barlow-cond text-[10px] font-black uppercase tracking-[0.2em] text-[#5A5550] ml-1">FLEET IDENTIFIER (EMAIL) *</label>
                                <input type="email" className="w-full bg-[#0d0d0d] border border-white/5 rounded-xl px-6 py-4 text-sm font-dm-sans outline-none focus:border-[#3dd68c] transition-all" placeholder="DRIVER@FLEET.COM" />
                            </div>

                            <button className="w-full bg-[#3dd68c] text-black bebas italic text-3xl py-6 rounded-xl shadow-[0_20px_40px_rgba(61,214,140,0.25)] hover:scale-[1.02] active:scale-95 transition-all uppercase">START APPLICATION →</button>
                            
                            <div className="text-center pt-8">
                                <Link href="/driver/login" className="barlow-cond font-black text-[11px] uppercase tracking-[0.25em] text-[#2a2f3a] hover:text-white transition-colors">ALREADY FLEET? MISSION HUB</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* MOBILE NAV OVERLAY */}
            <nav className="fixed lg:hidden bottom-0 left-0 w-full bg-[#080808]/95 backdrop-blur-2xl border-t border-white/5 flex justify-around py-4 z-50 shadow-[0_-20px_60px_rgba(0,0,0,0.8)]">
                {[
                   { label: 'HOME', icon: '🏠', link: '/' },
                   { label: 'EXPLORE', icon: '🔍', link: '/restaurants' },
                   { label: 'ORDERS', icon: '📋', link: '/orders' },
                   { label: 'PROFILE', icon: '👤', link: '/login' }
                ].map(item => (
                     <Link key={item.label} href={item.link} className="flex flex-col items-center opacity-30 hover:opacity-100 transition-all">
                        <span className="text-[20px]">{item.icon}</span>
                        <span className="barlow-cond text-[9px] font-black tracking-widest uppercase">{item.label}</span>
                     </Link>
                ))}
            </nav>
        </div>
    );
}

export default function DriverSignupPage() {
    return <DriverSignupContent />;
}
