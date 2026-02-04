"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { submitMerchantInquiry } from "./actions";

const initialState = {
    message: "",
    success: false,
    error: false,
};

export default function MerchantPortal() {
    const [state, formAction, isPending] = useActionState(submitMerchantInquiry, initialState);
    const [selectedPlan, setSelectedPlan] = useState<string>("");

    const scrollToForm = (plan: string) => {
        setSelectedPlan(plan);
        const form = document.getElementById("inquiry-form");
        if (form) {
            form.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="min-h-screen">
            <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 px-6 py-4">
                <div className="container flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-full border border-white/10 group-hover:border-primary transition-all shadow-lg" />
                        <span className="text-2xl font-black tracking-tighter">
                            True<span className="text-gradient">Serve</span>
                        </span>
                    </Link>
                    <div className="flex gap-4">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    </div>
                </div>
            </nav>

            <main className="container py-20 text-center animate-fade-in">
                <h1 className="text-5xl font-bold mb-6">Grow Your Business with TrueServe</h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
                    Reach thousands of new customers with our premium delivery network. Use our tools to manage orders, track sales, and optimize your menu.
                </p>

                <div className="flex justify-center gap-4 mb-20">
                    <Link href="/merchant/dashboard" className="btn btn-primary">
                        Go to Dashboard
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 gap-10 mb-24 max-w-5xl mx-auto text-left">
                    {/* Option A: Flex Plan */}
                    <div className={`card relative p-8 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40 transition-all flex flex-col justify-between group ${selectedPlan === 'Flex Options' ? 'ring-2 ring-primary' : ''}`}>
                        <div className="absolute top-0 right-0 p-4">
                            <span className="text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-primary/20">Option A</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">Flex Plan</h3>
                            <p className="text-sm text-slate-400 mb-8 leading-relaxed">Perfect for restaurants starting out or looking for a low-risk delivery partner.</p>

                            <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-5xl font-extrabold text-white tracking-tight">12–15%</span>
                                <span className="text-slate-400 font-medium">commission</span>
                            </div>

                            <ul className="space-y-4 mb-10">
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                        <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <span className="text-sm text-slate-300">Pass-through delivery cost to customer</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                        <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <span className="text-sm text-slate-300">No upfront monthly fees or setup costs</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                        <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <span className="text-sm text-slate-300">Access to standard Merchant Dashboard</span>
                                </li>
                            </ul>
                        </div>
                        <button
                            onClick={() => scrollToForm("Flex Options")}
                            className="btn btn-primary w-full py-4 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                        >
                            Get Started with Flex
                        </button>
                    </div>

                    {/* Option B: Pro Subscription */}
                    <div className={`card relative p-8 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent hover:border-emerald-500/40 transition-all flex flex-col justify-between group scale-105 shadow-2xl shadow-emerald-500/5 ${selectedPlan === 'Pro Subscription' ? 'ring-2 ring-emerald-500' : ''}`}>
                        <div className="absolute top-0 right-0 p-4 flex gap-2">
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-emerald-500/20">Option B</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">Pro Subscription</h3>
                            <p className="text-sm text-slate-400 mb-8 leading-relaxed">Ideal for high-volume partners who want predictable monthly costs and zero commission.</p>

                            <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-5xl font-extrabold text-white tracking-tight">$199</span>
                                <span className="text-slate-400 font-medium">/month</span>
                            </div>

                            <ul className="space-y-4 mb-10">
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                        <svg className="w-3 h-3 text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <span className="text-sm font-bold text-white">0% Commission on every order</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                        <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <span className="text-sm text-slate-300">Distance-based delivery fee model</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                        <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <span className="text-sm text-slate-300">Priority Merchant Support (24/7)</span>
                                </li>
                            </ul>
                        </div>
                        <button
                            onClick={() => scrollToForm("Pro Subscription")}
                            className="btn bg-emerald-500 hover:bg-emerald-400 text-[#0a0a0a] w-full py-4 text-base font-extrabold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all"
                        >
                            Grow with Pro
                        </button>
                    </div>
                </div>

                <div className="grid grid-3 gap-8 mb-20 text-left">
                    <div className="card border-white/5 bg-white/5">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Instant Payouts</h3>
                        <p className="text-slate-400 italic mb-2">(T+0) for Loyalty Restaurants</p>
                        <p className="text-sm text-slate-500">Access your earnings immediately after delivery completion.</p>
                    </div>
                    <div className="card border-white/5 bg-white/5">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">AI Forecasting</h3>
                        <p className="text-sm text-slate-500">Prep-time prediction and kitchen pacing metrics to optimize order flow.</p>
                    </div>
                    <div className="card border-white/5 bg-white/5">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Live Logistics</h3>
                        <p className="text-sm text-slate-500">Real-time courier ETA and pickup readiness tools built directly into your tablet.</p>
                    </div>
                </div>

                <div id="inquiry-form" className="max-w-md mx-auto card p-8 scroll-mt-24 text-left">
                    <h2 className="text-2xl font-bold mb-6">Partner Inquiry {selectedPlan && <span className="text-primary block text-sm mt-1">{selectedPlan} Selected</span>}</h2>

                    {state.success ? (
                        <div className="text-center py-8">
                            <div className="text-5xl mb-4">🎉</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Welcome Aboard!</h3>
                            <p className="text-slate-400 mb-6">{state.message}</p>
                            <Link href="/merchant/dashboard" className="btn btn-primary w-full">
                                Go to Dashboard
                            </Link>
                        </div>
                    ) : (
                        <form action={formAction} className="space-y-4">
                            {state.error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-bold">
                                    {state.message}
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Restaurant Name</label>
                                <input name="restaurantName" type="text" required placeholder="e.g. Joe's Pizza" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Name</label>
                                <input name="contactName" type="text" required placeholder="e.g. Joe Smith" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Business Email</label>
                                <input name="email" type="email" required placeholder="joe@example.com" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                            </div>

                            <input type="hidden" name="plan" value={selectedPlan} />

                            <button disabled={isPending} className="btn btn-primary w-full shadow-lg shadow-primary/20">
                                {isPending ? "Submitting..." : "Start Your Application"}
                            </button>
                            <p className="text-xs text-center text-slate-500 mt-2">By clicking, you agree to our Partner Terms.</p>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}
