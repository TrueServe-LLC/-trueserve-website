import { Suspense } from "react";
import Link from "next/link";
import DriverLoginForm from "./DriverLoginForm";

export default function DriverLoginPage() {
    return (
        <div className="flex min-h-screen bg-[#080c14] font-sans selection:bg-primary/30">
            {/* Sidebar - Inspired by HouseEats */}
            <aside className="hidden lg:flex w-[420px] bg-[#0a0a0b] border-r border-white/5 flex-col p-12 relative overflow-hidden shrink-0">
                {/* Background Image Layer */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/admin_login_bg_cinematic_1774378543203.png" 
                        alt="Background" 
                        className="w-full h-full object-cover grayscale opacity-20 scale-110 blur-[2px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent" />
                </div>
                
                {/* Decorative radial gradient */}
                <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 flex flex-col h-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-4 mb-20 hover:opacity-80 transition-opacity group">
                        <div className="w-12 h-12 rounded-xl border border-white/10 group-hover:scale-110 transition-transform shadow-2xl p-2 bg-black/40">
                             <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-2xl font-black italic tracking-tighter text-white uppercase italic">True<span className="text-primary not-italic">Serve</span></span>
                    </Link>

                    {/* Program Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8 w-fit">
                        🛵 Fleet Access Program
                    </div>

                    {/* Title */}
                    <h2 className="text-4xl md:text-5xl font-serif italic text-white leading-[1.1] mb-6">
                        Ready to <br />
                        <span className="text-primary uppercase tracking-tighter not-italic font-sans">Earn?</span>
                    </h2>

                    <p className="text-slate-400 text-sm leading-relaxed mb-12 max-w-xs">
                        Connect with the TrueServe platform and start accepting local delivery routes in your area today.
                    </p>

                    {/* Perks */}
                    <div className="space-y-4 mt-auto">
                        <div className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-primary/20 transition-all">
                            <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg bg-primary/10 text-primary border border-primary/20">💰</div>
                            <div className="space-y-1">
                                <p className="text-[13px] font-bold text-white tracking-wide">Daily Payouts</p>
                                <p className="text-[11px] text-slate-500 leading-tight">Drive today, get paid today. Transparent splits.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-primary/20 transition-all">
                            <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg bg-white/5 text-white border border-white/10 text-primary">⛽</div>
                            <div className="space-y-1">
                                <p className="text-[13px] font-bold text-white tracking-wide">Optimized Routing</p>
                                <p className="text-[11px] text-slate-500 leading-tight">Smart dispatching to minimize fuel and time.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-primary/20 transition-all">
                            <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg bg-white/5 text-white border border-white/10">🏆</div>
                            <div className="space-y-1">
                                <p className="text-[13px] font-bold text-white tracking-wide">Fleet Support</p>
                                <p className="text-[11px] text-slate-500 leading-tight">Priority 24/7 assistance for every mile.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-y-auto">
                {/* Background Grid - HouseEats Style */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]" />
                </div>
                
                {/* Mobile Nav Header */}
                <div className="lg:hidden flex items-center justify-between p-6 border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-xl">
                    <Link href="/" className="text-xl font-black italic text-white">True<span className="text-primary">Serve</span></Link>
                    <div className="text-[10px] font-black uppercase tracking-widest text-primary">Fleet Login</div>
                </div>

                <div className="flex-1 flex items-center justify-center p-8 md:p-16">
                    <div className="w-full max-w-md space-y-12">
                        {/* Header */}
                        <div className="space-y-2">
                            <h3 className="text-3xl font-serif italic text-white tracking-tight leading-tight">Fleet Authorization</h3>
                            <p className="text-slate-500 text-sm italic tracking-widest font-black uppercase text-[10px]">Secure Uplink Terminal</p>
                        </div>

                        {/* OTP Form Module */}
                        <Suspense fallback={<div className="text-center text-slate-500 text-[10px] font-black uppercase tracking-widest animate-pulse p-12 bg-[#1c1916] rounded-3xl border border-white/5">Establishing Secure Uplink...</div>}>
                            <DriverLoginForm />
                        </Suspense>

                        {/* Footer Link */}
                        <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">New to the Fleet?</p>
                            <Link href="/driver" className="badge-solid-primary !rounded-full !py-2.5 !px-8 !text-[10px] !opacity-100 h-glow">
                                Apply to Drive
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
