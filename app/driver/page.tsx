"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { submitDriverApplication } from "./actions";

const initialState = {
    message: "",
    success: false,
    error: false,
};

export default function DriverPortal() {
    // Use server action for form submission
    const [state, formAction, isPending] = useActionState(submitDriverApplication, initialState);

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
                        <Link href="/merchant" className="hover:text-primary transition-colors">For Merchants</Link>
                    </div>
                </div>
            </nav>

            <main className="container max-w-3xl mx-auto py-16 px-6 animate-fade-in relative text-center">
                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10" />

                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-bold uppercase tracking-widest mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Mileage-Based Delivery Service
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-[1.1]">
                        The Future of <br />
                        <span className="text-gradient">TrueServe</span> Delivery
                    </h1>
                    <p className="text-xl text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
                        Join the most transparent platform in the industry.
                        Get guaranteed floors, distance-based kicks, and <span className="text-white font-semibold">100% of your tips.</span>
                    </p>
                </div>

                <div className="space-y-12 text-left">

                    {/* Pay Formula Card */}
                    <div className="card border-primary/20 bg-primary/5 p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold italic text-primary">"Know exactly what you earn."</h2>
                            <p className="text-slate-300 max-w-lg mx-auto">
                                See base pay, mileage, and bonuses <strong>before</strong> you accept.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Base Pay</p>
                                <p className="text-xl font-bold">$3.00 <span className="text-sm font-normal text-slate-400">/order</span></p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Floor Guarantee</p>
                                <p className="text-xl font-bold text-emerald-400">$20.00 <span className="text-sm font-normal text-slate-400">/hr active</span></p>
                            </div>
                        </div>

                        <ul className="space-y-3 text-sm text-slate-400 border-t border-white/5 pt-6">
                            <li className="flex justify-between items-center">
                                <span>Distance</span>
                                <span className="text-white font-mono">$0.70/mi base (+ $0.35 after 2mi)</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span>Wait Time</span>
                                <span className="text-white font-mono">$0.25/min (after 10m wait)</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span>Batched Orders</span>
                                <span className="text-white font-mono">+$2.00 per extra drop</span>
                            </li>
                        </ul>
                    </div>


                    <div className="card p-8 border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Start Earning</h2>
                        </div>

                        {state.success ? (
                            <div className="p-6 bg-primary/20 border border-primary/50 rounded-lg text-center animate-fade-in">
                                <h3 className="text-xl font-bold text-primary mb-2">Application Received!</h3>
                                <p className="text-slate-300 text-sm">{state.message}</p>
                            </div>
                        ) : (
                            <form action={formAction} className="space-y-6">
                                {state.error && (
                                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
                                        {state.message}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Email</label>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Vehicle</label>
                                        <div className="relative">
                                            <select name="vehicleType" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white appearance-none cursor-pointer">
                                                <option value=" ">Select Vehicle Type</option>
                                                <option value="Car">Car</option>
                                                <option value="SUV">SUV</option>
                                                <option value="Truck">Truck</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="btn btn-primary w-full py-4 text-lg shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPending ? "Submitting..." : "Submit Application"}
                                </button>
                            </form>
                        )}
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 card bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all flex flex-col items-center text-center gap-4 group">
                            <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm uppercase tracking-wider mb-2 text-white">Distance Pay</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">Earn significantly more for longer routes.</p>
                            </div>
                        </div>

                        <div className="p-6 card bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all flex flex-col items-center text-center gap-4 group">
                            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm uppercase tracking-wider mb-2 text-white">Wait Time</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">Paid $0.25/min for any pickup delays.</p>
                            </div>
                        </div>

                        <div className="p-6 card bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all flex flex-col items-center text-center gap-4 group">
                            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm uppercase tracking-wider mb-2 text-white">Instant Pay</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">Cash out your earnings immediately.</p>
                            </div>
                        </div>

                        <div className="p-6 card bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all flex flex-col items-center text-center gap-4 group">
                            <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-400 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 7m0 13V7"></path></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm uppercase tracking-wider mb-2 text-white">Heatmap</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">Find high-demand zones instantly.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
