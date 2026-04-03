"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession, loginAsDemoMerchant } from "@/app/auth/actions";
import Logo from "@/components/Logo";
import Link from "next/link";
import { BarChart3, TrendingUp, ShieldCheck } from "lucide-react";

function MerchantLoginPageContent() {
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
        <div className="min-h-screen bg-[#0c0e13] text-white font-sans selection:bg-[#e8a230]/30 selection:text-black overflow-x-hidden">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&family=Barlow+Condensed:ital,wght@0,700;0,800;1,700;1,800&family=Bebas+Neue&display=swap');
                .bebas { font-family: 'Bebas Neue', sans-serif; }
                .barlow-cond { font-family: 'Barlow Condensed', sans-serif; }
                
                .fi-input {
                    background: #131720;
                    border: 1px solid #2a2f3a;
                    border-radius: 4px;
                    padding: 12px 16px;
                    width: 100%;
                    outline: none;
                    font-size: 14px;
                    color: #fff;
                    transition: border-color 0.2s;
                }
                .fi-input:focus { border-color: #e8a230; }
                .fi-input::placeholder { color: #555; }
                
                .fi-label {
                    font-family: 'Barlow Condensed', sans-serif;
                    font-weight: 800;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: #e8a230;
                    margin-bottom: 8px;
                    display: block;
                }
            ` }} />

            {/* ── TOP NAV TABS ── */}
            <div className="flex bg-[#080a0f] border-b border-white/5">
                <Link href="/merchant/login" className="px-8 py-4 bg-[#e8a230] text-black font-bold text-xs uppercase tracking-widest">Merchant Login</Link>
                <Link href="/driver/login" className="px-8 py-4 text-[#555] hover:text-white transition-colors font-bold text-xs uppercase tracking-widest">Driver Login</Link>
            </div>

            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-50px)]">
                
                {/* ── LEFT COLUMN ── */}
                <div className="w-full lg:w-1/2 p-10 lg:p-24 space-y-16">
                    {/* Logo Section */}
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full border-2 border-[#e8a230] flex items-center justify-center">
                            <span className="text-[#e8a230] text-xl">✓</span>
                        </div>
                        <span className="barlow-cond text-2xl font-black uppercase tracking-widest">TrueServe</span>
                    </div>

                    <div className="space-y-8">
                        <div className="inline-block px-3 py-1 border border-[#e8a230] rounded flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#e8a230]" />
                            <span className="barlow-cond font-black text-[10px] uppercase tracking-[0.2em] text-[#e8a230]">PARTNER UPLINK</span>
                        </div>

                        <h1 className="italic text-white text-[80px] lg:text-[110px] leading-[0.85] font-black uppercase tracking-tighter">
                            READY TO<br />
                            <span className="text-[#e8a230]">SCALE?</span>
                        </h1>

                        <p className="max-w-md text-[#888] font-medium text-lg leading-relaxed">
                            Access your merchant command center. Monitor live operations, analyze performance metrics, and optimize your delivery infrastructure.
                        </p>
                    </div>

                    <div className="space-y-4 max-w-lg">
                        {[
                            { title: "Live Ops", desc: "Monitor live order flow and preparation timers.", icon: "⚡" },
                            { title: "Growth Engine", desc: "Access high-yield sector data for expansion.", icon: "📈" },
                            { title: "Core Support", desc: "24/7 mission-ready assistance for partners.", icon: "✓" }
                        ].map((card) => (
                            <div key={card.title} className="bg-[#0f1219] border border-white/5 p-6 flex items-center gap-6 rounded-sm">
                                <div className="w-12 h-12 bg-[#131720] border border-[#2a2f3a] rounded flex items-center justify-center text-[#e8a230] text-xl">{card.icon}</div>
                                <div>
                                    <h3 className="font-bold text-lg text-white uppercase">{card.title}</h3>
                                    <p className="text-[#555] text-sm">{card.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div className="w-full lg:w-1/2 bg-[#0c0e13] border-l border-white/5 p-10 lg:p-24 flex items-center justify-center">
                    <div className="max-w-[500px] w-full">
                        <div className="mb-12">
                            <h2 className="italic text-white text-5xl font-black uppercase tracking-tight">PARTNER <span className="text-[#e8a230]">LOGIN.</span></h2>
                            <p className="barlow-cond font-black text-[10px] uppercase tracking-[0.3em] text-[#555] mt-2">SECURE UPLINK TERMINAL ENGINE</p>
                        </div>

                        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); setIsLoading(true); setTimeout(() => router.push("/merchant/dashboard"), 1000); }}>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="fi-label">IDENTIFIER *</label>
                                    <input type="text" className="fi-input" placeholder="brand@protocol.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="fi-label">SECURITY PASSKEY *</label>
                                    <input type="password" className="fi-input" placeholder="••••••••" />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-[#e8a230] text-black font-black uppercase text-sm py-5 rounded-md hover:brightness-110 transition-all flex items-center justify-center gap-2">
                                {isLoading ? "AUTHORIZING..." : "AUTHORIZE CONNECTION →"}
                            </button>
                            
                            <div className="flex items-center gap-4 py-2 opacity-30">
                                <div className="flex-1 h-px bg-white/20" />
                                <span className="font-barlow-cond text-[10px] font-bold uppercase tracking-widest text-[#555]">OR</span>
                                <div className="flex-1 h-px bg-white/20" />
                            </div>

                            <button type="button" onClick={loginAsDemoMerchant} className="w-full bg-transparent border border-[#e8a230]/30 hover:border-[#e8a230] text-[#e8a230] font-barlow-cond text-[11px] font-bold uppercase tracking-[.18em] py-4 rounded-md transition-all">
                                ⚡ QUICK PILOT ACCESS (MERCHANT)
                            </button>

                            <div className="text-center pt-8">
                                <p className="text-[#555] text-xs font-bold uppercase tracking-widest">
                                    New partner? <Link href="/merchant/signup" className="text-[#e8a230] hover:underline">Apply now</Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MerchantLoginPage() {
    return (
        <Suspense fallback={null}>
            <MerchantLoginPageContent />
        </Suspense>
    );
}
