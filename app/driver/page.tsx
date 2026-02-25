"use client";

import { useActionState, useState, useRef } from "react";
import Link from "next/link";
import { submitDriverApplication } from "./actions";

const initialState = {
    message: "",
    success: false,
    error: false,
};

export default function DriverPortal() {
    const [state, formAction, isPending] = useActionState(submitDriverApplication, initialState);
    const formRef = useRef<HTMLDivElement>(null);

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black font-sans">
            {/* Transparent Header */}
            <nav className="fixed top-0 w-full z-50 bg-black/10 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="container flex justify-between items-center max-w-7xl mx-auto">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-full border border-white/10 group-hover:border-primary transition-all shadow-lg" />
                        <span className="text-2xl font-black tracking-tighter text-white">
                            True<span className="text-primary">Serve</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/merchant" className="hidden md:block text-sm font-bold text-slate-400 hover:text-white transition-colors">For Merchants</Link>
                        <Link href="/login?role=driver" className="text-sm font-black uppercase tracking-widest text-primary hover:text-white transition-colors">Log In</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop"
                        className="w-full h-full object-cover opacity-40 scale-105"
                        alt="City Road"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                </div>

                <div className="container max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] md:text-xs font-black uppercase tracking-widest shadow-2xl">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            Join the Fleet of the Future
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.95] text-white">
                            Your City. <br />
                            Your Time. <br />
                            <span className="text-primary">Your Profit.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 max-w-xl font-medium leading-relaxed">
                            TrueServe pays 25-40% more than legacy platforms by prioritizing mileage-based earnings and fair driver splits.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button
                                onClick={scrollToForm}
                                className="btn btn-primary py-4 px-10 text-lg font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all"
                            >
                                Get Started
                            </button>
                            <Link
                                href="#how-it-works"
                                className="btn bg-white/5 border border-white/10 hover:bg-white/10 text-white py-4 px-10 text-lg font-black uppercase tracking-widest rounded-2xl transition-all"
                            >
                                How it Works
                            </Link>
                        </div>
                    </div>

                    {/* Compact Hero Form */}
                    <div ref={formRef} className="lg:max-w-md w-full mx-auto">
                        <div className="bg-slate-900 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] border border-white/10 rounded-[2.5rem] p-10 md:p-12 backdrop-blur-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl -mr-10 -mt-10 pointer-events-none select-none">🛵</div>

                            <div className="relative z-10 pt-2">
                                <h2 className="text-3xl font-black text-white mb-3 tracking-tight leading-tight">Become a Dasher</h2>
                                <p className="text-slate-400 text-sm mb-10 font-medium leading-relaxed">Earn money and explore your city on your own terms.</p>

                                {state.success ? (
                                    <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-center animate-in fade-in zoom-in duration-500">
                                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 border border-emerald-500/30">✅</div>
                                        <h3 className="text-2xl font-black text-emerald-400 mb-2 leading-tight">You're on the list!</h3>
                                        <p className="text-slate-300 text-sm font-medium leading-relaxed">{state.message}</p>
                                        <Link href="/login" className="btn btn-primary w-full mt-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px]">Log In to Portal</Link>
                                    </div>
                                ) : (
                                    <form action={formAction} className="space-y-4">
                                        {state.error && (
                                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-xs font-bold animate-shake">
                                                ⚠️ {state.message}
                                            </div>
                                        )}
                                        <div className="space-y-4">
                                            <input
                                                name="name"
                                                type="text"
                                                required
                                                className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all text-white placeholder:text-slate-600 font-bold text-sm"
                                                placeholder="Full Name"
                                            />
                                            <input
                                                name="email"
                                                type="email"
                                                required
                                                className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all text-white placeholder:text-slate-600 font-bold text-sm"
                                                placeholder="Email Address"
                                            />
                                            <input
                                                name="phone"
                                                type="tel"
                                                required
                                                className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all text-white placeholder:text-slate-600 font-bold text-sm"
                                                placeholder="Phone Number"
                                            />
                                            <div className="relative group">
                                                <select
                                                    name="vehicleType"
                                                    required
                                                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-all text-white appearance-none cursor-pointer font-bold text-sm"
                                                >
                                                    <option value="" disabled selected>Select Vehicle</option>
                                                    <option value="Car">Car</option>
                                                    <option value="SUV">SUV</option>
                                                    <option value="Truck">Truck</option>
                                                    <option value="Scooter">Scooter / Bike</option>
                                                </select>
                                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">▼</div>
                                            </div>
                                            <div className="p-4 bg-black/30 border border-dashed border-white/10 rounded-2xl">
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Drivers License / ID</label>
                                                <input
                                                    name="idDocument"
                                                    type="file"
                                                    required
                                                    accept="image/*,.pdf"
                                                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-white/10 file:text-white hover:file:bg-white/20 file:transition-all cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isPending}
                                            className="btn btn-primary w-full py-5 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-6"
                                        >
                                            {isPending ? "Applying..." : "Start earning now"}
                                        </button>

                                        <p className="text-[10px] text-slate-500 text-center px-4 font-medium leading-relaxed">
                                            By clicking "Start earning now", you agree to TrueServe's Terms of Service and Privacy Policy.
                                        </p>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Props */}
            <section className="py-24 bg-white/5 relative">
                <div className="container max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">Why deliver with TrueServe?</h2>
                        <p className="text-slate-400 font-medium max-w-2xl mx-auto">We built a platform that respects your effort and pays fairly for every mile.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Earnings that add up",
                                desc: "High base pay and distance-driven rates mean you keep more of every delivery fee.",
                                icon: "💰",
                                img: "https://images.unsplash.com/photo-1580519327912-ccc3046f3a2e?q=80&w=800&auto=format&fit=crop"
                            },
                            {
                                title: "Your own schedule",
                                desc: "Be your own boss. Schedule yourself ahead of time or start delivering whenever you want.",
                                icon: "⏰",
                                img: "https://images.unsplash.com/photo-1506784919141-93acbfa0279c?q=80&w=800&auto=format&fit=crop"
                            },
                            {
                                title: "Freedom to move",
                                desc: "Delivery by car, bike, or scooter. You choice how you want to explore your city.",
                                icon: "🚲",
                                img: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop"
                            }
                        ].map((item, i) => (
                            <div key={i} className="group bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden hover:border-primary/30 transition-all flex flex-col shadow-2xl">
                                <div className="h-48 overflow-hidden relative">
                                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
                                    <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xl">
                                        {item.icon}
                                    </div>
                                </div>
                                <div className="p-8 space-y-3">
                                    <h3 className="text-xl font-black text-white">{item.title}</h3>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pay Formula Overhaul */}
            <section id="how-it-works" className="py-24 bg-black relative overflow-hidden">
                <div className="container max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-none">
                                Transparent pay. <br />
                                <span className="text-primary text-3xl md:text-5xl italic">No guessing games.</span>
                            </h2>
                            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
                                Unlike other apps that hide their formulas, we show you exactly how your earnings are calculated.
                                You'll see the total payout before you ever tap "Accept."
                            </p>

                            <div className="space-y-4">
                                {[
                                    { label: "Base Pay", value: "$3.00 / order", detail: "Guaranteed minimum per pickup" },
                                    { label: "Distance Pay", value: "$0.70 / mile", detail: "Increases to $1.05 after 2 miles" },
                                    { label: "Wait Pay", value: "$0.25 / min", detail: "Starts after 10 minutes at restaurant" },
                                    { label: "Tips", value: "100% Yours", detail: "Customers tip directly in the app" }
                                ].map((row, i) => (
                                    <div key={i} className="flex justify-between items-center p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all">
                                        <div>
                                            <p className="text-white font-black text-sm uppercase tracking-widest">{row.label}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{row.detail}</p>
                                        </div>
                                        <p className="text-primary font-black text-lg">{row.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 w-full">
                            <div className="relative group">
                                <div className="absolute -inset-2 bg-gradient-to-r from-primary to-emerald-500 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                <div className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 md:p-12 shadow-2xl overflow-hidden min-h-[460px] flex flex-col">
                                    <div className="absolute top-0 right-0 p-12 text-9xl opacity-5 pointer-events-none rotate-12 select-none">🏁</div>
                                    <h3 className="text-3xl font-black text-white mb-10 border-b border-white/10 pb-8 leading-tight pt-2">Sample Driver Payout</h3>

                                    <div className="space-y-7 flex-grow">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400 font-bold uppercase tracking-widest">Base Pick-up</span>
                                            <span className="text-white font-black">$3.00</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400 font-bold uppercase tracking-widest">Distance (4.2 miles)</span>
                                            <span className="text-white font-black">$3.71</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400 font-bold uppercase tracking-widest">Wait Time (12 mins)</span>
                                            <span className="text-white font-black">$0.50</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400 font-bold uppercase tracking-widest">Customer Tip</span>
                                            <span className="text-emerald-400 font-black">$6.00</span>
                                        </div>
                                        <div className="pt-10 border-t border-white/10 flex justify-between items-end mt-auto pb-4">
                                            <div className="pr-4">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Earned</p>
                                                <p className="text-5xl font-black text-white tracking-tighter leading-none">$13.21</p>
                                            </div>
                                            <div className="text-right pl-4">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Driving Time</p>
                                                <p className="text-xl font-bold text-slate-300 leading-none">18 mins</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Requirements & Call to Action */}
            <section className="py-24 border-t border-white/5 bg-slate-900/50">
                <div className="container max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">What do you need <br />to start?</h2>
                            <ul className="space-y-6">
                                {[
                                    "18+ years of age",
                                    "Valid driver's license or state ID",
                                    "Your own vehicle (Car, Scooter, or Bike)",
                                    "Social Security number (for tax purposes)",
                                    "A smartphone (iOS or Android)"
                                ].map((req, i) => (
                                    <li key={i} className="flex items-center gap-4 text-slate-300 font-bold">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">✓</div>
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-primary/20 to-emerald-500/10 border border-primary/20 p-12 rounded-[3rem] text-center space-y-6 relative overflow-hidden group">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
                            <h3 className="text-3xl font-black text-white relative z-10">Start today. <br />Pay out today.</h3>
                            <p className="text-slate-400 font-medium relative z-10 mb-8">Join thousands of drivers in Charlotte and Pineville who are earning more with TrueServe.</p>
                            <button
                                onClick={scrollToForm}
                                className="btn btn-primary w-full py-5 text-lg font-black uppercase tracking-widest relative z-10 shadow-2xl shadow-primary/30"
                            >
                                Apply Now
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="py-12 bg-black border-t border-white/5">
                <div className="container max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="w-8 h-8 opacity-50" />
                        <span className="font-black text-slate-500 tracking-tighter">TrueServe Fleet &copy; {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-slate-600">
                        <Link href="/legal" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/legal" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/help" className="hover:text-white transition-colors">Dasher Help</Link>
                        <Link href="/login?role=driver" className="hover:text-white transition-colors">Driver Login</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
