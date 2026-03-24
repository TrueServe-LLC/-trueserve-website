"use client";

import { useRef } from "react";
import Link from "next/link";
import DriverApplicationForm from "./DriverApplicationForm";

export default function DriverPortal() {
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
                        <Link href="/driver/login" className="text-sm font-black uppercase tracking-widest text-primary hover:text-white transition-colors">Log In</Link>
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
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.05] border border-white/10 rounded-full text-white text-[10px] md:text-xs font-black uppercase tracking-widest shadow-2xl leading-relaxed backdrop-blur-sm">
                            Join the Fleet of the Future
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight py-4">
                            <span className="text-white">Your City.</span> <br />
                            <span className="text-white">Your Time.</span> <br />
                            <span className="text-gradient">Your Profit.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 max-w-xl font-medium leading-relaxed">
                            TrueServe pays 25-40% more than legacy platforms by prioritizing mileage-based earnings and fair driver splits.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button
                                onClick={scrollToForm}
                                className="inline-block bg-primary text-black px-8 py-3 font-bold text-sm rounded-xl hover:bg-emerald-500 transition-colors shadow-lg"
                            >
                                Get Started
                            </button>
                            <Link
                                href="#how-it-works"
                                className="inline-block bg-white/5 border border-white/10 text-white px-8 py-3 font-bold text-sm rounded-xl hover:bg-white/10 transition-colors"
                            >
                                How it Works
                            </Link>
                        </div>
                    </div>

                    {/* Compact Hero Form */}
                    <div ref={formRef} className="lg:max-w-md w-full mx-auto relative z-20">
                        <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-2xl relative shadow-xl">
                            <h2 className="text-3xl font-bold mb-4 tracking-tight px-2">
                                <span className="text-white">Become a</span> <span className="text-gradient">Driver</span>
                            </h2>
                            <p className="text-slate-400 text-sm mb-8 font-medium leading-relaxed px-2">Earn money and explore your city on your own terms.</p>

                            <DriverApplicationForm />
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Props */}
            <section className="py-24 relative">
                <div className="container max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 px-4">
                        <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-4">Why deliver with <span className="text-gradient">TrueServe?</span></h2>
                        <p className="text-slate-400 font-medium italic">We built a platform that respects your effort and pays fairly for every mile.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                title: "Earnings that add up",
                                desc: "High base pay and distance-driven rates mean you keep more of every delivery fee.",
                                icon: "💰",
                                img: "/money.png"
                            },
                            {
                                title: "Your own schedule",
                                desc: "Be your own boss. Schedule yourself ahead of time or start delivering whenever you want.",
                                icon: "⏰",
                                img: "/calendar.png"
                            },
                            {
                                title: "Freedom to move",
                                desc: "Delivery by car, bike, or scooter. You choice how you want to explore your city.",
                                icon: "🚲",
                                img: "/scooter.png"
                            }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col gap-6 group cursor-pointer">
                                <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group-hover:border-primary/50 transition-colors duration-500 bg-[#0f0f0f]">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80 group-hover:opacity-100 block" />
                                    <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 text-3xl shadow-2xl z-20">
                                        {item.icon}
                                    </div>
                                </div>
                                <div className="px-2">
                                    <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2 group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pay Formula Overhaul */}
            <section id="how-it-works" className="py-24 relative">
                <div className="container max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight py-2 text-white">
                                Transparent pay.<br />
                                No guessing games.
                            </h2>
                            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                                Unlike other apps that hide their formulas, we show you exactly how your earnings are calculated.
                                You'll see the total payout before you ever tap "Accept."
                            </p>

                            <div className="grid grid-cols-2 gap-4 md:gap-6 pt-4">
                                {[
                                    { label: "Base Pay", value: "$3.00", detail: "Per Order Minimum" },
                                    { label: "Distance", value: "$0.70", detail: "Per Mile" },
                                     { label: "Wait Pay", value: "$0.25", detail: "Per Minute" },
                                    { label: "Tips", value: "100%", detail: "All Yours" }
                                ].map((row, i) => (
                                    <div key={i} className="flex flex-col p-6 md:p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all shadow-xl">
                                        <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2">{row.label}</p>
                                        <p className="text-3xl md:text-4xl font-black text-white mb-2"><span className="text-gradient">{row.value}</span></p>
                                        <p className="text-emerald-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">{row.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 w-full">
                            <div className="relative group">
                                <div className="absolute -inset-2 bg-gradient-to-r from-primary to-emerald-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                <div className="relative bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl flex flex-col h-full justify-between">
                                    <div className="absolute top-0 right-0 p-8 text-8xl opacity-5 pointer-events-none rotate-12 select-none grayscale overflow-hidden">🏁</div>
                                    <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-6 tracking-tight relative z-10 px-1 pt-1 ml-[1px]">Sample Driver Payout</h3>

                                    <div className="space-y-6 flex-grow relative z-10 pb-4 px-1">
                                        <div className="flex justify-between items-center text-sm ml-[1px]">
                                            <span className="text-slate-400 font-medium tracking-wide">Base Pick-up</span>
                                            <span className="text-white font-bold">$3.00</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm ml-[1px]">
                                            <span className="text-slate-400 font-medium tracking-wide">Distance (4.2 miles)</span>
                                            <span className="text-white font-bold">$2.94</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm ml-[1px]">
                                             <span className="text-slate-400 font-medium tracking-wide">Wait Time (12 mins)</span>
                                            <span className="text-white font-bold">$3.00</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm ml-[1px]">
                                            <span className="text-slate-400 font-medium tracking-wide">Customer Tip</span>
                                            <span className="text-emerald-400 font-bold">$6.00</span>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/10 flex justify-between items-end mt-4 relative z-10 px-1">
                                        <div className="ml-[1px]">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Total Earned</p>
                                            <p className="text-4xl font-black text-white tracking-tight leading-none">$14.94</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Driving Time</p>
                                            <p className="text-lg font-bold text-slate-300 leading-none">18 mins</p>
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

                        <div className="bg-[#0a0a0a] border border-white/10 p-10 md:p-12 rounded-[2rem] text-center space-y-6 shadow-xl relative overflow-hidden">
                            <h3 className="text-3xl font-bold text-white relative z-10">Start today. <br />Pay out today.</h3>
                            <p className="text-slate-400 text-sm font-medium relative z-10 mb-8 mt-2">Join thousands of drivers who are earning more with TrueServe.</p>
                            <div className="relative z-10 pt-2 pb-2">
                                <button
                                    onClick={scrollToForm}
                                    className="inline-block bg-primary text-black px-10 py-3 font-bold text-sm rounded-xl hover:bg-emerald-500 transition-colors shadow-lg"
                                >
                                    Apply Now
                                </button>
                            </div>
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
                    <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-widest text-slate-600">
                        <Link href="/legal" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/legal" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/help" className="hover:text-white transition-colors">Help</Link>
                        <Link href="/driver/login" className="hover:text-white transition-colors">Login</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
