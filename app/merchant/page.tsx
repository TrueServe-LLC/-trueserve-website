"use client";

import Link from "next/link";
import { useState, Suspense } from "react";

export const dynamic = "force-dynamic";

export default function MerchantPortal() {
    const [selectedPlan, setSelectedPlan] = useState<string>("");

    const scrollToForm = (plan: string) => {
        setSelectedPlan(plan);
        const form = document.getElementById("inquiry-form");
        if (form) {
            form.scrollIntoView({ behavior: "smooth" });
        }
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
                        <Link href="/merchant" className="text-[11px] font-bold uppercase tracking-widest text-primary">Partner Hub</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/login?role=merchant" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white border-b-2 border-transparent hover:border-primary transition-all pb-1">Sign In</Link>
                    <Link href="/merchant-signup" className="badge-solid-primary py-3 px-8 text-[10px] font-bold">
                        Partner Sign Up
                    </Link>
                </div>
            </nav>

            <main className="container py-24 space-y-48 animate-fade-in">
                  {/* Premium Header Title Stack: Screenshot 2 Style */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 max-w-7xl">
                    <div className="space-y-10">
                        <div className="flex items-center gap-4 text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">
                            <div className="w-8 h-px bg-slate-800" />
                            Merchant Tools
                        </div>
                        <h1 className="text-5xl md:text-[110px] font-serif text-white tracking-tight leading-[0.85] font-bold italic">
                            Manage orders and <br />
                            <span className="text-primary not-italic">track deliveries</span> in real time.
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mt-8">
                            Everything you need to run your food business efficiently. Real-time order visibility, delivery tracking, and merchant controls built into one intuitive dashboard.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-6 pt-10">
                            <Link href="/merchant-signup" className="badge-solid-primary px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] rounded-full shadow-2xl">
                                Partner Sign Up
                            </Link>
                            <Link href="#inquiry-form" className="badge-outline-white !bg-white/5 border border-white/10 hover:!bg-white/10 text-white px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] rounded-full backdrop-blur-md transition-all">
                                Learn more
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Content Enclosure */}
                <div className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 md:p-24 shadow-3xl space-y-48">
                    
                    {/* ── PRICING PLANS ─────────────────────────────────────────────── */}
                    <div className="space-y-32">
                        <div className="text-center space-y-8">
                             <div className="flex items-center justify-center gap-4 text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">
                                <div className="w-8 h-px bg-slate-800" />
                                Growth Protocols
                                <div className="w-8 h-px bg-slate-800" />
                             </div>
                             <h2 className="text-5xl md:text-8xl text-white font-serif font-bold italic tracking-tight leading-none">
                                Your Margin. <br />
                                <span className="text-primary not-italic">Our Mission.</span>
                             </h2>
                        </div>

                        {/* Pricing Cards: Screenshot 3 Style */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                            {[
                                {
                                    name: "Starter",
                                    amount: "15%",
                                    sub: "per order",
                                    desc: "Perfect for restaurants just getting started with TrueServe LLC delivery.",
                                    features: ["Commission per delivery", "Basic order management", "Real-time tracking", "Email support", "Mobile-friendly portal", "Local South Carolina coverage"],
                                    cta: "Get started",
                                    isHighlighted: false
                                },
                                {
                                    name: "Growth",
                                    amount: "12%",
                                    sub: "per order",
                                    desc: "For restaurants scaling their delivery business with TrueServe LLC.",
                                    features: ["Reduced commission rate", "Advanced analytics dashboard", "Priority support", "Custom menu uploads", "Marketing materials included", "Dedicated onboarding"],
                                    cta: "Schedule demo",
                                    isHighlighted: true
                                }
                            ].map((plan, i) => (
                                <div key={i} className={`flex flex-col p-12 md:p-16 rounded-[2.5rem] border ${plan.isHighlighted ? 'border-primary bg-primary/5 shadow-[0_30px_60px_-12px_rgba(245,158,11,0.2)]' : 'border-white/10 bg-white/[0.02]'} space-y-12 transition-all hover:scale-[1.01]`}>
                                    <div className="space-y-8">
                                        <h3 className="text-4xl font-serif text-white font-bold tracking-tight italic">{plan.name}</h3>
                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-6xl md:text-8xl font-bold text-white tracking-tighter">{plan.amount}</span>
                                                <span className="text-xl md:text-2xl text-slate-400 font-medium font-serif italic">{plan.sub}</span>
                                            </div>
                                        </div>
                                        <p className="text-slate-400 text-lg font-medium leading-relaxed">
                                            {plan.desc}
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <Link 
                                            onClick={() => scrollToForm(plan.name)} 
                                            href="/merchant-signup" 
                                            className={`w-full inline-flex justify-center items-center py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border-2 ${plan.isHighlighted ? 'bg-primary border-primary text-black shadow-2xl shadow-primary/30' : 'bg-transparent border-white/20 text-white hover:bg-white/10'}`}
                                        >
                                            {plan.cta}
                                        </Link>
                                    </div>

                                    <div className="space-y-8 pt-8">
                                        <h4 className="text-white text-2xl font-serif font-black italic">Features:</h4>
                                        <ul className="space-y-6">
                                            {plan.features.map((f, j) => (
                                                <li key={j} className="flex items-start gap-4 text-slate-300 text-base font-medium font-sans">
                                                    <span className="text-primary mt-1">✓</span>
                                                    <span>{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── PARTNER INQUIRY ─────────────────────────────────────────── */}
                        <div id="inquiry-form" className="relative p-12 md:p-24 bg-white/[0.02] border border-white/5 rounded-[4rem] text-center overflow-hidden">
                             <div className="absolute inset-0 opacity-10 grayscale scroll-reveal">
                                <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2074&auto=format&fit=crop" className="w-full h-full object-cover" />
                             </div>
                             <div className="relative z-10 space-y-10">
                                <div className="flex items-center justify-center gap-4 text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">
                                    <div className="w-8 h-px bg-slate-800" />
                                    Onboarding
                                    <div className="w-8 h-px bg-slate-800" />
                                </div>
                                <h3 className="text-4xl md:text-7xl text-white font-serif italic font-bold">Apply to Join <br />the Network</h3>
                                <div className="max-w-xl mx-auto space-y-8">
                                    <Link href="/merchant-signup" className="badge-solid-primary w-full py-8 text-xs font-black shadow-primary/40 uppercase tracking-[0.2em]">Start Merchant Application →</Link>
                                    <div className="flex justify-center gap-12 border-t border-white/5 pt-8">
                                        <div>
                                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Response Time</p>
                                            <p className="text-white text-xs font-bold font-serif italic">24 Hours</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Setup Cost</p>
                                            <p className="text-white text-xs font-bold font-serif italic">$0.00 USD</p>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Value Props Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 px-4 border-t border-white/5 pt-24">
                        <div className="col-span-full mb-8">
                            <div className="flex items-center gap-4 text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">
                                <div className="w-8 h-px bg-slate-800" />
                                Operational Standards
                            </div>
                        </div>
                        {[
                            { icon: '🎯', title: 'Customer Hub', desc: 'Instantly connect with hungry diners in your neighborhood grid.' },
                            { icon: '⚡', title: 'Elite Dispatch', desc: 'High-velocity engine that ensures food stays hot and fresh.' },
                            { icon: '🌐', title: 'Digital Base', desc: 'Free professional storefront for your business operations.' },
                            { icon: '💎', title: 'Direct Margin', desc: 'Zero hidden fees and a split that respects your bottom line.' }
                        ].map((row, i) => (
                            <div key={i} className="space-y-8 group">
                                <div className="text-5xl group-hover:scale-110 transition-transform opacity-30">{row.icon}</div>
                                <h3 className="text-2xl text-white font-serif italic">{row.title}</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">{row.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Feature Stack */}
                    <div className="p-16 md:p-32 bg-primary/[0.02] border border-primary/10 rounded-[5rem] text-center shadow-2xl space-y-12">
                        <h2 className="text-5xl md:text-8xl text-white font-serif italic leading-none tracking-tighter">Marketplace <br />Revolution.</h2>
                        <p className="text-slate-400 text-lg md:text-2xl mb-16 max-w-3xl mx-auto font-medium leading-relaxed">TrueServe isn&apos;t just an app. We&apos;re a delivery standard designed to help local gems flourish without sacrificing their hard-earned margins.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto pt-12">
                            {[
                                { label: "Local Priority", icon: "📍", desc: "We prioritize local brands over global chains." },
                                { label: "Fair Splits", icon: "🤝", desc: "Drivers earn more, restaurants keep more." },
                                { label: "Rapid Sync", icon: "🔄", desc: "Integration with your POS in minutes." }
                            ].map((item) => (
                                <div key={item.label} className="p-12 rounded-[3.5rem] bg-[#080c14] border border-white/5 flex flex-col items-center group cursor-pointer hover:border-primary/30 transition-all shadow-xl">
                                    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform opacity-40">{item.icon}</div>
                                    <h4 className="text-[12px] font-bold uppercase text-white tracking-[0.2em] mb-4">{item.label}</h4>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
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
                        <span className="font-serif text-slate-500 tracking-tight text-2xl italic uppercase">TrueServe Network &copy; {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-end gap-x-12 gap-y-6 text-[11px] font-bold uppercase tracking-[0.4em] text-slate-600">
                        <Link href="/restaurants" className="hover:text-white transition-colors">Marketplace</Link>
                        <Link href="/driver" className="hover:text-primary transition-colors">Fleet Hub</Link>
                        <Link href="/login?role=merchant" className="hover:text-primary transition-colors text-primary italic">Partner Entry</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
