"use client";

import Link from "next/link";

export default function OnboardingPortal() {
    return (
        <div className="min-h-screen bg-[#02040a] text-white selection:bg-primary font-sans relative overflow-x-hidden">
            {/* Animated Mesh Gradient Background (Consistent with Step 15) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-blob filter" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-primary/5 rounded-full blur-[120px] animate-blob-reverse filter delay-700" />
            </div>

            {/* Header / Logo Section */}
            <header className="relative z-10 w-full max-w-7xl mx-auto flex justify-between items-center p-8 md:p-12 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <img src="/logo.png" alt="TrueServe Logo" className="w-14 h-14 rounded-2xl border border-white/10 shadow-2xl" />
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">TrueServe <span className="text-primary not-italic">Hub</span></h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-1">Onboarding Terminal — v2.0</p>
                    </div>
                </div>
                <div className="hidden md:flex gap-4">
                    <button onClick={() => window.print()} className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all italic">
                        Print as PDF
                    </button>
                </div>
            </header>

            <main className="relative z-10 w-full max-w-5xl mx-auto py-20 px-8 text-center">
                <div className="reveal space-y-6 mb-20">
                    <h2 className="text-5xl md:text-7xl font-serif italic text-white tracking-tight leading-none">
                        Welcome to the <br />
                        <span className="text-primary not-italic uppercase font-black">Future of Delivery.</span>
                    </h2>
                    <p className="text-slate-400 text-lg md:text-xl font-medium italic leading-relaxed max-w-2xl mx-auto">
                        Your partnership with TrueServe begins here. Follow this guide to link your current POS system and launch your digital storefront.
                    </p>
                </div>

                {/* Step Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-24">
                    <StepCard 
                        number="01" 
                        title="Link Your POS" 
                        desc="Connect Toast, Square, or Clover to sync your menu instantly." 
                        icon="🔌"
                    />
                    <StepCard 
                        number="02" 
                        title="Configure Fees" 
                        desc="Set your custom marketplace markup and delivery radius." 
                        icon="⚙️"
                    />
                    <StepCard 
                        number="03" 
                        title="Go Live" 
                        desc="Switch your terminal to 'Active' and start accepting elite orders." 
                        icon="🚀"
                    />
                </div>

                {/* Integration Deep Dive */}
                <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 text-left space-y-12 backdrop-blur-3xl shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-12 text-9xl font-black italic text-white/5 select-none transition-transform group-hover:scale-110">POS</div>
                    
                    <div className="space-y-4">
                        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">The Integration Protocol</h3>
                        <p className="text-slate-500 font-bold italic max-w-2xl">Use these credentials to link your physical hardware to the TrueServe marketplace cloud.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Toast Instructions */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xs">A</div>
                                <h4 className="text-lg font-black text-white uppercase italic tracking-widest">Toast Setup</h4>
                            </div>
                            <div className="pl-11 space-y-4 text-sm text-slate-400 leading-relaxed font-medium">
                                <p>1. Navigate to <strong>Integrations</strong> in your Toast Web Portal.</p>
                                <p>2. Select <strong>'Custom Integration'</strong> or search for <strong>'TrueServe'</strong>.</p>
                                <p>3. Generate your <strong>Client ID</strong> and <strong>Client Secret</strong>.</p>
                                <p>4. Input these into your TrueServe Merchant Dashboard under <strong>Settings</strong>.</p>
                            </div>
                            <div className="pl-11 pt-4">
                                <a href="mailto:support@pos.com?subject=API Access Request - TrueServe Integration" className="text-xs font-black uppercase text-primary hover:underline italic tracking-widest">Copy Email Template →</a>
                            </div>
                        </div>

                        {/* Square Instructions */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xs">B</div>
                                <h4 className="text-lg font-black text-white uppercase italic tracking-widest">Square Setup</h4>
                            </div>
                            <div className="pl-11 space-y-4 text-sm text-slate-400 leading-relaxed font-medium">
                                <p>1. Log in to the <strong>Square Developer Dashboard</strong>.</p>
                                <p>2. Create a new Application called <strong>'TrueServe Marketplace'</strong>.</p>
                                <p>3. Go to <strong>Production Dashboard</strong> and copy your <strong>Access Token</strong>.</p>
                                <p>4. Input this into your TrueServe Merchant Dashboard instantly.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / Support */}
                <footer className="mt-32 pt-16 border-t border-white/5 flex flex-col items-center gap-8">
                    <p className="text-slate-600 text-xs font-black uppercase tracking-[0.5em] italic">TrueServe Operational Support</p>
                    <div className="flex gap-4">
                        <Link href="/merchant/dashboard" className="badge-solid-primary !py-4 !px-12 !text-[11px] h-glow">Launch Dashboard</Link>
                        <Link href="/contact" className="px-10 py-4 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all text-slate-400 hover:text-white italic">Email Tech-Lead</Link>
                    </div>
                    <p className="text-[10px] text-slate-800 font-bold uppercase tracking-widest mt-8">
                        © {new Date().getFullYear()} TrueServe Platform. Propelling local commerce through elite infrastructure.
                    </p>
                </footer>
            </main>

            <style jsx>{`
                @media print {
                    .animate-blob, .animate-blob-reverse { display: none !important; }
                    body { background: white !important; color: black !important; }
                    .bg-white { background: #f8fafc !important; }
                    .text-white { color: black !important; }
                    .text-slate-400, .text-slate-500 { color: #475569 !important; }
                    .border-white\/5 { border-color: #e2e8f0 !important; }
                    .badge-solid-primary { background: #f59e0b !important; color: white !important; }
                }
            `}</style>
        </div>
    );
}

function StepCard({ number, title, desc, icon }: { number: string, title: string, desc: string, icon: string }) {
    return (
        <div className="reveal p-8 bg-white/[0.01] border border-white/5 rounded-[2rem] space-y-4 hover:border-primary/20 transition-all group">
            <div className="flex justify-between items-start">
                <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{icon}</span>
                <span className="text-4xl font-black italic text-white/5 group-hover:text-primary/10 transition-colors uppercase">{number}</span>
            </div>
            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">{title}</h4>
            <p className="text-slate-500 text-sm font-bold italic leading-relaxed">{desc}</p>
        </div>
    );
}
