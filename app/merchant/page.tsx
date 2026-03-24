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
    const [formAddress, setFormAddress] = useState({ address: "", city: "", state: "" });

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
                state: parts[2].split(' ')[0] || ""
            });
        } else {
            setFormAddress({ ...formAddress, address });
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30 font-sans">
            {/* Global Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[80px] md:blur-[180px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[60px] md:blur-[150px]" />
            </div>

            {/* Premium Navigation */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.05] px-6 py-4 bg-black/80">
                <div className="container mx-auto flex justify-between items-center max-w-7xl">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
                        <span className="text-xl font-bold tracking-tight">
                            True<span className="text-primary">Serve</span> <span className="hidden xs:inline">for Merchants</span>
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
                                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
                                    Unlock new <br className="hidden xs:block" />
                                    revenue with <br className="hidden xs:block" />
                                    <span className="text-primary">TrueServe</span>
                                </h1>
                                <p className="text-slate-400 text-lg md:text-xl max-w-xl leading-relaxed font-medium">
                                    The delivery platform built for the local margin. Zero hidden fees, fair dispatch, and a marketplace that prioritizes your brand.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button onClick={() => scrollToForm("")} className="inline-block bg-primary text-black px-8 py-3 font-bold text-sm rounded-xl hover:bg-emerald-500 transition-colors shadow-lg">
                                        Get Started Now
                                    </button>
                                    <button onClick={() => scrollToForm("")} className="inline-block bg-white/5 border border-white/10 text-white px-8 py-3 font-bold text-sm rounded-xl hover:bg-white/10 transition-colors">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {/* Flex Scale Card */}
                            <div className={`p-6 md:p-14 cursor-pointer transition-all duration-300 ${selectedPlan === 'Flex Options' ? 'bg-[#151515] ring-2 ring-orange-500 shadow-2xl scale-[1.02]' : 'bg-[#0f0f0f] border border-white/10 shadow-xl'} rounded-[2rem] flex flex-col`} onClick={() => scrollToForm("Flex Options")}>
                                {/* Large Bold Headline */}
                                <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase mb-4 leading-none break-words">
                                    <span className="text-white block mb-1 text-sm md:text-base font-bold tracking-widest">15% SPLIT</span>
                                    <span className="text-gradient">FLEX SCALE</span>
                                </h3>

                                <div className="space-y-4 mb-8 flex-grow">
                                    <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
                                        Experience on-demand growth with zero upfront setup. Gain full engine access and a standard local badge.
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-400">
                                        <span className="text-sm">✓</span> Free Professional Storefront
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <div>
                                    <button className={`${selectedPlan === 'Flex Options' ? 'bg-orange-500 text-black' : 'bg-orange-500 hover:bg-orange-400 text-black'} px-6 py-2.5 rounded-full font-bold text-xs md:text-sm transition-all shadow-lg`}>
                                        Choose Flex
                                    </button>
                                </div>
                            </div>

                            {/* Pro Scale Card */}
                            <div className={`p-6 md:p-14 cursor-pointer transition-all duration-300 ${selectedPlan === 'Pro Subscription' ? 'bg-[#151515] ring-2 ring-emerald-500 shadow-2xl scale-[1.02]' : 'bg-[#0f0f0f] border border-white/10 shadow-xl'} rounded-[2rem] flex flex-col`} onClick={() => scrollToForm("Pro Subscription")}>
                                {/* Large Bold Headline */}
                                <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase mb-4 leading-none break-words">
                                    <span className="text-white block mb-1 text-sm md:text-base font-bold tracking-widest">0% SPLIT</span>
                                    <span className="text-gradient">PRO SCALE</span>
                                </h3>

                                <div className="space-y-4 mb-8 flex-grow">
                                    <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
                                        $199 / MO. High-volume optimized performance. Unlock VIP merchant status, 0% split, and custom dispatch logic.
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-400">
                                        <span className="text-sm">✓</span> Free Professional Storefront
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <div>
                                    <button className={`${selectedPlan === 'Pro Subscription' ? 'bg-emerald-500 text-black' : 'bg-emerald-500 hover:bg-emerald-400 text-black'} px-6 py-2.5 rounded-full font-bold text-xs md:text-sm transition-all shadow-lg`}>
                                        Choose Pro
                                    </button>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                            {[
                                { title: "Reach more customers", desc: "Instantly connect with hungry diners in your immediate neighborhood and beyond.", icon: "🎯" },
                                { title: "Deliver with ease", desc: "Our high-velocity dispatch engine ensures your food stays hot and delivery stays fast.", icon: "⚡" },
                                { title: "Instant Storefront", desc: "Zero coding. Get a professional, high-res digital storefront for your business—absolutely free.", icon: "🌐" },
                                { title: "Keep your margin", desc: "TrueScale protocols mean no hidden fees and a split that respects your bottom line.", icon: "💰" }
                            ].map((prop, i) => (
                                <div key={i} className="space-y-4 p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all">
                                    <div className="text-4xl mb-6">{prop.icon}</div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">{prop.title}</h3>
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
                                        <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-[1.1] tracking-tighter italic">
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
                                            <h3 className="text-3xl font-bold text-white mb-4">Enrollment Active.</h3>
                                            <p className="text-slate-400 mb-10 text-sm font-medium leading-relaxed max-w-sm">{state.message}</p>
                                            <Link href="/merchant/dashboard" className="inline-block bg-primary text-black px-8 py-3 font-bold text-sm rounded-xl hover:bg-emerald-500 transition-colors w-full shadow-lg">
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

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                                                                    <option value="" disabled>State</option>
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
                                                <button disabled={isPending} className="w-full bg-primary text-black px-6 py-4 font-bold text-sm rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-50 shadow-lg">
                                                    {isPending ? "Configuring Hub..." : "Complete Enrollment"}
                                                </button>
                                                <p className="text-center mt-5 text-xs text-slate-500 font-medium">By clicking, you agree to our Terms of Logistics.</p>
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
                                <li><Link href="mailto:support@trueservedelivery.com" className="hover:text-primary transition-colors">Help Center</Link></li>
                                <li><Link href="/legal#terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                                <li><Link href="/legal#privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
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
