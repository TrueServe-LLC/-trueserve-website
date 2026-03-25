"use client";

import Link from "next/link";

export default function OnboardingPortal() {
    return (
        <div className="min-h-screen bg-[#02040a] text-white selection:bg-primary font-sans relative overflow-x-hidden">
            {/* Soft Warm Glows (Welcoming Aesthetic) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[160px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[160px]" />
            </div>

            {/* Top Navigation */}
            <header className="relative z-10 w-full max-w-7xl mx-auto flex justify-between items-center p-8 md:p-12">
                <div className="flex items-center gap-6">
                    <div className="p-2 bg-white rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-12 h-12 object-contain" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">TrueServe <span className="text-primary italic">Partner Hub</span></h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Everything you need to grow.</p>
                    </div>
                </div>
                <button onClick={() => window.print()} className="hidden md:block px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    Print Quick-Start Guide
                </button>
            </header>

            <main className="relative z-10 w-full max-w-5xl mx-auto py-12 px-8">
                {/* Welcoming Hero */}
                <div className="mb-24 space-y-8 max-w-3xl">
                    <h2 className="text-5xl md:text-7xl font-serif italic text-white tracking-tight leading-none">
                        Welcome to the <br />
                        <span className="text-primary not-italic uppercase font-black">TrueServe Family.</span>
                    </h2>
                    <p className="text-slate-400 text-xl font-medium leading-relaxed italic max-w-2xl">
                        We’re thrilled to help you scale. TrueServe isn't just a delivery portal—it's a complete ecosystem designed to manage your orders, payments, and driver logistics with zero friction.
                    </p>
                </div>

                {/* The 3 Pillars of Launch */}
                <section className="mb-32">
                    <h3 className="text-xs uppercase font-black tracking-[0.4em] text-white/40 mb-12">Your Launch Sequence</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard 
                            title="1. Link Your Menu" 
                            desc="Whether you use Toast, Square, or paper menus, we'll sync your items so customers see exactly what's available."
                            icon="🍽️"
                        />
                        <FeatureCard 
                            title="2. Driver Logistics" 
                            desc="Our fleet of elite drivers is ready. We handle the routing, insurance, and live-tracking for every single bag."
                            icon="🚗"
                        />
                        <FeatureCard 
                            title="3. Secure Payouts" 
                            desc="Payments go directly to your bank via Stripe. No hidden fees, just transparent, daily settlements."
                            icon="💰"
                        />
                    </div>
                </section>

                {/* Simplified POS Guide */}
                <section className="mb-32 bg-white/[0.03] border border-white/10 rounded-[3rem] p-12 md:p-20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 text-9xl font-black italic text-white/[0.02] select-none">GROWTH</div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">Setting up your <span className="text-primary">POS System.</span></h3>
                            <p className="text-slate-400 font-medium italic leading-relaxed">
                                Most of our partners use Toast or Square, but don't worry if you don't. Our team can help you map any menu system to our platform in minutes.
                            </p>
                            <div className="space-y-4">
                                <Link href="/merchant/dashboard" className="inline-block px-10 py-4 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-full hover:scale-105 transition-transform italic">
                                    Go to Merchant Dashboard →
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="p-8 bg-black/40 border border-white/5 rounded-2xl space-y-4">
                                <h4 className="text-xs font-black uppercase text-white tracking-[0.2em]">Option A: Toast Partners</h4>
                                <p className="text-[11px] text-slate-500 font-bold italic leading-relaxed">
                                    Login to your Toast Web Portal, go to 'Integrations', and invite "TrueServe" as a partner. We'll handle the rest.
                                </p>
                            </div>
                            <div className="p-8 bg-black/40 border border-white/5 rounded-2xl space-y-4">
                                <h4 className="text-xs font-black uppercase text-white tracking-[0.2em]">Option B: Square & Others</h4>
                                <p className="text-[11px] text-slate-500 font-bold italic leading-relaxed">
                                    Simply generate an 'Access Token' in your dashboard and paste it into our settings tab. It's instant sync.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Support Protocol */}
                <footer className="mt-40 pt-20 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-12 pb-20">
                    <div className="text-center md:text-left space-y-2">
                        <p className="text-xs font-black uppercase text-white tracking-widest">Need technical help?</p>
                        <p className="text-slate-500 font-bold italic">Our launch engineers are standing by: support@trueservedelivery.com</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600">
                            Partner Support Status: ACTIVE
                        </div>
                    </div>
                </footer>
            </main>

            <style jsx>{`
                @media print {
                    body { background: white !important; color: black !important; padding: 0 !important; }
                    .min-h-screen { background: white !important; }
                    .absolute { display: none !important; }
                    .bg-white\/\[0\.03\] { border: 1px solid #eee !important; background: transparent !important; }
                    .text-white { color: black !important; }
                    .text-slate-400, .text-slate-500 { color: #555 !important; }
                    .text-primary { color: #f59e0b !important; }
                    footer, header button { display: none !important; }
                }
            `}</style>
        </div>
    );
}

function FeatureCard({ title, desc, icon }: { title: string, desc: string, icon: string }) {
    return (
        <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-6 hover:border-primary/30 transition-all group">
            <span className="text-4xl">{icon}</span>
            <h4 className="text-xl font-black text-white uppercase italic tracking-tighter group-hover:text-primary transition-colors">{title}</h4>
            <p className="text-[11px] text-slate-600 font-bold italic leading-relaxed">{desc}</p>
        </div>
    );
}

