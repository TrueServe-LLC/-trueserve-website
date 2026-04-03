"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import Link from "next/link";
import { Activity, Clock, MapPin, ShieldCheck } from "lucide-react";
import SignupLeftAnimation from "@/components/SignupLeftAnimation";
import DriverLoginForm from "./DriverLoginForm";

function DriverLoginPageContent() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

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
                                <span className="barlow-cond font-black text-[10px] uppercase tracking-[0.2em] text-[#3dd68c]">FLEET UPLINK</span>
                            </div>
                            <h1 className="bebas italic text-[70px] lg:text-[120px] leading-[0.85] tracking-tight uppercase mb-8">
                                READY TO<br /><span className="text-[#3dd68c]">EARN?</span>
                            </h1>
                            <div className="grid gap-6 max-w-md">
                                {[
                                    { title: "Daily Liquidity", desc: "Drive today, get paid today. Transparent splits.", icon: <Activity className="w-5 h-5 text-[#3dd68c]" /> },
                                    { title: "Mission Control", desc: "You control your shifts and routing tech.", icon: <Clock className="w-5 h-5 text-[#3dd68c]" /> },
                                    { title: "Priority Support", desc: "24/7 assistance for every mile of your mission.", icon: <ShieldCheck className="w-5 h-5 text-[#3dd68c]" /> }
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

                {/* ── RIGHT COLUMN (LOGIN FORM) ── */}
                <div className="w-full lg:w-[55%] bg-[#050505] relative flex items-center justify-center p-8 lg:p-20">
                    <div className="max-w-[500px] w-full animate-up [animation-delay:0.2s]">
                        <div className="mb-14">
                            <h2 className="bebas italic text-[44px] lg:text-[56px] leading-[0.95] uppercase mb-3 text-white">FLEET <span className="text-[#3dd68c]">LOGIN.</span></h2>
                            <p className="barlow-cond font-black text-[10px] uppercase tracking-[0.3em] text-[#5A5550]">SECURE TERMINAL FOR MISSION HUB</p>
                        </div>
                        
                        <Suspense fallback={<div className="text-center text-[#5A5550] text-[10px] font-bold uppercase tracking-widest animate-pulse p-12">Uplinking Terminal...</div>}>
                            <DriverLoginForm />
                        </Suspense>

                        <div className="text-center pt-8">
                            <Link href="/driver/apply" className="barlow-cond font-black text-[11px] uppercase tracking-[0.25em] text-[#2a2f3a] hover:text-white transition-colors">NEW TO FLEET? ENROLL NOW</Link>
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

export default function DriverLoginPage() {
    return (
        <Suspense fallback={null}>
            <DriverLoginPageContent />
        </Suspense>
    );
}
