"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { submitMerchantInquiry } from "./actions";
import AddressInput from "@/components/AddressInput";

const initialState = {
    message: "",
    success: false,
    error: false,
};

export default function MerchantPortal() {
    const [state, formAction, isPending] = useActionState(submitMerchantInquiry, initialState);
    const [selectedPlan, setSelectedPlan] = useState<string>("");
    const [formAddress, setFormAddress] = useState({ address: "", city: "", state: "NC" });

    const scrollToForm = (plan: string) => {
        setSelectedPlan(plan);
        const form = document.getElementById("inquiry-form");
        if (form) {
            form.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleAddressSelect = (address: string, lat: number, lng: number) => {
        // Simple heuristic to split address for the form fields
        // In a real app, we'd use Google's address components
        const parts = address.split(', ');
        if (parts.length >= 3) {
            setFormAddress({
                address: parts[0],
                city: parts[1],
                state: parts[2].split(' ')[0] || "NC"
            });
        } else {
            setFormAddress({ ...formAddress, address });
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30 font-sans">
            {/* Global Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[180px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[150px]" />
            </div>

            {/* Premium Navigation */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.05] px-6 py-4 bg-black/80">
                <div className="container mx-auto flex justify-between items-center max-w-7xl">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
                        <span className="text-xl font-bold tracking-tight">
                            True<span className="text-primary">Serve</span> for Merchants
                        </span>
                    </Link>
                    <div className="hidden md:flex gap-8 items-center text-sm font-medium text-slate-400">
                        <button onClick={() => scrollToForm("")} className="hover:text-white transition-colors">How it works</button>
                        <button onClick={() => scrollToForm("")} className="hover:text-white transition-colors">Pricing</button>
                        <Link href="/login" className="hover:text-white transition-colors">Log In</Link>
                        <button onClick={() => scrollToForm("")} className="btn btn-primary !py-2 !px-5 rounded-lg font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20">Get Started</button>
                    </div>
                </div>
            </nav>

            <main className="relative z-10">
                {/* B2B Split Hero */}
                <section className="relative min-h-[70vh] flex items-center pt-20 pb-32">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8 text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                    </span>
                                    Partnering with 500+ Local Kitchens
                                </div>
                                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                                    Unlock new <br />
                                    revenue with <span className="text-primary italic">TrueServe.</span>
                                </h1>
                                <p className="text-slate-400 text-lg md:text-xl max-w-xl leading-relaxed font-medium">
                                    The delivery platform built for the local margin. Zero hidden fees, fair dispatch, and a marketplace that prioritizes your brand.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button onClick={() => scrollToForm("")} className="btn btn-primary py-4 px-10 rounded-xl text-sm font-bold uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                                        Get Started Now
                                    </button>
                                    <button onClick={() => scrollToForm("")} className="px-10 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-all">
                                        View Pricing
                                    </button>
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-transparent blur-2xl opacity-50"></div>
                                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                                    <img
                                        src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200&auto=format&fit=crop"
                                        className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                                        alt="Professional Kitchen"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Scaling Options - Primary Value Focus */}
                <section className="py-24 relative border-t border-white/5">
                    <div className="container mx-auto px-6 max-w-7xl">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto items-stretch">
                            {/* Flex Scale Banner */}
                            <div className={`relative overflow-hidden flex flex-col xl:flex-row items-center cursor-pointer transition-all duration-300 ${selectedPlan === 'Flex Options' ? 'ring-4 ring-[#6B71F2]' : 'border border-white/5'} rounded-3xl bg-[#1C1A3B]`} onClick={() => scrollToForm("Flex Options")}>
                                <div className="p-8 md:p-10 flex-1 z-10 w-full xl:w-1/2">
                                    <h3 className="text-3xl font-extrabold text-white mb-2">Flex Scale</h3>
                                    <p className="text-white/80 text-lg mb-8 leading-tight">15% Split <br /> On-demand growth.</p>
                                    <button className="bg-[#6B71F2] hover:bg-[#5b61de] text-white px-8 py-3 rounded-full font-bold transition-colors w-max shadow-lg shadow-[#6B71F2]/20">Choose Flex</button>
                                </div>
                                <div className="p-8 md:p-10 flex-1 z-10 w-full xl:w-1/2 xl:flex xl:items-center xl:justify-end xl:pl-0">
                                    <ul className="space-y-3 w-full">
                                        {["Zero upfront setup", "Full engine access", "Standard local badge", "Cancel anytime"].map((feat, i) => (
                                            <li key={i} className="flex justify-between items-center text-white/90 text-sm font-bold bg-white/5 px-4 py-3 rounded-xl border border-white/10 backdrop-blur-sm shadow-sm text-left">
                                                <span>{feat}</span>
                                                <div className="w-5 h-5 rounded-full bg-[#6B71F2]/20 flex items-center justify-center text-[10px] text-[#6B71F2] shrink-0">✔</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#6B71F2] opacity-20 blur-[100px] rounded-full pointer-events-none"></div>
                            </div>

                            {/* Pro Scale Banner */}
                            <div className={`relative overflow-hidden flex flex-col xl:flex-row items-center cursor-pointer transition-all duration-300 ${selectedPlan === 'Pro Subscription' ? 'ring-4 ring-[#0D2440]' : 'border border-[#F29F29]/20'} border-[#F29F29]/20 rounded-3xl bg-[#F29F29]`} onClick={() => scrollToForm("Pro Subscription")}>
                                <div className="p-8 md:p-10 flex-1 z-10 w-full xl:w-1/2">
                                    <h3 className="text-3xl font-extrabold text-[#0D2440] mb-2">Pro Scale</h3>
                                    <p className="text-[#0D2440]/80 text-lg mb-8 leading-tight">$199 Monthly <br /> High-Volume Optimized.</p>
                                    <button className="bg-[#0D2440] hover:bg-[#0a1c33] text-white px-8 py-3 rounded-full font-bold transition-colors w-max shadow-lg shadow-[#0D2440]/20">Choose Pro</button>
                                </div>
                                <div className="p-8 md:p-10 flex-1 z-10 w-full xl:w-1/2 xl:flex xl:items-center xl:justify-end xl:pl-0">
                                    <ul className="space-y-3 w-full">
                                        {["0% Split logic", "VIP Merchant Status", "Custom dispatch logic", "Performance Analytics"].map((feat, i) => (
                                            <li key={i} className="flex justify-between items-center text-[#0D2440] text-sm font-bold bg-white/30 px-4 py-3 rounded-xl border border-[#0D2440]/10 backdrop-blur-sm shadow-sm text-left">
                                                <span>{feat}</span>
                                                <div className="w-5 h-5 rounded-full bg-[#0D2440]/20 flex items-center justify-center text-[10px] text-[#0D2440] shrink-0">✔</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Value Props - Why Partner */}
                <section className="py-24 bg-white/[0.01]">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">Why partner with TrueServe?</h2>
                            <p className="text-slate-400 font-medium italic">Engineered for the modern merchant ecosystem.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {[
                                { title: "Reach more customers", desc: "Instantly connect with hungry diners in your immediate neighborhood and beyond.", icon: "🎯" },
                                { title: "Deliver with ease", desc: "Our high-velocity dispatch engine ensures your food stays hot and delivery stays fast.", icon: "⚡" },
                                { title: "Keep your margin", desc: "TrueScale protocols mean no hidden fees and a split that respects your bottom line.", icon: "💰" }
                            ].map((prop, i) => (
                                <div key={i} className="space-y-4">
                                    <div className="text-4xl mb-6">{prop.icon}</div>
                                    <h3 className="text-xl font-bold text-white">{prop.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed font-medium">{prop.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Enrollment Form */}
                <section id="inquiry-form" className="py-24 border-t border-white/5 relative overflow-hidden">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="max-w-5xl mx-auto bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                            <div className="grid grid-cols-1 md:grid-cols-5 min-h-[600px]">
                                {/* Left Side - Brand Promise */}
                                <div className="md:col-span-2 bg-primary p-12 flex flex-col justify-between items-start">
                                    <div className="space-y-8">
                                        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-2xl shadow-2xl">🤝</div>
                                        <h2 className="text-4xl font-extrabold text-black leading-[1.1] tracking-tighter italic">
                                            Be a part <br /> of the <br />
                                            <span className="bg-black text-white px-3 py-1 inline-block mt-2">TrueServe</span> <br />
                                            network.
                                        </h2>
                                        <p className="text-black/80 text-sm font-bold leading-relaxed max-w-[240px]">
                                            Join 500+ premium merchants reclaiming their local margin.
                                        </p>
                                    </div>
                                    <div className="space-y-4 pt-12">
                                        <div className="flex items-center gap-3 text-black text-[10px] font-black uppercase tracking-widest">
                                            <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center border border-black/10">🛡️</div>
                                            Secure Enrollment
                                        </div>
                                        <div className="flex items-center gap-3 text-black text-[10px] font-black uppercase tracking-widest">
                                            <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center border border-black/10">⚡</div>
                                            Fast Onboarding
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side - Form */}
                                <div className="md:col-span-3 p-12 lg:p-16 bg-[#0f0f0f]">
                                    <div className="mb-10">
                                        <span className="text-primary font-black uppercase tracking-widest text-[9px] mb-2 block">Application Protocol</span>
                                        <h3 className="text-2xl font-bold text-white tracking-tight italic">Partner Inquiry</h3>
                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                                            Selection: <span className="text-white">{selectedPlan ? selectedPlan : "Standard Protocol"}</span>
                                        </p>
                                    </div>

                                    {state.success ? (
                                        <div className="text-center py-20 animate-fade-in flex flex-col items-center">
                                            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-5xl mb-8 border border-primary/30 shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]">🛡️</div>
                                            <h3 className="text-3xl font-black text-white mb-4 tracking-tighter italic">Enrollment Active.</h3>
                                            <p className="text-slate-400 mb-12 text-sm font-bold leading-relaxed max-w-sm">{state.message}</p>
                                            <Link href="/merchant/dashboard" className="btn btn-primary w-full py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl">
                                                Access Command Center
                                            </Link>
                                        </div>
                                    ) : (
                                        <form action={formAction} className="space-y-8">
                                            {state.error && (
                                                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-100 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                                                    {state.message}
                                                </div>
                                            )}

                                            <div className="space-y-6">
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1 mb-2 block">Business Identity</label>
                                                    <input name="restaurantName" type="text" required placeholder="Legal Restaurant Name" className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all font-bold placeholder:text-slate-800" />
                                                </div>

                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1 mb-2 block">POC Name</label>
                                                        <input name="contactName" type="text" required placeholder="Owner/Manager" className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all font-bold placeholder:text-slate-800" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
                                                        <input name="email" type="email" required placeholder="business@email.com" className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all font-bold placeholder:text-slate-800" />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1 mb-2 block">Secure Access</label>
                                                    <input name="password" type="password" required minLength={8} placeholder="Create Portal Password" className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all font-bold placeholder:text-slate-800" />
                                                </div>

                                                <div className="pt-4 border-t border-white/5">
                                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1 mb-4 block">Storefront Location</label>
                                                    <div className="space-y-4">
                                                        <AddressInput onAddressSelect={handleAddressSelect} initialAddress={formAddress.address} />
                                                        <input type="hidden" name="address" value={formAddress.address} />

                                                        <div className="grid grid-cols-3 gap-4">
                                                            <input name="city" type="text" required placeholder="City" value={formAddress.city} onChange={(e) => setFormAddress({ ...formAddress, city: e.target.value })} className="col-span-1 w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-bold placeholder:text-slate-800" />
                                                            <div className="relative col-span-1">
                                                                <select name="state" value={formAddress.state} onChange={(e) => setFormAddress({ ...formAddress, state: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none font-bold" required>
                                                                    <option value="NC">NC</option>
                                                                    <option value="SC">SC</option>
                                                                </select>
                                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 text-[10px]">▼</div>
                                                            </div>
                                                            <input name="zip" type="text" placeholder="Zip" className="col-span-1 w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-bold placeholder:text-slate-800" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <input type="hidden" name="plan" value={selectedPlan} />

                                            <div className="pt-6">
                                                <button disabled={isPending} className="relative w-full overflow-hidden rounded-2xl bg-primary py-6 text-black font-black uppercase tracking-[0.2em] text-xs shadow-[0_20px_40px_rgba(var(--primary-rgb),0.2)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-4">
                                                    {isPending ? "Configuring Hub..." : "Complete Enrollment"}
                                                </button>
                                                <p className="text-center mt-4 text-[9px] text-slate-600 font-bold uppercase tracking-widest">By clicking, you agree to our Terms of Logistics.</p>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* Corporate Footer */}
            <footer className="py-24 border-t border-white/5 bg-[#050505]">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-2">
                            <Link href="/" className="flex items-center gap-2 mb-6">
                                <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
                                <span className="text-xl font-bold tracking-tight text-white">TrueServe</span>
                            </Link>
                            <p className="text-slate-500 text-sm max-w-sm font-medium">Reclaiming the local margin. Built for the kitchen, engineered for the driver, and loved by the customer.</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-white text-xs font-bold uppercase tracking-widest">Platform</h4>
                            <ul className="text-slate-500 text-sm space-y-2 font-medium">
                                <li><Link href="/restaurants" className="hover:text-primary transition-colors">Find Food</Link></li>
                                <li><Link href="/driver" className="hover:text-primary transition-colors">Drive for Us</Link></li>
                                <li><Link href="/merchant" className="hover:text-primary transition-colors">Merchant Portal</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-white text-xs font-bold uppercase tracking-widest">Support</h4>
                            <ul className="text-slate-500 text-sm space-y-2 font-medium">
                                <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
                                <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">&copy; 2026 TrueServe Logistics Inc. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link href="#" className="text-slate-600 hover:text-white transition-colors">Twitter</Link>
                            <Link href="#" className="text-slate-600 hover:text-white transition-colors">LinkedIn</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
