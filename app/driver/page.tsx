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
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
            <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
                <div className="container flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-full border border-white/10 group-hover:border-primary transition-all shadow-lg" />
                        <span className="text-2xl font-black tracking-tighter text-white">
                            True<span className="text-primary">Serve</span>
                        </span>
                    </Link>
                    <div className="flex gap-4 text-sm font-bold text-slate-300">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <Link href="/merchant" className="hover:text-white transition-colors">For Merchants</Link>
                    </div>
                </div>
            </nav>

            <main className="container max-w-3xl mx-auto py-16 px-6 relative text-center">
                {/* Background Decor - Reduced Opacity */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-primary/20 rounded-full text-primary text-xs font-bold uppercase tracking-widest mb-6 shadow-lg shadow-primary/10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Mileage-Based Delivery Service
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-[1.1] text-white">
                        The Future of <br />
                        <span className="text-primary">TrueServe</span> Delivery
                    </h1>
                    <p className="text-xl text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed font-medium">
                        Join the most transparent platform in the industry.
                        Get guaranteed floors, distance-based kicks, and <span className="text-white font-bold underline decoration-primary decoration-2 underline-offset-4">100% of your tips.</span>
                    </p>
                </div>

                <div className="space-y-12 text-left">

                    {/* Pay Formula Card */}
                    <div className="rounded-3xl border border-primary/20 bg-black/60 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                        <div className="text-center mb-8 relative z-10">
                            <h2 className="text-2xl font-bold italic text-white">"Know exactly what you earn."</h2>
                            <p className="text-slate-300 max-w-lg mx-auto mt-2">
                                See base pay, mileage, and bonuses <strong>before</strong> you accept.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
                            <div className="p-4 bg-black/50 rounded-xl border border-white/10">
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Base Pay</p>
                                <p className="text-xl font-bold text-white">$3.00 <span className="text-sm font-normal text-slate-400">/order</span></p>
                            </div>
                            <div className="p-4 bg-black/50 rounded-xl border border-white/10">
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Floor Guarantee</p>
                                <p className="text-xl font-bold text-emerald-400">$20.00 <span className="text-sm font-normal text-slate-400">/hr active</span></p>
                            </div>
                        </div>

                        <ul className="space-y-4 text-sm text-slate-300 border-t border-white/10 pt-6 relative z-10">
                            <li className="flex justify-between items-center">
                                <span>Distance</span>
                                <span className="text-white font-mono font-bold">$0.70/mi base (+ $0.35 after 2mi)</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span>Wait Time</span>
                                <span className="text-white font-mono font-bold">$0.25/min (after 10m wait)</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span>Batched Orders</span>
                                <span className="text-white font-mono font-bold">+$2.00 per extra drop</span>
                            </li>
                        </ul>
                    </div>


                    <div className="rounded-3xl p-8 border border-white/10 bg-slate-900 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Start Earning</h2>
                        </div>

                        {state.success ? (
                            <div className="p-6 bg-emerald-500/10 border border-emerald-500/50 rounded-xl text-center animate-fade-in">
                                <h3 className="text-xl font-bold text-emerald-400 mb-2">Application Received!</h3>
                                <p className="text-slate-300 text-sm">{state.message}</p>
                            </div>
                        ) : (
                            <form action={formAction} className="space-y-6">
                                {state.error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-200 text-sm font-bold">
                                        {state.message}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Full Name</label>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white placeholder:text-slate-600 font-medium"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">Email</label>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white placeholder:text-slate-600 font-medium"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">Password</label>
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white placeholder:text-slate-600 font-medium"
                                            placeholder="••••••••"
                                            minLength={6}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">Phone Number</label>
                                        <input
                                            name="phone"
                                            type="tel"
                                            required
                                            className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white placeholder:text-slate-600 font-medium"
                                            placeholder="(555) 555-5555"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-300 mb-2">Driver's License / ID Document</label>
                                        <input
                                            name="idDocument"
                                            type="file"
                                            required
                                            accept="image/*,.pdf"
                                            className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-primary-hover cursor-pointer"
                                        />
                                        <p className="text-xs text-slate-500 mt-2 font-medium">Upload a clear photo or scan of your government ID.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">Vehicle</label>
                                        <div className="relative">
                                            <select name="vehicleType" className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-white appearance-none cursor-pointer font-medium">
                                                <option value=" ">Select Vehicle Type</option>
                                                <option value="Car">Car</option>
                                                <option value="SUV">SUV</option>
                                                <option value="Truck">Truck</option>
                                                <option value="Scooter">Scooter / Bike</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="btn btn-primary w-full py-4 text-lg font-bold shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    {isPending ? "Submitting Application..." : "Submit Application"}
                                </button>
                            </form>
                        )}

                        <div className="mt-8 pt-8 border-t border-white/10 text-center">
                            <p className="text-slate-400 text-sm mb-4 font-medium">Already have an account?</p>
                            <Link href="/login?role=driver" className="btn bg-white/5 border border-white/10 hover:bg-white/10 text-white w-full py-4 font-bold uppercase text-xs tracking-widest rounded-xl transition-all hover:border-white/30 block">
                                Log In
                            </Link>
                        </div>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { title: "Distance Pay", desc: "Earn significantly more for longer routes.", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", color: "text-primary" },
                            { title: "Wait Time", desc: "Paid $0.25/min for any pickup delays.", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-emerald-400" },
                            { title: "Instant Pay", desc: "Cash out your earnings immediately.", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-blue-400" },
                            { title: "Heatmap", desc: "Find high-demand zones instantly.", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 7m0 13V7", color: "text-yellow-400" }
                        ].map((item, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all flex flex-col items-center text-center gap-4 group shadow-lg">
                                <div className={`p-4 rounded-full bg-white/5 ${item.color} group-hover:scale-110 transition-transform ring-1 ring-white/10 group-hover:ring-${item.color.split('-')[1]}/50`}>
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-base uppercase tracking-wider mb-2 text-white">{item.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
