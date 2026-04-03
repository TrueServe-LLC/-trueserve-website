"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession, loginAsDemoMerchant } from "@/app/auth/actions";
import Logo from "@/components/Logo";
import Link from "next/link";

export default function MerchantLoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const isPreview = document.cookie.includes("preview_mode=true");
            if (isPreview) {
                router.push("/merchant/dashboard");
                return;
            }

            const session = await getAuthSession();
            if (session.isAuth && session.role === 'MERCHANT') {
                router.push("/merchant/dashboard");
            }
        };
        checkUser();
    }, [router]);

    return (
        <div className="selection:bg-[#e8a230]/30 min-h-screen bg-[#0c0e13]">
            {/* ── MOBILE APP VIEW ── */}
            <div className="lg:hidden flex flex-col min-h-screen">
                <div className="auth-hero d">
                    <div className="auth-ring bg-[#e8a230] flex items-center justify-center">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 19l2-12h12l2 12H3z" stroke="#000" strokeWidth="1.8"/><circle cx="11" cy="7" r="3" stroke="#000" strokeWidth="1.8"/></svg>
                    </div>
                    <div className="auth-badge d"><span className="auth-badge-txt">Partner Program</span></div>
                    <div className="auth-title">Welcome Back, <span className="text-[#e8a230]">Partner.</span></div>
                    <div className="auth-sub">Your operational hub is ready</div>
                </div>
                <div className="auth-body">
                    <div className="space-y-4">
                        <div>
                            <label className="fl">Merchant Identifier</label>
                            <input className="fi" type="text" placeholder="partner@yourstore.com" />
                        </div>
                        <div>
                            <label className="fl">Security Password</label>
                            <input className="fi" type="password" placeholder="••••••••" />
                        </div>
                        
                        <button className="btn-gold h-15 !rounded-[100px] mt-2" disabled={isLoading} onClick={() => {
                             setIsLoading(true);
                             setTimeout(() => router.push("/merchant/dashboard"), 1000);
                        }}>
                            {isLoading ? "AUTHORIZING..." : "Authorize Connection →"}
                        </button>
                        
                        <div className="auth-divider">
                            <span className="auth-divider-txt">Quick Access</span>
                        </div>

                        <button className="w-full bg-[#e8a230]/10 border border-[#e8a230]/24 text-[#e8a230] font-bold uppercase tracking-[0.12em] text-[12px] h-13 rounded-[100px] transition-all flex items-center justify-center gap-2" onClick={loginAsDemoMerchant}>
                            ⚡ LOGIN AS DEMO MERCHANT
                        </button>

                        <div className="text-center font-dm-sans text-[12px] text-[#555] pt-2">
                             New partner? <Link href="/merchant/apply" className="text-[#e8a230] font-bold">Apply to platform</Link>
                        </div>
                    </div>
                    <div className="auth-link"><Link href="/">← Back to home</Link></div>
                </div>
            </div>

            {/* ── DESKTOP VIEW ── */}
            <div className="hidden lg:grid grid-cols-[1.1fr_0.9fr] min-h-screen">
                <div className="relative min-h-screen flex flex-col justify-end p-[60px_45px] overflow-hidden bg-[#070707]">
                    <img src="/merchant_login_bg_restaurant.png" alt="Merchant Background" className="absolute inset-0 z-0 w-full h-full object-cover grayscale opacity-22 contrast-[1.2] brightness-75" />
                    <div className="absolute inset-0 bg-gradient-to-bottom from-[rgba(10,10,10,0.1)] via-[rgba(10,10,10,0.3)] to-[rgba(10,10,10,0.98)] z-[1]" />
                    
                    <div className="absolute top-[40px] left-[45px] flex items-center gap-3 z-[4]">
                        <Logo size="lg" />
                    </div>

                    <div className="relative z-[3] animate-up w-full max-w-[480px]">
                        <div className="inline-flex items-center gap-2 bg-[rgba(232,160,32,0.1)] border border-[rgba(232,160,32,0.2)] p-[6px_14px] mb-[25px] rounded-md">
                            <span className="w-[7px] h-[7px] bg-[#E8A020] rounded-full shadow-[0_0_10px_#E8A020]" />
                            <span className="font-barlow-cond text-[10px] font-bold tracking-[0.18em] uppercase text-[#E8A020]">SECURE PARTNER UPLINK</span>
                        </div>

                        <div className="font-bebas text-[105px] italic uppercase leading-[0.88] mb-[25px] tracking-[-0.01em]">
                            <span className="text-[#F0EDE8] block">READY TO</span>
                            <span className="text-[#E8A020] block">SCALE?</span>
                        </div>

                        <div className="text-[15px] font-light text-[#5A5550] line-height-[1.6] max-w-[360px] mb-[45px]">Enter the operational nerve center for top-performing kitchens. Manage your orders and growth in real-time.</div>

                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center gap-[16px] p-[14px_18px] bg-[rgba(15,15,15,0.6)] border border-[rgba(255,255,255,0.04)] rounded-md">
                                <div className="w-[36px] h-[36px] bg-[rgba(232,160,32,0.08)] border border-[rgba(232,160,32,0.15)] flex items-center justify-center shrink-0">📊</div>
                                <div>
                                    <div className="font-barlow-cond text-[14px] font-bold text-[#F0EDE8] mb-[1px] uppercase tracking-[0.04em]">Live Operations Feed</div>
                                    <div className="text-[11px] text-[#5A5550] font-normal">Monitor live order flow and preparation timers.</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-[16px] p-[14px_18px] bg-[rgba(15,15,15,0.6)] border border-[rgba(255,255,255,0.04)] rounded-md">
                                <div className="w-[36px] h-[36px] bg-[rgba(232,160,32,0.08)] border border-[rgba(232,160,32,0.15)] flex items-center justify-center shrink-0">🚀</div>
                                <div>
                                    <div className="font-barlow-cond text-[14px] font-bold text-[#F0EDE8] mb-[1px] uppercase tracking-[0.04em]">Strategic Growth Engine</div>
                                    <div className="text-[11px] text-[#5A5550] font-normal">Access high-yield sector data for market expansion.</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-[16px] p-[14px_18px] bg-[rgba(15,15,15,0.6)] border border-[rgba(255,255,255,0.04)] rounded-md">
                                <div className="w-[36px] h-[36px] bg-[rgba(232,160,32,0.08)] border border-[rgba(232,160,32,0.15)] flex items-center justify-center shrink-0">🛡️</div>
                                <div>
                                    <div className="font-barlow-cond text-[14px] font-bold text-[#F0EDE8] mb-[1px] uppercase tracking-[0.04em]">Priority Partner Support</div>
                                    <div className="text-[11px] text-[#5A5550] font-normal">Continuous 24/7 assistance for your operations.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#0A0A0A] flex flex-col items-center justify-center p-[60px] relative">
                    <div className="w-full max-w-[420px] animate-fade-in">
                        <div className="font-bebas text-[52px] font-normal italic text-[#F0EDE8] mb-[5px] uppercase tracking-[0.02em]">Partner Authorization</div>
                        <div className="font-barlow-cond text-[11px] font-bold tracking-[0.22em] uppercase text-[#E8A020] mb-[45px] opacity-90">SECURE UPLINK TERMINAL</div>

                        <div className="space-y-6">
                            <div>
                                <div className="font-barlow-cond text-[11px] font-bold tracking-[0.14em] uppercase text-[#5A5550] mb-2.5 ml-[1px]">Merchant Identifier</div>
                                <div className="bg-[#121212] border border-[rgba(255,255,255,0.05)] rounded-[2px] overflow-hidden">
                                     <input type="text" className="w-full bg-[#0D0D0D] p-[18px_20px] color-[#F0EDE8] font-dm-sans text-[15px] outline-none border-none placeholder:text-[#222]" placeholder="partner@yourstore.com" />
                                </div>
                            </div>

                            <div>
                                <div className="font-barlow-cond text-[11px] font-bold tracking-[0.14em] uppercase text-[#5A5550] mb-2.5 ml-[1px]">Security Password</div>
                                <div className="bg-[#121212] border border-[rgba(255,255,255,0.05)] rounded-[2px] overflow-hidden">
                                     <input type="password" className="w-full bg-[#0D0D0D] p-[18px_20px] color-[#F0EDE8] font-dm-sans text-[15px] outline-none border-none placeholder:text-[#222]" placeholder="••••••••" />
                                </div>
                            </div>

                            <button className="w-full h-[58px] bg-[#E8A230] border-none text-black font-barlow-cond text-[13px] font-extrabold uppercase tracking-[.18em] cursor-pointer rounded-[2px] transition-all active:scale-[.98]" disabled={isLoading} onClick={() => setIsLoading(true)}>
                                {isLoading ? "AUTHORIZING..." : "AUTHORIZE CONNECTION →"}
                            </button>

                            <div className="flex items-center gap-4 py-2">
                                <div className="flex-1 h-px bg-white/5" />
                                <div className="font-barlow-cond text-[10px] font-bold color-[#222] uppercase tracking-[.25em] whitespace-nowrap">PARTNER ROLLOUT ACCESS</div>
                                <div className="flex-1 h-px bg-white/5" />
                            </div>

                            <button className="w-full h-[52px] bg-transparent border border-[rgba(232,160,32,.3)] bg-[rgba(232,160,32,0.02)] text-[#E8A020] font-barlow-cond text-[12px] font-bold uppercase tracking-[.14em] cursor-pointer rounded-[2px] transition-all flex items-center justify-center gap-2" onClick={loginAsDemoMerchant}>
                                ⚡ QUICK PILOT ACCESS (MERCHANT)
                            </button>
                            
                            <button className="w-full h-[52px] bg-transparent border border-[rgba(255,255,255,0.05)] text-[#E8A020] font-barlow-cond text-[12px] font-bold uppercase tracking-[.14em] cursor-pointer rounded-[2px] transition-all flex items-center justify-center" onClick={() => router.push("/merchant/apply")}>
                                PARTNER WITH TRUESERVE
                            </button>
                        </div>

                        <div className="mt-12 flex items-center justify-center gap-2 text-[#222] font-semibold text-[10px] uppercase tracking-[0.2em] opacity-40">
                            <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><rect x="1" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M3 5V3.5a2 2 0 014 0V5" stroke="currentColor" strokeWidth="1.2"/></svg>
                            ENCRYPTED CONNECTION · SECURE UPLINK
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
