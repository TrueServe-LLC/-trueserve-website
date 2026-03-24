export const dynamic = "force-dynamic";

import Link from "next/link";
import DriverApplicationForm from "@/app/driver/DriverApplicationForm";

export default function DriverSignupPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-emerald-500 font-sans">
            {/* Cinematic Hero */}
            <div className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1585909600100-3484f279a78a?q=80&w=2400&auto=format&fit=crop" 
                    alt="Scooter Delivery Cinematic" 
                    className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000 scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <Link href="/driver" className="mb-8 w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 hover:border-emerald-500 transition-all text-emerald-500 shadow-2xl backdrop-blur-md">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                    </Link>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-2 mb-6 backdrop-blur-md">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Join the Elite Fleet</p>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none mb-4 px-2">
                        Strategic <span className="text-emerald-500 italic">Delivery.</span>
                    </h1>
                    <p className="text-slate-400 text-sm md:text-lg font-medium max-w-2xl italic">
                        The most efficient mileage-based engine in the South East corridor. <br className="hidden md:block" />
                        Synchronize your schedule, maximize your net earnings.
                    </p>
                </div>
            </div>

            <main className="container py-24 md:py-32 px-4 md:px-8 pb-40 relative z-10 -mt-20">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
                   
                    {/* Left Side: Context & Visuals */}
                    <div className="lg:col-span-5 space-y-12 h-fit md:sticky md:top-32">
                        <div>
                           <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-tight mb-6 px-2">Fleet Onboarding <br />Process.</h2>
                           <p className="text-slate-500 text-lg font-medium leading-relaxed italic max-w-sm mb-12">Complete the synchronization to unlock your operational credentials.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                           {[
                             { icon: '💸', label: 'T+0 Settlements', desc: 'Earnings transferred instantly.' },
                             { icon: '🗺️', label: 'Smart Grid', desc: 'Optimized high-velocity routing.' },
                             { icon: '🛡️', label: 'Safety Sync', desc: 'Premium logistics protection.' }
                           ].map((item, i) => (
                             <div key={i} className="flex gap-6 items-center p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] group hover:border-emerald-500/20 transition-all">
                                <div className="text-3xl group-hover:scale-110 transition-transform">{item.icon}</div>
                                <div>
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-white mb-1 italic">{item.label}</h4>
                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider italic">{item.desc}</p>
                                </div>
                             </div>
                           ))}
                        </div>

                        {/* Social Proof Image */}
                        <div className="relative rounded-[2.5rem] overflow-hidden group shadow-2xl border border-white/5 h-[300px]">
                            <img 
                                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200" 
                                className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-x-8 bottom-8 p-6 bg-black/60 backdrop-blur-md rounded-3xl border border-white/10">
                                <p className="text-white font-black italic uppercase tracking-tighter text-sm">Join 2,400+ Trusted Fleet Partners</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Deployment Form */}
                    <div className="lg:col-span-7">
                        <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-3xl">
                            <DriverApplicationForm />
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-24 bg-black border-t border-white/5">
                <div className="container max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="Logo" className="w-12 h-12 border border-white/10 rounded-full shadow-xl" />
                        <span className="font-black text-slate-500 tracking-tighter text-2xl italic uppercase">TrueServe Fleet &copy; {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-end gap-x-12 gap-y-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-600">
                        <Link href="/legal" className="hover:text-white transition-colors">Safety Standard</Link>
                        <Link href="/legal" className="hover:text-white transition-colors">Fleet Terms</Link>
                        <Link href="/driver/login" className="hover:text-emerald-500 transition-colors text-emerald-500 italic">Fleet Entry</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
