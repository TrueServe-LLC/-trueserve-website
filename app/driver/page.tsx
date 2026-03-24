"use client";

import { useRef } from "react";
import Link from "next/link";
import ModeToggle from "@/components/ModeToggle";

export default function DriverPortal() {
    const formRef = useRef<HTMLDivElement>(null);

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30 font-sans">
            {/* Standardized Replit-Style Top-Nav */}
            <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-black/60 border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-8 h-8 rounded-full border border-white/10 shadow-lg" />
                        <span className="text-xl font-black tracking-tighter text-white">True<span className="text-primary">Serve</span></span>
                    </Link>
                    <div className="h-6 w-px bg-white/10 mx-2"></div>
                    <nav className="flex items-center gap-1 font-sans">
                        <Link href="/restaurants" className="nav-link px-6 text-slate-400">🍴 Order Food</Link>
                        <Link href="/driver" className="nav-link px-6 text-emerald-500 bg-emerald-500/5 rounded-full">🛵 Join Fleet</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/driver/login" className="nav-link text-emerald-500 border-b border-emerald-500/20 hover:border-emerald-500 transition-all pb-0.5">Fleet Entry</Link>
                    <ModeToggle />
                    <Link href="/driver-signup" className="btn-standard py-3 px-8 text-[9px] shadow-emerald-500/10">
                        Apply Now
                    </Link>
                </div>
            </nav>

            <main className="container py-12 md:py-24 px-4 md:px-8 pb-40 font-sans">
                {/* Replit-Style Header Title Stack */}
                <div className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto px-2">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-3xl shadow-xl">🛵</div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-tight">
                                Fleet Join Hub
                            </h1>
                            <p className="text-slate-500 text-xs md:text-sm font-black uppercase tracking-widest mt-1">
                                Join the TrueServe Network and start earning
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Enclosure (Replit-Style Card) */}
                <div className="max-w-7xl mx-auto bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 md:p-16 shadow-2xl space-y-32">
                    
                    {/* Hero Section inside Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32 items-center">
                        <div className="space-y-12">
                            <div>
                                <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-6 leading-tight">Your City. <br />Your Schedule.</h2>
                                <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-lg mb-8 italic">
                                    Become your own boss. TrueServe pays 25-40% more by prioritizing mileage-based earnings and fair driver splits.
                                </p>
                                <Link href="/driver-signup" className="btn-standard px-12 py-5 text-xs shadow-emerald-500/20">Apply Instantly →</Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 pt-4">
                                {[
                                    { label: "Base Pay", value: "$3.00+", icon: "💰" },
                                    { label: "Mileage", value: "$0.70/mi", icon: "📍" },
                                    { label: "Wait Pay", value: "$0.25/min", icon: "⏰" },
                                    { label: "Tips", value: "100%", icon: "✨" }
                                ].map((row, i) => (
                                    <div key={i} className="flex flex-col p-8 bg-white/[0.03] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.06] transition-all shadow-xl group cursor-pointer">
                                        <div className="text-2xl mb-4 group-hover:scale-110 transition-transform">{row.icon}</div>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{row.label}</p>
                                        <p className="text-2xl font-black text-white group-hover:text-emerald-500 transition-colors tracking-tighter italic uppercase">{row.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA Visual Block */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-primary rounded-[3.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                            <div className="relative bg-black/60 border border-white/10 rounded-[3rem] p-12 md:p-20 shadow-2xl text-center overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 text-8xl opacity-5">🏎️</div>
                                <h3 className="text-4xl md:text-5xl font-black text-white italic tracking-tight mb-6">Operational <br />Start</h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-12 pb-8 border-b border-white/5 leading-relaxed">Join the most efficient delivery matrix in the South East.</p>
                                <Link href="/driver-signup" className="badge-emerald w-full py-6 text-xs shadow-emerald-500/30">Join Fleet Protocols →</Link>
                                <p className="mt-8 text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">Est. Sync Time: <span className="text-slate-500">4 Minutes</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Requirements Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
                        <div className="space-y-12">
                            <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter leading-tight uppercase">Fleet Entry <br />Requirements.</h2>
                            <ul className="space-y-6">
                                {[
                                    "18+ years of age & State ID",
                                    "Valid driver's license (if driving)",
                                    "Personal vehicle (Car, Scooter, or Bike)",
                                    "Social Security Number Verification",
                                    "iOS / Android Protocol Terminal"
                                ].map((req, i) => (
                                    <li key={i} className="flex items-center gap-6 text-slate-400 text-lg font-black tracking-tight italic uppercase">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10 font-sans not-italic">✓</div>
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-col justify-center">
                            <div className="p-12 md:p-16 bg-white/[0.03] border border-white/5 rounded-[3rem] relative overflow-hidden group">
                               <div className="absolute top-0 right-0 p-12 text-8xl opacity-5 group-hover:scale-110 transition-transform">💸</div>
                               <h3 className="text-3xl font-black text-white italic mb-6 tracking-tight uppercase">Instant Settlement.</h3>
                               <p className="text-slate-400 text-base font-medium leading-relaxed mb-10 italic">Withdraw your earnings to any supported debit card instantly after your shift concludes. Zero lag.</p>
                               <Link href="/driver-signup" className="btn-standard py-4 px-12 text-[10px] shadow-emerald-500/20">Sign Up Instantly</Link>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Feature Stack */}
                    <div className="p-12 md:p-20 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[4rem] text-center shadow-2xl">
                        <h2 className="text-4xl md:text-6xl font-black mb-8 text-white italic tracking-tighter uppercase leading-none">Fleet First <br />Economy.</h2>
                        <p className="text-slate-500 text-lg mb-16 max-w-3xl mx-auto font-medium italic">We're a delivery standard designed to help local gems thrive while ensuring our drivers earn what they deserve.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full text-white">
                            {[{ icon: '🛵', label: 'Fair Miles' }, { icon: '🛡️', label: 'SOS Link' }, { icon: '💸', label: 'T+0 Pay' }, { icon: '💎', label: 'Fleet Tier' }].map((item) => (
                                <div key={item.label} className="p-10 rounded-[2.5rem] bg-black/60 border border-white/5 flex flex-col items-center group cursor-pointer hover:border-emerald-500/20 transition-all">
                                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest group-hover:text-emerald-500 transition-colors">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-20 bg-black border-t border-white/5">
                <div className="container max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 border border-white/10 rounded-full" />
                        <span className="font-black text-slate-500 tracking-tighter text-xl">TrueServe Fleet &copy; {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-end gap-x-12 gap-y-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-600">
                        <Link href="/legal" className="hover:text-white transition-colors">Safety Standard</Link>
                        <Link href="/legal" className="hover:text-white transition-colors">Fleet Terms</Link>
                        <Link href="/driver/login" className="hover:text-white transition-colors text-emerald-500 italic">Fleet Entry</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
