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
                                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.05] border border-white/10 rounded-full text-white text-[10px] md:text-xs font-black uppercase tracking-widest shadow-2xl backdrop-blur-sm mb-2">
                                    <span>Empowering Local Restaurants</span>
                                </div>
                                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                                    Unlock new <br />
                                    revenue with <span className="italic"><span className="text-white">True</span><span className="text-primary">Serve.</span></span>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
                            {/* Flex Scale Banner */}
                            <div className={`flex flex-col xl:flex-row gap-6 p-8 md:p-10 cursor-pointer transition-all duration-300 ${selectedPlan === 'Flex Options' ? 'bg-[#050505] ring-2 ring-primary' : 'bg-[#0f0f0f] border border-white/10'} rounded-3xl hover:border-primary/40`} onClick={() => scrollToForm("Flex Options")}>
                                <div className="flex-1 flex flex-col justify-center">
                                    <h3 className="text-3xl font-black text-white tracking-tight mb-2">Flex Scale</h3>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-normal">15%</span>
                                        <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px] italic">Split</span>
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium mb-6">On-demand growth.</p>
                                    <div>
                                        <button className="inline-flex items-center justify-center bg-primary/10 border border-primary/20 hover:bg-primary text-primary hover:text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg whitespace-nowrap">Choose Flex</button>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-center border-t xl:border-t-0 xl:border-l border-white/10 pt-6 xl:pt-0 xl:pl-8">
                                    <ul className="space-y-4">
                                        {["Zero upfront setup", "Full engine access", "Standard local badge", "Cancel anytime"].map((feat, i) => (
                                            <li key={i} className="flex justify-between items-center text-slate-300 text-sm font-medium">
                                                <span>{feat}</span>
                                                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary shrink-0">✔</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Pro Scale Banner */}
                            <div className={`flex flex-col xl:flex-row gap-6 p-8 md:p-10 cursor-pointer transition-all duration-300 ${selectedPlan === 'Pro Subscription' ? 'bg-[#050505] ring-2 ring-emerald-500' : 'bg-[#0f0f0f] border border-white/10'} rounded-3xl hover:border-emerald-500/40`} onClick={() => scrollToForm("Pro Subscription")}>
                                <div className="flex-1 flex flex-col justify-center">
                                    <h3 className="text-3xl font-black text-white tracking-tight mb-2">Pro Scale</h3>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-4xl md:text-5xl font-black text-emerald-400 tracking-tighter leading-normal">$199</span>
                                        <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px] italic">Monthly</span>
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium mb-6">High-volume optimized.</p>
                                    <div>
                                        <button className="inline-flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg whitespace-nowrap">Choose Pro</button>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-center border-t xl:border-t-0 xl:border-l border-white/10 pt-6 xl:pt-0 xl:pl-8">
                                    <ul className="space-y-4">
                                        {["0% Split logic", "VIP Merchant Status", "Custom dispatch logic", "Performance Analytics"].map((feat, i) => (
                                            <li key={i} className="flex justify-between items-center text-slate-300 text-sm font-medium">
                                                <span>{feat}</span>
                                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-500 shrink-0">✔</div>
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
                {/* Enrollment Form */}
                <section id="inquiry-form" className="py-24 relative overflow-hidden">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="max-w-5xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
                                {/* Left Side - Brand Promise */}
                                <div className="flex flex-col justify-start items-start pt-8">
                                    <div className="space-y-8">
                                        <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-2xl">🤝</div>
                                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tighter italic">
                                            Be a part <br className="hidden md:block" /> of the <br />
                                            <span className="text-primary inline-block mt-2">TrueServe</span> <br />
                                            network.
                                        </h2>
                                        <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">
                                            Join the premium merchants reclaiming their local margin. Minimum limits, maximum reach.
                                        </p>
                                    </div>
                                    <div className="space-y-4 pt-12 w-full">
                                        <div className="flex items-center gap-4 text-white text-xs font-black uppercase tracking-widest pb-4 border-b border-white/5">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">🛡️</div>
                                            Secure Enrollment
                                        </div>
                                        <div className="flex items-center gap-4 text-white text-xs font-black uppercase tracking-widest pb-4 border-b border-white/5">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">⚡</div>
                                            Fast Onboarding
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side - Form */}
                                <div>
                                    <div className="mb-10">
                                        <h3 className="text-3xl font-bold text-white tracking-tight italic">Partner Inquiry</h3>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 block w-full border-b border-white/5 pb-4">
                                            Selection: <span className="text-white">{selectedPlan ? selectedPlan : "Standard Protocol"}</span>
                                        </p>
                                    </div>

                                    {state.success ? (
                                        <div className="text-center py-12 animate-fade-in flex flex-col items-center">
                                            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-5xl mb-8 border border-primary/20 shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]">🛡️</div>
                                            <h3 className="text-3xl font-black text-white mb-4 tracking-tighter italic">Enrollment Active.</h3>
                                            <p className="text-slate-400 mb-12 text-sm font-bold leading-relaxed max-w-sm">{state.message}</p>
                                            <Link href="/merchant/dashboard" className="btn btn-primary w-full py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl">
                                                Access Command Center
                                            </Link>
                                        </div>
                                    ) : (
                                        <form action={formAction} className="space-y-6">
                                            {state.error && (
                                                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                                                    {state.message}
                                                </div>
                                            )}

                                            <div className="space-y-5">
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Business Identity</label>
                                                    <input name="restaurantName" type="text" required placeholder="Legal Restaurant Name" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all font-bold placeholder:text-slate-600" />
                                                </div>

                                                <div className="grid grid-cols-2 gap-5">
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">POC Name</label>
                                                        <input name="contactName" type="text" required placeholder="Owner/Manager" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all font-bold placeholder:text-slate-600" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
                                                        <input name="email" type="email" required placeholder="business@email.com" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all font-bold placeholder:text-slate-600" />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Secure Access</label>
                                                    <input name="password" type="password" required minLength={8} placeholder="Create Portal Password" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all font-bold placeholder:text-slate-600" />
                                                </div>

                                                <div className="pt-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-4 block">Storefront Location</label>
                                                    <div className="space-y-4">
                                                        <AddressInput onAddressSelect={handleAddressSelect} initialAddress={formAddress.address} />
                                                        <input type="hidden" name="address" value={formAddress.address} />

                                                        <div className="grid grid-cols-3 gap-4">
                                                            <input name="city" type="text" required placeholder="City" value={formAddress.city} onChange={(e) => setFormAddress({ ...formAddress, city: e.target.value })} className="col-span-1 w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-bold placeholder:text-slate-600" />
                                                            <div className="relative col-span-1">
                                                                <select name="state" value={formAddress.state} onChange={(e) => setFormAddress({ ...formAddress, state: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none font-bold cursor-pointer" required>
                                                                    <option value="NC">NC</option>
                                                                    <option value="SC">SC</option>
                                                                </select>
                                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 text-[10px]">▼</div>
                                                            </div>
                                                            <input name="zip" type="text" placeholder="Zip" className="col-span-1 w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-bold placeholder:text-slate-600" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <input type="hidden" name="plan" value={selectedPlan} />

                                            <div className="pt-6">
                                                <button disabled={isPending} className="relative w-full overflow-hidden rounded-2xl bg-primary py-6 text-black font-black uppercase tracking-[0.2em] text-xs shadow-[0_20px_40px_rgba(var(--primary-rgb),0.2)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-4">
                                                    {isPending ? "Configuring Hub..." : "Complete Enrollment"}
                                                </button>
                                                <p className="text-center mt-5 text-[9px] text-slate-600 font-bold uppercase tracking-widest border-t border-white/5 pt-5">By clicking, you agree to our Terms of Logistics.</p>
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
