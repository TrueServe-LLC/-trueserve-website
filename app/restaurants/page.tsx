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

            <div className="max-w-[430px] mx-auto min-h-screen relative flex flex-col z-10 bg-[#0A0A0A] pb-32">
                
                 {/* ── APP HEADER ── */}
                 <nav className="sticky top-0 z-[60] bg-[#0A0A0A]/85 backdrop-blur-2xl border-b border-white/5 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <span className="text-sm">←</span>
                        </Link>
                        <h1 className="font-bebas text-2xl italic tracking-widest text-white uppercase">Discovery Hub</h1>
                    </div>
                    <Link href="/orders" className="w-10 h-10 rounded-full bg-[#141417] border border-white/5 flex items-center justify-center relative">
                        <span className="text-lg">🛒</span>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#E8A020] rounded-full text-black font-barlow-cond text-[9px] font-black flex items-center justify-center">2</div>
                    </Link>
                </nav>

                <div className="px-5 pt-6 animate-up relative z-10">
                    <div className="hub-badge inline-flex items-center gap-2 bg-[#E8A020]/10 border border-[#E8A020]/20 rounded-full px-4 py-2 mb-6">
                        <div className="hub-dot w-1.5 h-1.5 rounded-full bg-[#32D74B] shadow-[0_0_8px_#32D74B] animate-pulse" />
                        <span className="font-barlow-cond text-[11px] font-black uppercase tracking-widest text-[#E8A020] italic">Fleet Protocol V4 Active</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="font-bebas text-5xl italic leading-[0.9] text-white tracking-wider uppercase mb-3">Independent<br /><span className="text-[#E8A020]">Kitchens</span></h2>
                        <p className="font-barlow text-[13px] font-medium text-[#555] leading-relaxed max-w-[280px]">
                            {address ? `Scanning ${address.split(',')[0]} sector for elite culinary mission partners.` : "Enter your coordinates to sync with nearby local flavors."}
                        </p>
                    </div>

                    {/* ── SEARCH ZONE ── */}
                    <div className="space-y-4 mb-8">
                        <div className="bg-[#141417] border border-white/5 rounded-2xl p-1.5 flex items-center gap-3 transition-all focus-within:border-[#E8A020]/30 shadow-inner">
                            <div className="w-11 h-11 bg-[#E8A020]/10 rounded-xl flex items-center justify-center text-lg">📍</div>
                            <LandingSearch initialValue={address || ""} />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {['FILTER', 'UNDER 20 MIN', 'TOP RATED', 'VEGAN', 'OFFERS'].map((f, i) => (
                                <button key={i} className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 font-barlow-cond text-[10px] font-black uppercase tracking-widest text-[#555] active:bg-[#E8A020] active:text-black transition-all">
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── EMPTY STATE / RESULTS ── */}
                    {!address ? (
                        <div className="mt-12 text-center p-10 border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                            <div className="text-6xl mb-6 grayscale opacity-20">📡</div>
                            <h3 className="font-bebas text-2xl italic tracking-widest text-white/40 uppercase mb-2">Awaiting Coordinates</h3>
                            <p className="font-barlow-cond text-[10px] font-black uppercase tracking-[0.2em] text-[#222]">Sector: Global HQ</p>
                        </div>
                    ) : (
                        <div className="space-y-8 pb-12">
                            {/* REUSE THE PREMIUM CARD STYLE FROM HOME PAGE FOR CONSISTENCY */}
                            {[
                                { name: 'EMERALD KITCHEN', rating: '4.8', time: '12-18 MIN', img: '/community_section.png', tags: ['HEALTHY', 'BOWLS'] },
                                { name: 'MT. AIRY BBQ', rating: '4.9', time: '25-35 MIN', img: '/merchant_section.png', tags: ['SMOKED', 'MEATS'] },
                            ].map((shop, i) => (
                                <Link key={i} href="/restaurants/sample" className="group block relative bg-[#0c0c0e] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl active:scale-[0.98] transition-all">
                                    <div className="relative h-[200px] overflow-hidden">
                                        <img src={shop.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[5s] brightness-75" />
                                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                                            <span className="text-[#E8A020] text-[10px]">★</span>
                                            <span className="font-bold text-[12px] text-white">{shop.rating}</span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="font-bebas text-3xl italic text-white tracking-widest uppercase">{shop.name}</h3>
                                            <span className="font-barlow-cond text-[11px] font-black uppercase tracking-widest text-[#E8A020] italic">{shop.time}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {shop.tags.map((tag, j) => (
                                                <span key={j} className="text-[#444] font-barlow-cond text-[9px] font-black uppercase tracking-widest">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
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
