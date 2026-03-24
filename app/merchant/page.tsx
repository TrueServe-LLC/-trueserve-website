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
            <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#080c14]/80 border-b border-primary/10 px-8 py-5 flex justify-between items-center">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-xl border border-primary/20" />
                        <span className="text-2xl font-black text-white tracking-tight font-serif italic text-white">True<span className="text-primary not-italic uppercase tracking-widest text-lg font-sans">Serve</span></span>
                    </Link>
                    <div className="h-6 w-px bg-white/10 mx-2 hidden lg:block"></div>
                    <nav className="hidden lg:flex items-center gap-8">
                        <Link href="/restaurants" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Marketplace</Link>
                        <Link href="/merchant" className="text-[11px] font-bold uppercase tracking-widest text-primary">Partner Hub</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/login?role=merchant" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white border-b-2 border-transparent hover:border-primary transition-all pb-1">Sign In</Link>
                    <Link href="/merchant-signup" className="badge-solid-primary !py-3 !px-8 !text-sm">
                        Partner Sign Up
                    </Link>
                </div>
            </nav>

            <main className="container py-24 space-y-48 animate-fade-in">
                  {/* Premium Header Title Stack: Screenshot 2 Style */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 max-w-7xl">
                    <div className="space-y-10">
                        <div className="flex items-center gap-4 text-primary font-black uppercase tracking-[0.4em] text-[10px]">
                            <div className="w-8 h-px bg-primary/30" />
                            Merchant Tools
                        </div>
                        <h1 className="text-5xl md:text-[110px] font-serif text-white tracking-tight leading-[0.85] font-bold italic">
                            Manage <span className="text-primary not-italic">orders</span> and <br />
                            track deliveries in <span className="text-primary not-italic">real time.</span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mt-8">
                            Everything you need to run your food business efficiently. Real-time order visibility, delivery tracking, and merchant controls built into one intuitive dashboard.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-6 pt-10">
                            <Link href="/merchant-signup" className="badge-solid-primary">
                                Partner Sign Up
                            </Link>
                            <Link href="#inquiry-form" className="badge-outline-white">
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
                             <div className="flex items-center justify-center gap-4 text-primary font-black uppercase tracking-[0.4em] text-[10px]">
                                <div className="w-8 h-px bg-primary/30" />
                                Growth Protocols
                                <div className="w-8 h-px bg-primary/30" />
                             </div>
                             <h2 className="text-5xl md:text-8xl text-white font-serif font-bold italic tracking-tight leading-none">
                                Your <span className="text-primary not-italic">Margin.</span> <br />
                                Our <span className="text-primary not-italic">Mission.</span>
                             </h2>
                        </div>

                        {/* Pricing Cards: Refined Block Design */}
                        <div className="flex justify-center w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl w-full items-stretch">
                                {[
                                    {
                                        name: "Flex Plan",
                                        amount: "15%",
                                        sub: "per order",
                                        desc: "Perfect for restaurants just getting started with TrueServe LLC delivery.",
                                        features: ["Commission per delivery", "Basic order management", "Real-time tracking", "Email support", "Mobile-friendly portal", "Local South Carolina coverage"],
                                        cta: "Choose plan",
                                        isHighlighted: true
                                    },
                                    {
                                        name: "Pro Plan",
                                        amount: "12%",
                                        sub: "per order",
                                        desc: "For restaurants scaling their delivery business with TrueServe LLC.",
                                        features: ["Reduced commission rate", "Advanced analytics dashboard", "Priority support", "Custom menu uploads", "Marketing materials included", "Dedicated onboarding"],
                                        cta: "Choose plan",
                                        isHighlighted: true
                                    }
                                ].map((plan, i) => (
                                    <div key={i} className="flex flex-col p-8 md:p-10 rounded-[2.5rem] border border-primary/20 bg-white/[0.03] shadow-2xl space-y-8 transition-all hover:scale-[1.01]">
                                        <div className="space-y-4 flex-grow">
                                            <h3 className="text-xl md:text-2xl font-sans text-white font-black tracking-tight uppercase">{plan.name}</h3>
                                            <div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">{plan.amount}</span>
                                                    <span className="text-sm text-slate-500 font-medium">{plan.sub}</span>
                                                </div>
                                            </div>
                                            <p className="text-slate-500 text-sm leading-relaxed">
                                                {plan.desc}
                                            </p>
                                            
                                            <div className="pt-4">
                                                <Link 
                                                    onClick={() => scrollToForm(plan.name)} 
                                                    href="/merchant-signup" 
                                                    className="w-full badge-solid-primary"
                                                >
                                                    {plan.cta}
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="space-y-4 border-t border-white/5 pt-8">
                                            <h4 className="text-white text-lg font-serif italic font-semibold">Features:</h4>
                                            <ul className="space-y-3">
                                                {plan.features.map((f, j) => (
                                                    <li key={j} className="flex items-center gap-3 text-slate-500 text-[13px] font-medium">
                                                        <span className="text-primary text-sm">✓</span>
                                                        <span>{f}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── PARTNER INQUIRY ─────────────────────────────────────────── */}
                        <div id="inquiry-form" className="relative p-12 md:p-16 bg-white/[0.02] border border-white/5 rounded-[3rem] flex flex-col items-center text-center overflow-hidden">
                             <div className="absolute inset-0 opacity-10 grayscale scroll-reveal">
                                <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2074&auto=format&fit=crop" className="w-full h-full object-cover" />
                             </div>
                             <div className="relative z-10 flex flex-col items-center space-y-8">
                                <div className="flex items-center justify-center gap-4 text-slate-500 font-black uppercase tracking-[0.4em] text-[9px]">
                                    <div className="w-8 h-px bg-slate-800" />
                                    Onboarding
                                    <div className="w-8 h-px bg-slate-800" />
                                </div>
                                <h3 className="text-2xl md:text-5xl text-white font-serif italic font-black leading-[1.1] text-center max-w-xl uppercase">Apply to Join <br />the Network</h3>
                                <div className="w-full max-w-xl flex flex-col items-center space-y-8">
                                    <div className="pt-2">
                                        <Link href="/merchant-signup" className="badge-solid-primary inline-flex items-center">
                                            Start Merchant Application <span className="ml-2">→</span>
                                        </Link>
                                    </div>
                                    <div className="flex justify-center gap-10 border-t border-white/5 pt-8 w-full opacity-60">
                                        <div>
                                            <p className="text-slate-500 text-[7px] font-black uppercase tracking-widest mb-1">Response Time</p>
                                            <p className="text-white text-xs font-bold font-serif italic uppercase">24 Hours</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-[7px] font-black uppercase tracking-widest mb-1">Setup Cost</p>
                                            <p className="text-white text-xs font-bold font-serif italic uppercase">$0.00 USD</p>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Value Props Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 px-4 border-t border-white/5 pt-32">
                        <div className="col-span-full mb-8">
                            <div className="flex items-center gap-4 text-primary font-black uppercase tracking-[0.4em] text-[10px]">
                                <div className="w-8 h-px bg-primary/30" />
                                Operational Standards
                            </div>
                        </div>
                        {[
                            { icon: '🎯', title: 'Customer Hub', desc: 'Instantly connect with hungry diners in your neighborhood grid.' },
                            { icon: '⚡', title: 'Elite Dispatch', desc: 'High-velocity engine that ensures food stays hot and fresh.' },
                            { icon: '🌐', title: 'Digital Base', desc: 'Free professional storefront for your business operations.' },
                            { icon: '💎', title: 'Direct Margin', desc: 'Zero hidden fees and a split that respects your bottom line.' },
                            { icon: '📍', title: "Local Priority", desc: "We prioritize local brands over global chains." },
                            { icon: '🤝', title: "Fair Splits", desc: "Drivers earn more, restaurants keep more." },
                            { icon: '🔄', title: "Rapid Sync", desc: "Integration with your POS in minutes." }
                        ].map((row, i) => (
                            <div key={i} className="space-y-6 group">
                                <div className="text-4xl group-hover:scale-110 transition-transform opacity-40">{row.icon}</div>
                                <h3 className="text-xl text-white font-serif italic group-hover:text-primary transition-colors">{row.title}</h3>
                                <p className="text-slate-500 text-xs font-medium leading-relaxed">{row.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Feature Stack Simplified - Fixed Center Alignment */}
                    <div className="py-24 text-center max-w-4xl mx-auto px-6 space-y-12">
                        <div className="flex flex-col items-center justify-center space-y-6">
                            <h2 className="text-5xl md:text-7xl text-white font-serif font-bold italic leading-tight tracking-tighter">
                                A Marketplace <br />
                                <span className="text-primary not-italic font-sans font-black uppercase tracking-widest text-4xl md:text-6xl">Revolution.</span>
                            </h2>
                            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed text-center max-w-2xl mx-auto">
                                <span className="text-primary">TrueServe</span> isn&apos;t just an app. We&apos;re a delivery standard designed to help local gems flourish without sacrificing margins.
                            </p>
                        </div>
                        <div className="pt-8">
                             <Link href="/merchant-signup" className="badge-solid-primary !px-16 !py-6">
                                Join the Network
                             </Link>
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
