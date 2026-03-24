"use client";

import { useRef, useState, Suspense } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function DriverPortal() {
    const formRef = useRef<HTMLDivElement>(null);

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#080c14] text-slate-300 selection:bg-primary/30 font-sans">
            {/* Standardized Sticky Nav */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#080c14]/80 border-b border-white/5 px-8 py-5 flex justify-between items-center">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-xl" />
                        <span className="text-2xl font-black text-white tracking-tight font-serif italic text-white">TrueServe</span>
                    </Link>
                    <div className="h-6 w-px bg-white/10 mx-2 hidden lg:block"></div>
                    <nav className="hidden lg:flex items-center gap-8">
                        <Link href="/restaurants" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Marketplace</Link>
                        <Link href="/driver" className="text-[11px] font-bold uppercase tracking-widest text-primary">Fleet Hub</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/driver/login" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white border-b-2 border-transparent hover:border-primary transition-all pb-1">Fleet Login</Link>
                    <Link href="/driver-signup" className="badge-solid-primary py-3 px-8 text-[10px] font-bold">
                        Driver Sign Up
                    </Link>
                </div>
            </nav>

            <main className="container py-24 space-y-48 animate-fade-in">
                {/* Premium Header Title Stack */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 max-w-6xl">
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-4xl shadow-2xl">🛵</div>
                        <h1 className="text-5xl md:text-8xl font-serif text-white tracking-tight leading-none italic">
                            The Fleet Hub.
                        </h1>
                        <p className="text-slate-500 text-sm md:text-lg font-bold uppercase tracking-[0.2em] mt-4">
                            Logistics for the neighborhood, engineered for drivers.
                        </p>
                    </div>
                </div>

                {/* Main Content Enclosure */}
                <div className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 md:p-24 shadow-3xl space-y-48">
                    
                    {/* Hero Section inside Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-12">
                            <h2 className="text-4xl md:text-6xl text-white font-serif leading-tight italic">Your City. <br /><span className="text-primary not-italic">Your Schedule.</span></h2>
                            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-lg mb-8">
                                Become your own boss. TrueServe pays 25-40% more by prioritizing mileage-based earnings and fair driver splits. 
                                Join the network that values your time and impact.
                            </p>
                            <Link href="/driver-signup" className="badge-solid-primary px-16 py-6 text-xs font-black shadow-primary/20">Apply Instantly →</Link>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-12">
                                {[
                                    { label: "Base Pay", value: "$3.00+", icon: "💰" },
                                    { label: "Mileage", value: "$0.70/mi", icon: "📍" },
                                    { label: "Wait Pay", value: "$0.25/min", icon: "⏰" },
                                    { label: "Tips", value: "100%", icon: "✨" }
                                ].map((row, i) => (
                                    <div key={i} className="flex flex-col p-10 bg-white/[0.03] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.06] transition-all shadow-xl group cursor-pointer">
                                        <div className="text-3xl mb-6 group-hover:scale-110 transition-transform opacity-60">{row.icon}</div>
                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">{row.label}</p>
                                        <p className="text-2xl font-serif text-white group-hover:text-primary transition-colors italic">{row.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Visual Block */}
                        <div className="relative group aspect-square lg:aspect-auto lg:h-full">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/10 rounded-[4rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative bg-[#080c14] border border-white/10 rounded-[4rem] p-16 md:p-24 shadow-3xl text-center overflow-hidden h-full flex flex-col justify-center min-h-[500px]">
                                <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-[#080c14]/60 to-transparent"></div>
                                <div className="relative z-10 space-y-8">
                                    <h3 className="text-4xl md:text-5xl text-white font-serif italic tracking-tight uppercase">Driver <br />Onboarding</h3>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest pb-8 border-b border-white/10 italic">Join the most efficient delivery network in the Southeast.</p>
                                    <Link href="/driver-signup" className="badge-solid-primary w-full py-8 text-xs font-black shadow-primary/40 uppercase tracking-[0.2em]">Start Application →</Link>
                                    <p className="mt-8 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Est. Setup Time: <span className="text-slate-300 whitespace-nowrap">4 Minutes</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Requirements / Values Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                        <div className="space-y-12">
                            <h2 className="text-4xl md:text-7xl text-white font-serif italic leading-none lg:text-8xl">Requirements.</h2>
                            <ul className="space-y-6">
                                {[
                                    "18+ years of age & State ID",
                                    "Valid driver's license",
                                    "Personal vehicle (Car/Scooter/Bike)",
                                    "SSN Verification",
                                    "iOS / Android Device"
                                ].map((req, i) => (
                                    <li key={i} className="flex items-center gap-6 text-slate-300 text-base md:text-lg font-bold italic tracking-tight uppercase leading-none">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-lg font-sans not-italic text-sm">✓</div>
                                        <span className="truncate">{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white/[0.03] border border-white/5 rounded-[3rem] p-16 space-y-8 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-12 text-8xl opacity-10 group-hover:scale-110 transition-transform">💸</div>
                           <h3 className="text-4xl text-white font-serif italic">Instant Settlement.</h3>
                           <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">
                             Withdraw your earnings to any supported debit card instantly after your shift concludes. Zero lag.
                           </p>
                           <Link href="/driver-signup" className="badge-solid-primary py-4 px-12 text-[10px] font-black">Sign Up Instantly</Link>
                        </div>
                    </div>

                    {/* Bottom Feature Stack */}
                    <div className="p-16 md:p-32 bg-primary/[0.02] border border-primary/10 rounded-[5rem] text-center shadow-2xl space-y-12">
                        <h2 className="text-5xl md:text-8xl text-white font-serif italic leading-none tracking-tighter">Fleet First <br />Economy.</h2>
                        <p className="text-slate-400 text-lg md:text-2xl mb-16 max-w-3xl mx-auto font-medium leading-relaxed">We&apos;re a delivery standard designed to help local gems thrive while ensuring our drivers earn what they deserve.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-white">
                            {[{ icon: '🛵', label: 'Fair Miles' }, { icon: '🛡️', label: 'SOS Link' }, { icon: '💸', label: 'T+0 Pay' }, { icon: '💎', label: 'Fleet Tier' }].map((item) => (
                                <div key={item.label} className="p-10 rounded-[2.5rem] bg-[#080c14] border border-white/5 flex flex-col items-center group cursor-pointer hover:border-primary/30 transition-all shadow-xl">
                                    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform opacity-30">{item.icon}</div>
                                    <p className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] group-hover:text-primary transition-colors whitespace-nowrap">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-32 bg-[#080c14] border-t border-white/5">
                <div className="container px-8 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-xl" />
                        <span className="font-serif text-slate-500 tracking-tight text-2xl italic uppercase">TrueServe Fleet &copy; {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-end gap-x-12 gap-y-6 text-[11px] font-bold uppercase tracking-[0.4em] text-slate-600">
                        <Link href="/legal" className="hover:text-white transition-colors">Safety Standard</Link>
                        <Link href="/legal" className="hover:text-white transition-colors">Fleet Terms</Link>
                        <Link href="/driver/login" className="hover:text-white transition-colors text-primary italic">Fleet Entry</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
