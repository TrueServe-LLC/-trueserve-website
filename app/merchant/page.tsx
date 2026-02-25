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

            {/* Navigation */}
            <nav className="sticky top-0 z-50 backdrop-blur-2xl border-b border-white/5 px-8 py-5 bg-black/40">
                <div className="container mx-auto flex justify-between items-center max-w-7xl">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/40 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <img src="/logo.png" alt="TrueServe Logo" className="relative w-11 h-11 rounded-2xl border border-white/10 group-hover:border-primary/50 transition-all shadow-2xl" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter">
                            True<span className="text-gradient">Serve</span>
                        </span>
                    </Link>
                    <div className="flex gap-8 items-center">
                        <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary transition-all">Internal Portal</Link>
                        <button onClick={() => scrollToForm("")} className="hidden md:block btn btn-primary text-[10px] py-2 px-6 rounded-full font-black uppercase tracking-widest shadow-xl shadow-primary/20">Apply Now</button>
                    </div>
                </div>
            </nav>

            <main className="relative z-10">
                {/* Hero Section - Centered Focus */}
                <section className="relative min-h-[80vh] flex items-center overflow-hidden py-32">
                    <div className="container mx-auto px-6 max-w-5xl text-center flex flex-col items-center">
                        <div className="animate-slide-up space-y-12">
                            <div className="inline-block px-6 py-2 bg-white/5 backdrop-blur-md text-primary rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-white/10 shadow-2xl">
                                Partnership Standards v2.1
                            </div>
                            <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.9] text-white">
                                The New <br />
                                <span className="text-gradient italic">Gold Standard.</span>
                            </h1>
                            <p className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed font-bold italic opacity-80">
                                Reclaiming the local kitchen. Zero hidden fees. <br className="hidden md:block" /> Fairness by design.
                            </p>

                            <div className="flex flex-col md:flex-row gap-12 justify-center pt-8">
                                {[
                                    { img: "https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=600&auto=format&fit=crop", title: "Local Visibility", desc: "Top-tier neighborhood placement." },
                                    { img: "https://images.unsplash.com/photo-1554672408-730436b60dde?q=80&w=600&auto=format&fit=crop", title: "True Split Logic", desc: "Favoring the restaurant margin." }
                                ].map((step, i) => (
                                    <div key={i} className="flex flex-col items-center gap-4 group">
                                        <div className="w-24 h-24 rounded-[2.5rem] bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-primary/50 transition-all duration-700 shadow-2xl">
                                            <img src={step.img} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0" alt={step.title} />
                                        </div>
                                        <div className="text-center">
                                            <h4 className="text-lg font-black text-white uppercase tracking-tighter italic">{step.title}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => scrollToForm("")} className="btn btn-primary py-6 px-16 rounded-full text-lg font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-105 transition-all mt-12">
                                Apply for Listing
                            </button>
                        </div>
                    </div>
                </section>

                {/* Inquiry Form Wrapper */}
                <section id="inquiry-form" className="py-32 bg-white/[0.01]">
                    <div className="container mx-auto px-6 max-w-7xl flex justify-center">
                        <div className="relative group w-full max-w-2xl perspective-1000">
                            <div className="absolute -inset-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-[5rem] blur-[50px] opacity-20 group-hover:opacity-40 transition-all duration-1000"></div>

                            <div className="relative bg-slate-900 border border-white/5 rounded-[4rem] p-10 md:p-20 shadow-2xl overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 opacity-5 text-[15rem] -mr-20 -mt-20 pointer-events-none select-none">💎</div>

                                <div className="relative z-10">
                                    <div className="text-center mb-16">
                                        <h2 className="text-3xl md:text-5xl font-black mb-4 text-white tracking-tighter uppercase italic">Onboarding</h2>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
                                            {selectedPlan ? selectedPlan : "Standard Protocol"}
                                        </p>
                                    </div>

                                    {state.success ? (
                                        <div className="text-center py-12 animate-fade-in">
                                            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-5xl mx-auto mb-10 border border-primary/30 shadow-[0_0_60px_rgba(68,140,137,0.3)]">🛡️</div>
                                            <h3 className="text-3xl font-black text-white mb-6 tracking-tighter">Approved & Pending.</h3>
                                            <p className="text-slate-400 mb-12 text-base font-bold leading-relaxed">{state.message}</p>
                                            <Link href="/merchant/dashboard" className="btn btn-primary w-full py-6 rounded-3xl font-black uppercase tracking-widest shadow-2xl">
                                                Go to Portal
                                            </Link>
                                        </div>
                                    ) : (
                                        <form action={formAction} className="space-y-8">
                                            {state.error && (
                                                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-100 text-xs font-black uppercase tracking-widest animate-shake mb-10 text-center">
                                                    {state.message}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-6">
                                                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2">Kitchen Identity</h4>
                                                    <input name="restaurantName" type="text" required placeholder="Restaurant Name" className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-bold" />
                                                    <input name="contactName" type="text" required placeholder="Operator Name" className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-bold" />
                                                    <input name="email" type="email" required placeholder="Business Email" className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-bold" />
                                                    <input name="password" type="password" required minLength={8} placeholder="Portal Password" className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-bold" />
                                                </div>

                                                <div className="space-y-6">
                                                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2">Logistics Center</h4>
                                                    <AddressInput onAddressSelect={handleAddressSelect} initialAddress={formAddress.address} />
                                                    <input type="hidden" name="address" value={formAddress.address} />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <input name="city" type="text" required placeholder="City" value={formAddress.city} onChange={(e) => setFormAddress({ ...formAddress, city: e.target.value })} className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-bold" />
                                                        <select name="state" value={formAddress.state} onChange={(e) => setFormAddress({ ...formAddress, state: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none font-bold" required>
                                                            <option value="NC">NC</option>
                                                            <option value="SC">SC</option>
                                                        </select>
                                                    </div>
                                                    <input name="zip" type="text" placeholder="Zip Code" className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-bold" />
                                                </div>
                                            </div>

                                            <input type="hidden" name="plan" value={selectedPlan} />

                                            <button disabled={isPending} className="group/btn relative w-full mt-8">
                                                <div className="absolute inset-0 bg-primary blur-2xl opacity-20 group-hover/btn:opacity-40 transition-opacity" />
                                                <div className="relative btn btn-primary w-full py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl transition-transform active:scale-[0.98]">
                                                    {isPending ? "Syncing Logic..." : "Finalize Application"}
                                                </div>
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Growth Path */}
                <section className="py-32 bg-white/[0.02] relative overflow-hidden">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="text-center mb-24">
                            <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">The Process</span>
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic">The Road to Listing.</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { step: "01", icon: "📊", title: "Submit Request", desc: "Define your kitchen's capacity and select a TrueScale protocol.", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop" },
                                { step: "02", icon: "🍱", title: "Catalog Sync", desc: "Seamlessly port your menu into the TrueServe logistics engine.", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop" },
                                { step: "03", icon: "⚡", title: "Active Traffic", desc: "Live order flow begins upon final storefront validation.", img: "https://images.unsplash.com/photo-1526367790999-0150786486a9?q=80&w=800&auto=format&fit=crop" }
                            ].map((item, i) => (
                                <div key={i} className="group relative p-1 bg-gradient-to-br from-white/10 to-transparent rounded-[3rem] transition-all hover:scale-[1.02]">
                                    <div className="relative h-full p-10 bg-slate-900 rounded-[2.9rem] overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all" />
                                        <span className="text-7xl font-black text-white/5 absolute top-6 right-8 group-hover:text-primary/10 transition-all">{item.step}</span>

                                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-10 group-hover:border-primary/50 transition-all">
                                            {item.icon}
                                        </div>

                                        <h4 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter italic">{item.title}</h4>
                                        <p className="text-slate-500 font-bold leading-relaxed mb-10">{item.desc}</p>

                                        <div className="h-40 rounded-2xl overflow-hidden border border-white/5">
                                            <img src={item.img} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt={item.title} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Scaling Options */}
                <section className="py-32 md:py-48 relative">
                    <div className="container mx-auto px-6 max-w-7xl">
                        <div className="max-w-3xl mx-auto text-center mb-32">
                            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase italic leading-tight">TrueScale <br /> <span className="text-gradient">protocols.</span></h2>
                            <p className="text-slate-400 text-lg font-bold italic">Logistics engineered for the local margin.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 max-w-6xl mx-auto">
                            {/* Flex Scale */}
                            <div className={`pricing-card group relative p-12 md:p-20 bg-slate-900/50 border border-white/5 rounded-[4rem] hover:border-primary/30 transition-all duration-700 ${selectedPlan === 'Flex Options' ? 'ring-2 ring-primary bg-slate-900' : ''}`}>
                                <div className="absolute top-10 right-10">
                                    <div className="px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl">Standard</div>
                                </div>

                                <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter italic">Flex Scale</h3>
                                <p className="text-slate-500 font-bold mb-12 uppercase tracking-widest text-[9px]">On-demand partnership</p>

                                <div className="flex items-baseline gap-2 mb-16">
                                    <span className="text-8xl font-black text-white tracking-tighter">15%</span>
                                    <span className="text-slate-500 font-black uppercase tracking-widest text-xs italic">Split</span>
                                </div>

                                <ul className="space-y-6 mb-16">
                                    {["Zero upfront setup", "Full engine access", "Priority local badge", "Flexible contract"].map((feat, i) => (
                                        <li key={i} className="flex items-center gap-4 text-slate-400 font-bold">
                                            <div className="w-5 h-5 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] text-primary">✔</div>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => scrollToForm("Flex Options")}
                                    className="w-full py-6 rounded-3xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black hover:scale-[1.02] transition-all shadow-2xl"
                                >
                                    Activate Flex
                                </button>
                            </div>

                            {/* Pro Scale */}
                            <div className={`pricing-card group relative p-12 md:p-20 bg-slate-900 border border-emerald-500/20 rounded-[4rem] hover:border-emerald-500/50 transition-all duration-700 shadow-2xl scale-105 ${selectedPlan === 'Pro Subscription' ? 'ring-2 ring-emerald-500 shadow-emerald-500/10' : ''}`}>
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-2.5 rounded-full text-black font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl whitespace-nowrap">Recommended protocol</div>

                                <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter italic">Pro Scale</h3>
                                <p className="text-emerald-500 font-black mb-12 uppercase tracking-widest text-[9px]">Elite Subscription</p>

                                <div className="flex items-baseline gap-2 mb-16">
                                    <span className="text-8xl font-black text-white tracking-tighter">$199</span>
                                    <span className="text-slate-500 font-black uppercase tracking-widest text-xs italic">Monthly</span>
                                </div>

                                <ul className="space-y-6 mb-16">
                                    {["0% Split logic", "High-velocity dispatch", "Analytic forecasting", "Consulting access"].map((feat, i) => (
                                        <li key={i} className="flex items-center gap-4 text-emerald-100 font-bold">
                                            <div className="w-5 h-5 rounded-lg bg-emerald-500 flex items-center justify-center text-[10px] text-black shadow-lg shadow-emerald-500/30">✔</div>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => scrollToForm("Pro Subscription")}
                                    className="w-full py-6 rounded-3xl bg-emerald-500 text-black font-black uppercase tracking-widest text-xs hover:bg-white hover:scale-[1.02] transition-all shadow-2xl shadow-emerald-500/20"
                                >
                                    Activate Pro
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Proof Section */}
                <section className="py-48 relative overflow-hidden">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <div className="relative p-16 md:p-32 bg-slate-900/50 border border-white/5 rounded-[5rem] overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px] -mr-48 -mt-48" />

                            <div className="relative z-10 text-center">
                                <div className="text-7xl mb-12 group-hover:scale-110 transition-all duration-700">💎</div>
                                <blockquote className="text-2xl md:text-4xl font-black text-white mb-16 leading-[1.2] tracking-tighter italic px-4">
                                    "The Pro protocol saved us $2,400 in commissions in thirty days. Logistics finally works for the kitchen."
                                </blockquote>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black text-white uppercase tracking-tight">The Pizza Palace</h4>
                                    <p className="text-slate-600 text-xs font-black uppercase tracking-[0.4em]">Partner ID: #0822-TS</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer Minimal */}
            <footer className="py-20 border-t border-white/5">
                <div className="container mx-auto px-6 text-center max-w-7xl flex flex-col items-center">
                    <Link href="/" className="mb-10 block opacity-50 hover:opacity-100 transition-all">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 grayscale" />
                    </Link>
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.5em]">TrueServe &copy; 2026. All standards reserved.</p>
                </div>
            </footer>
        </div>
    );
}
