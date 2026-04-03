"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#F0EDE8] selection:bg-[#E8A020]/30 overflow-x-hidden font-barlow">
            {/* AMBIENT ORBS */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="orb w-[260px] h-[260px] top-[-60px] right-[-80px] bg-[#E8A020]/10" />
                <div className="orb w-[200px] h-[200px] top-[480px] left-[-70px] bg-[#E8A020]/0.06" />
                <div className="orb w-[160px] h-[160px] bottom-[130px] right-[-50px] bg-[rgba(232,80,20,0.06)]" />
            </div>

            <div className="max-w-[430px] mx-auto min-h-screen relative flex flex-col z-10 bg-[#0A0A0A]/20">
                
                {/* ─── SHARED NAV ─── */}
                <nav className="sticky top-0 z-50 flex items-center justify-between px-[18px] py-[18px] bg-[#0A0A0A]/98 backdrop-blur-xl animate-dn">
                    <Logo size="sm" />
                    <div className="flex items-center gap-[9px]">
                        <Link href="/restaurants" className="w-[38px] h-[38px] rounded-[10px] bg-[#1C1C1C] border border-white/5 flex items-center justify-center text-[17px] relative hover:scale-105 transition-transform">
                            🛒
                            <div className="absolute -top-[5px] -right-[5px] w-[16px] h-[16px] rounded-full bg-[#E8A020] text-black font-barlow-cond text-[10px] font-bold flex items-center justify-center shadow-lg">2</div>
                        </Link>
                        <Link href="/login" className="bg-[#E8A020] text-[#0A0A0A] font-barlow-cond font-bold text-[12px] uppercase tracking-[0.1em] px-[15px] py-[9px] rounded-[9px] active:scale-95 transition-all shadow-[0_4px_15px_rgba(232,160,32,0.2)]">
                            Sign In
                        </Link>
                    </div>
                </nav>

                {/* ─── HERO SECTION ─── */}
                <main className="px-[18px] pt-4 animate-up mb-10">
                    <div className="font-barlow-cond text-[12px] font-semibold tracking-[0.24em] uppercase text-[#E8A020] mb-2.5">
                        Next-Gen Delivery Infrastructure
                    </div>
                    
                    <h1 className="font-bebas text-[clamp(58px,18vw,80px)] leading-[0.88] tracking-[-0.01em] mb-3.5 italic">
                        <span className="block text-[#F0EDE8]">CRAVINGS</span>
                        <span className="block text-[#E8A020]">MEET</span>
                        <span className="block text-[#F0EDE8]">LIGHTNING<br />SPEED.</span>
                    </h1>

                    <p className="text-[14px] font-light text-[#5A5550] leading-[1.65] mb-[30px] max-w-[300px]">
                        The platform built for independent kitchens, hungry communities, and drivers who hustle.
                    </p>

                    <div className="cat-cards space-y-[14px]">
                        {/* Discovery Hub */}
                        <Link href="/restaurants" className="cat-card group">
                            <div className="cat-card-base relative min-h-[160px] rounded-[20px] overflow-hidden border border-white/0.06 flex flex-col justify-end transition-transform active:scale-[0.98]">
                                <img src="/merchant_login_bg_restaurant.png" className="absolute inset-0 w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-50 transition-all duration-700 scale-105 group-hover:scale-100" />
                                <div className="absolute inset-0 bg-gradient-to-br from-[#1a0800]/80 via-[#2d1200]/60 to-[#1a0800]/80" />
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_40%,rgba(232,160,32,0.18),transparent_65%)]" />
                                <div className="absolute top-4 right-4 w-[34px] h-[34px] rounded-full bg-white/7 border border-white/0.1 flex items-center justify-center text-[15px] group-hover:bg-[#E8A020] group-hover:text-black transition-all">→</div>
                                <div className="relative z-10 p-5 bg-gradient-to-t from-[#0A0A0A]/92 to-transparent">
                                    <div className="inline-flex items-center gap-[6px] rounded-full px-[11px] py-1 bg-[#E8A020]/20 text-[#E8A020] font-barlow-cond text-[11px] font-bold uppercase tracking-[0.14em] mb-[7px]">
                                        🔥 Live Now
                                    </div>
                                    <h3 className="font-bebas text-[30px] leading-[0.95] text-white mb-[5px]">Discovery Hub</h3>
                                    <p className="text-[12px] font-light text-[#5A5550] leading-[1.5]">Find independent restaurants delivering in your area</p>
                                </div>
                            </div>
                        </Link>

                        {/* Merchant Card */}
                        <Link href="/merchant/login" className="cat-card group">
                            <div className="cat-card-base relative min-h-[160px] rounded-[20px] overflow-hidden border border-white/0.06 flex flex-col justify-end transition-transform active:scale-[0.98]">
                                <img src="/merchant_login_bg_restaurant.png" className="absolute inset-0 w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-50 transition-all duration-700 scale-105 group-hover:scale-100" />
                                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a]/80 via-[#151528]/60 to-[#0a0a1a]/80" />
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_40%,rgba(100,100,232,0.15),transparent_65%)]" />
                                <div className="absolute top-4 right-4 w-[34px] h-[34px] rounded-full bg-white/7 border border-white/0.1 flex items-center justify-center text-[15px] group-hover:bg-[#a0a0ff] group-hover:text-black transition-all">→</div>
                                <div className="relative z-10 p-5 bg-gradient-to-t from-[#0A0A0A]/92 to-transparent">
                                    <div className="inline-flex items-center gap-[6px] rounded-full px-[11px] py-1 bg-[rgba(150,150,255,0.15)] text-[#a0a0ff] font-barlow-cond text-[11px] font-bold uppercase tracking-[0.14em] mb-[7px]">
                                        Partnership
                                    </div>
                                    <h3 className="font-bebas text-[30px] leading-[0.95] text-white mb-[5px]">Become a Merchant</h3>
                                    <p className="text-[12px] font-light text-[#5A5550] leading-[1.5]">List your restaurant and reach more customers today</p>
                                </div>
                            </div>
                        </Link>

                        {/* Driver Card */}
                        <Link href="/driver/login" className="cat-card group">
                            <div className="cat-card-base relative min-h-[160px] rounded-[20px] overflow-hidden border border-white/0.06 flex flex-col justify-end transition-transform active:scale-[0.98]">
                                <img src="/driver_login_bg_car.png" className="absolute inset-0 w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-50 transition-all duration-700 scale-105 group-hover:scale-100" />
                                <div className="absolute inset-0 bg-gradient-to-br from-[#001208]/80 via-[#001f0d]/60 to-[#001208]/80" />
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_40%,rgba(80,200,80,0.12),transparent_65%)]" />
                                <div className="absolute top-4 right-4 w-[34px] h-[34px] rounded-full bg-white/7 border border-white/0.1 flex items-center justify-center text-[15px] group-hover:bg-[#80e080] group-hover:text-black transition-all">→</div>
                                <div className="relative z-10 p-5 bg-gradient-to-t from-[#0A0A0A]/92 to-transparent">
                                    <div className="inline-flex items-center gap-[6px] rounded-full px-[11px] py-1 bg-[rgba(80,200,80,0.15)] text-[#80e080] font-barlow-cond text-[11px] font-bold uppercase tracking-[0.14em] mb-[7px]">
                                        Protocol
                                    </div>
                                    <h3 className="font-bebas text-[30px] leading-[0.95] text-white mb-[5px]">Become a Driver</h3>
                                    <p className="text-[12px] font-light text-[#5A5550] leading-[1.5]">Earn on your schedule delivering for local kitchens</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* MOCK PORTAL ACCESS (ADMIN) */}
                    <div className="mt-12 pt-8 border-t border-white/5 opacity-40 hover:opacity-100 transition-opacity">
                        <Link href="/admin/login" className="flex items-center justify-between p-4 bg-[#131313] rounded-2xl border border-white/5 group">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🛡️</span>
                                <span className="font-barlow-cond font-bold uppercase tracking-widest text-[#5A5550] group-hover:text-[#E8A020] transition-colors">Admin Terminal</span>
                            </div>
                            <span className="text-[#5A5550]">›</span>
                        </Link>
                    </div>
                </main>

                {/* ─── BOTTOM NAV ─── */}
                <nav className="sticky bottom-0 z-50 bg-[#0C0C0C]/97 backdrop-blur-2xl border-t border-white/5 flex justify-around px-2 pt-[11px] pb-[24px]">
                    <Link href="/" className="flex flex-col items-center gap-1 flex-1 text-[#E8A020]">
                        <span className="text-[21px]">🏠</span>
                        <span className="font-barlow-cond text-[10px] font-semibold uppercase tracking-[0.1em]">Home</span>
                    </Link>
                    <Link href="/restaurants" className="flex flex-col items-center gap-1 flex-1 text-[#5A5550] hover:text-[#E8A020] transition-colors">
                        <span className="text-[21px]">🔍</span>
                        <span className="font-barlow-cond text-[10px] font-semibold uppercase tracking-[0.1em]">Explore</span>
                    </Link>
                    <Link href="/orders" className="flex flex-col items-center gap-1 flex-1 text-[#5A5550] hover:text-[#E8A020] transition-colors">
                        <span className="text-[21px]">📋</span>
                        <span className="font-barlow-cond text-[10px] font-semibold uppercase tracking-[0.1em]">Orders</span>
                    </Link>
                    <Link href="/user/settings" className="flex flex-col items-center gap-1 flex-1 text-[#5A5550] hover:text-[#E8A020] transition-colors">
                        <span className="text-[21px]">👤</span>
                        <span className="font-barlow-cond text-[10px] font-semibold uppercase tracking-[0.1em]">Profile</span>
                    </Link>
                </nav>
            </div>
        </div>
    );
}
