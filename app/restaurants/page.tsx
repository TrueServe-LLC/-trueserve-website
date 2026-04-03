"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import LandingSearch from "@/components/LandingSearch";
import { Suspense } from "react";

function RestaurantFinderContent() {
    const searchParams = useSearchParams();
    const address = searchParams.get("address");

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#F0EDE8] font-barlow overflow-x-hidden">
            {/* AMBIENT ORBS */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="orb w-[260px] h-[260px] top-[-60px] right-[-80px] bg-[#E8A020]/10" />
                <div className="orb w-[200px] h-[200px] top-[480px] left-[-70px] bg-[#E8A020]/0.06" />
                <div className="orb w-[160px] h-[160px] bottom-[130px] right-[-50px] bg-[rgba(232,80,20,0.06)]" />
            </div>

            <div className="max-w-[430px] mx-auto min-h-screen relative flex flex-col z-10 bg-[#0A0A0A]/20 pb-[100px]">
                
                 {/* ─── SHARED NAV ─── */}
                 <nav className="sticky top-0 z-50 flex items-center justify-between px-[18px] py-[18px] bg-[#0A0A0A]/98 backdrop-blur-xl animate-dn">
                    <Logo size="sm" />
                    <div className="flex items-center gap-[9px]">
                        <Link href="/restaurants" className="w-[38px] h-[38px] rounded-[10px] bg-[#1C1C1C] border border-white/5 flex items-center justify-center text-[17px] relative">
                            🛒
                            <div className="absolute -top-[5px] -right-[5px] w-[16px] h-[16px] rounded-full bg-[#E8A020] text-black font-barlow-cond text-[10px] font-bold flex items-center justify-center">2</div>
                        </Link>
                        <Link href="/login" className="bg-[#E8A020] text-[#0A0A0A] font-barlow-cond font-bold text-[12px] uppercase tracking-[0.1em] px-[15px] py-[9px] rounded-[9px]">
                            Sign In
                        </Link>
                    </div>
                </nav>

                <div className="hub-body px-[18px] pt-[14px] animate-up relative z-10">
                    <Link href="/" className="back-btn inline-flex items-center gap-[7px] text-[#5A5550] font-barlow-cond text-[13px] font-semibold uppercase tracking-[0.1em] mb-[18px] hover:text-white transition-colors">
                        ← Back
                    </Link>

                    <div className="hub-badge inline-flex items-center gap-[7px] bg-[#E8A020]/10 border border-[#E8A020]/20 rounded-full px-[14px] py-[6px] mb-5">
                        <div className="hub-dot w-[7px] h-[7px] rounded-full bg-[#4CAF50] shadow-[0_0_8px_#4CAF50] animate-blink" />
                        <span className="font-barlow-cond text-[12px] font-semibold uppercase tracking-[0.14em] text-[#E8A020]">Discovery Hub · Protocol Active</span>
                    </div>

                    <h1 className="hub-title font-bebas text-[clamp(60px,19vw,84px)] leading-[0.87] mb-[14px] italic">
                        <span className="block text-[#F0EDE8]">REAL FOOD.</span>
                        <span className="block text-[#E8A020]">REAL LOCAL.</span>
                    </h1>

                    <p className="hub-sub text-[13px] font-light text-[#5A5550] leading-[1.65] mb-6 max-w-[290px]">
                        Skip the chains. Enter your address to find the best independent kitchens near you.
                    </p>

                    <div className="zone-row flex items-center justify-between bg-[#1C1C1C] border border-white/0.07 rounded-full px-4 py-2 mb-3.5 cursor-pointer hover:bg-[#252525] transition-colors">
                        <div className="zone-row-left flex items-center gap-[8px]">
                            <div className="zone-live w-[7px] h-[7px] rounded-full bg-[#4CAF50] shadow-[0_0_7px_#4CAF50] animate-blink" />
                            <span className="font-barlow-cond text-[13px] font-semibold uppercase tracking-[0.1em] text-white">
                                {address ? address.split(',')[0] : "Select Delivery Zone"}
                            </span>
                        </div>
                        <span className="text-[#E8A020] text-[12px]">▾</span>
                    </div>

                    <div className="hub-search bg-[#131313] border border-[#E8A020]/20 rounded-[16px] p-[5px] pl-4 flex items-center gap-[10px] mb-3 transition-all focus-within:border-[#E8A020] focus-within:ring-4 focus-within:ring-[#E8A020]/5">
                        <span className="text-[17px] shrink-0">📍</span>
                        <LandingSearch initialValue={address || ""} />
                    </div>

                    <div className="hub-stats flex bg-[#131313] border border-white/0.05 rounded-[14px] overflow-hidden mb-[30px]">
                        <div className="hub-stat flex-1 flex flex-col items-center py-[13px] relative after:absolute after:right-0 after:top-1/4 after:bottom-1/4 after:w-px after:bg-white/0.07">
                            <div className="font-bebas text-[20px] text-[#E8A020] leading-none">⚡ 15–25</div>
                            <div className="font-barlow-cond text-[10px] font-semibold uppercase tracking-[0.15em] text-[#5A5550]">Min Avg</div>
                        </div>
                        <div className="hub-stat flex-1 flex flex-col items-center py-[13px] relative after:absolute after:right-0 after:top-1/4 after:bottom-1/4 after:w-px after:bg-white/0.07">
                            <div className="font-bebas text-[20px] text-[#E8A020] leading-none">🏠 Local</div>
                            <div className="font-barlow-cond text-[10px] font-semibold uppercase tracking-[0.15em] text-[#5A5550]">Only</div>
                        </div>
                        <div className="hub-stat flex-1 flex flex-col items-center py-[13px]">
                            <div className="font-bebas text-[20px] text-[#E8A020] leading-none">🤝 Fair</div>
                            <div className="font-barlow-cond text-[10px] font-semibold uppercase tracking-[0.15em] text-[#5A5550]">Partners</div>
                        </div>
                    </div>

                    <div className="hub-plus bg-gradient-to-br from-[#E8A020]/0.14 to-[#E8A020]/0.07 border border-[#E8A020]/20 rounded-[18px] p-[18px] flex items-center justify-between gap-[14px] mb-[32px]">
                        <div className="flex-1">
                            <div className="hub-plus-badge inline-flex items-center bg-[#E8A020] rounded-[6px] px-[9px] py-[3px] mb-[7px]">
                                <span className="font-barlow-cond text-[11px] font-bold uppercase tracking-[0.12em] text-black">Elite Rewards</span>
                            </div>
                            <div className="font-bebas text-[24px] leading-[0.95] text-white">TrueServe Plus</div>
                            <div className="text-[12px] font-light text-[#5A5550] mt-1">Unlimited $0 Delivery & Member Pricing</div>
                        </div>
                        <Link href="/plus" className="bg-[#E8A020] text-[#0A0A0A] font-barlow-cond font-bold text-[12px] uppercase tracking-[0.07em] px-[15px] py-[12px] rounded-[11px] text-center leading-tight hover:scale-105 active:scale-95 transition-all">
                            Sign Up<br />Now
                        </Link>
                    </div>

                    <div className="hub-empty text-center py-10">
                        <div className="text-[52px] mb-3.5 opacity-50 grayscale">🗺️</div>
                        <div className="font-barlow-cond text-[20px] font-bold uppercase tracking-[0.06em] text-[#5A5550] mb-2">Enter Your Address</div>
                        <p className="text-[13px] font-light text-[#5A5550] leading-[1.6]">Type your delivery address above to sync with the best independent flavors in your community.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RestaurantFinder() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center font-bebas text-2xl text-[#E8A020] animate-pulse">Syncing Hub...</div>}>
            <RestaurantFinderContent />
        </Suspense>
    );
}
