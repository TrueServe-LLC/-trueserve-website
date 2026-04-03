"use client";

import { Suspense } from "react";
import Link from "next/link";
import DriverLoginForm from "./DriverLoginForm";
import Logo from "@/components/Logo";

export default function DriverLoginPage() {
    return (
        <div className="selection:bg-[#3dd68c]/30 min-h-screen bg-[#0c0e13]">
            {/* ── MOBILE APP VIEW ── */}
            <div className="lg:hidden flex flex-col min-h-screen">
                <div className="auth-hero d">
                    <div className="auth-ring bg-[#3dd68c] flex items-center justify-center">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="5.5" cy="16.5" r="3" stroke="#000" strokeWidth="1.8"/><circle cx="16.5" cy="16.5" r="3" stroke="#000" strokeWidth="1.8"/><path d="M2.5 16.5V10l4-6h8l4 6v6.5" stroke="#000" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    </div>
                    <div className="auth-badge d"><span className="auth-badge-txt">Fleet Program</span></div>
                    <div className="auth-title">Welcome Back, <span className="text-[#3dd68c]">Driver.</span></div>
                    <div className="auth-sub">Your mission hub is ready</div>
                </div>
                <div className="auth-body">
                    <Suspense fallback={<div className="text-center text-[#5A5550] text-[10px] font-bold uppercase tracking-widest animate-pulse p-12">Uplinking Terminal...</div>}>
                        <DriverLoginForm />
                    </Suspense>
                    <div className="auth-link"><Link href="/">← Back to home</Link></div>
                </div>
            </div>

            {/* ── DESKTOP VIEW ── */}
            <div className="hidden lg:grid grid-cols-[1.1fr_0.9fr] min-h-screen">
                <div className="relative min-h-screen flex flex-col justify-end p-[60px_50px] overflow-hidden bg-[#070707]">
                    <img src="/driver_login_background_v2.png" alt="Driving Background" className="absolute inset-0 z-0 w-full h-full object-cover grayscale opacity-25 contrast-[1.2] brightness-75" />
                    <div className="absolute inset-0 bg-gradient-to-bottom from-[rgba(10,10,10,0.4)] via-[rgba(10,10,10,0.2)] to-[rgba(10,10,10,0.95)] z-[1]" />
                    
                    <div className="absolute top-[40px] left-[50px] flex items-center gap-3 z-[4]">
                        <Logo size="lg" />
                    </div>

                    <div className="relative z-[3] animate-up w-full max-w-[480px]">
                        <div className="inline-flex items-center gap-2 bg-[rgba(232,160,32,0.1)] border border-[rgba(232,160,32,0.2)] p-[6px_16px] mb-[25px] rounded-md">
                            <span className="w-[7px] h-[7px] bg-[#E8A020] rounded-full shadow-[0_0_10px_#E8A020]" />
                            <span className="font-barlow-cond text-[11px] font-bold tracking-[0.18em] uppercase text-[#E8A020]">SECURE FLEET UPLINK</span>
                        </div>

                        <div className="font-bebas text-[105px] italic uppercase leading-[0.88] mb-[30px] tracking-[-0.01em]">
                            <span className="text-[#F0EDE8] block">READY TO</span>
                            <span className="text-[#E8A020] block">EARN?</span>
                        </div>

                        <div className="text-[15px] font-light text-[#5A5550] line-height-[1.6] max-w-[360px] mb-[45px]">Connect with the TrueServe platform and start accepting high-yield delivery routes in your area today.</div>

                        <div className="flex flex-col gap-3 w-full">
                            <div className="flex items-center gap-[18px] p-[18px_20px] bg-[rgba(19,19,19,0.7)] border border-[rgba(255,255,255,0.04)] rounded-md">
                                <div className="w-[44px] h-[32px] bg-[#1C1C1C] rounded-md flex items-center justify-center shrink-0">🚗</div>
                                <div>
                                    <div className="font-barlow-cond text-[15px] font-bold text-[#F0EDE8] mb-[2px] uppercase tracking-[0.04em]">Daily Liquidity Settlements</div>
                                    <div className="text-[12px] text-[#5A5550] font-normal">Drive today, get paid today. Transparent splits.</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-[18px] p-[18px_20px] bg-[rgba(19,19,19,0.7)] border border-[rgba(255,255,255,0.04)] rounded-md">
                                <div className="w-[44px] h-[32px] bg-[#1C1C1C] rounded-md flex items-center justify-center shrink-0">🛰️</div>
                                <div>
                                    <div className="font-barlow-cond text-[15px] font-bold text-[#F0EDE8] mb-[2px] uppercase tracking-[0.04em]">Optimized Strategic Routing</div>
                                    <div className="text-[12px] text-[#5A5550] font-normal">Smart dispatching to maximize fuel and time.</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-[18px] p-[18px_20px] bg-[rgba(19,19,19,0.7)] border border-[rgba(255,255,255,0.04)] rounded-md">
                                <div className="w-[44px] h-[32px] bg-[#1C1C1C] rounded-md flex items-center justify-center shrink-0">🛡️</div>
                                <div>
                                    <div className="font-barlow-cond text-[15px] font-bold text-[#F0EDE8] mb-[2px] uppercase tracking-[0.04em]">Priority Fleet Support</div>
                                    <div className="text-[12px] text-[#5A5550] font-normal">Continuous assistance for every mile of your mission.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#0A0A0A] flex flex-col items-center justify-center p-[60px] relative">
                    <div className="w-full max-w-[420px] animate-fade-in">
                        <div className="font-barlow-cond text-[42px] font-extrabold italic text-[#F0EDE8] mb-2 uppercase tracking-[-0.01em]">Fleet Authorization</div>
                        <div className="font-barlow-cond text-[11px] font-bold tracking-[0.22em] uppercase text-[#E8A020] mb-[45px] opacity-90">SECURE UPLINK TERMINAL</div>

                        <Suspense fallback={<div className="text-center text-[#5A5550] text-[10px] font-bold uppercase tracking-widest animate-pulse p-12">Uplinking Terminal...</div>}>
                            <DriverLoginForm />
                        </Suspense>

                        <div className="mt-[45px] flex items-center justify-center gap-2 text-[#222] font-semibold text-[10px] uppercase tracking-[0.2em] opacity-40">
                            <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><rect x="1" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M3 5V3.5a2 2 0 014 0V5" stroke="currentColor" strokeWidth="1.2"/></svg>
                            ENCRYPTED CONNECTION · SECURE UPLINK
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
