"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

export default function OnboardingPortal() {
    return (
        <div className="min-h-screen bg-[#0c0e13] text-[#F0EDE8] selection:bg-[#e8a230]/30 font-barlow-cond relative overflow-x-hidden">
            {/* Elite Industrial Background Telemetry */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#e8a230]/5 rounded-full blur-[140px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#e8a230]/3 rounded-full blur-[140px] animate-pulse delay-700" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]"></div>
            </div>

            {/* Cinematic Industrial Header */}
            <header className="relative z-10 w-full max-w-7xl mx-auto flex justify-between items-center p-8 md:p-12">
                <Logo size="md" showPlus={false} />
                <div className="flex items-center gap-6">
                    <button onClick={() => window.print()} className="px-10 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-[#e8a230] hover:border-[#e8a230]/30 transition-all italic shadow-2xl backdrop-blur-md">
                        // Export Directive (PDF)
                    </button>
                </div>
            </header>

            <main className="relative z-10">
                {/* Hero Section - Elite Onboarding Reveal */}
                <section className="max-w-7xl mx-auto px-8 py-20 text-center md:text-left">
                    <div className="max-w-4xl space-y-10 animate-fade-in">
                        <div className="inline-flex px-6 py-2 bg-white/[0.03] border border-white/10 rounded-full text-[#e8a230] text-[9px] font-black uppercase tracking-[0.4em] mb-4 italic">
                            <span>// System Handshake Protocol v2.5</span>
                        </div>
                        <h2 className="text-7xl md:text-9xl font-bebas italic font-black text-white tracking-tight leading-[0.8] uppercase">
                            Your Path to <br />
                            <span className="text-[#e8a230]">Elite Operations.</span>
                        </h2>
                        <p className="text-slate-500 text-xl md:text-2xl font-medium leading-relaxed italic max-w-2xl border-l border-[#e8a230]/30 pl-10 py-4">
                            Synchronize your physical node with the East Coast's premier logistics architecture. Built for centers that demand high-performance settlement.
                        </p>
                    </div>
                </section>

                {/* Tactical Operations Grid */}
                <section className="max-w-7xl mx-auto px-8 mb-48">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <OnboardingCard 
                            step="01" 
                            title="Menu Integration" 
                            desc="Real-time telemetry sync with Toast, Square, and Clover. 300ms latency standard."
                            icon="📂"
                        />
                        <OnboardingCard 
                            step="02" 
                            title="Fleet Matching" 
                            desc="Instant engagement with professional logistics agents within a 5-mile terminal radius."
                            icon="🏁"
                        />
                        <OnboardingCard 
                            step="03" 
                            title="Capital Settlement" 
                            desc="Automatic daily mission settlement protocols. Precise architectural fee transparency."
                            icon="🏦"
                        />
                    </div>
                </section>

                {/* Integration Command Hub */}
                <section className="max-w-7xl mx-auto px-8 mb-48">
                    <div className="bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-12 md:p-24 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-12 text-[180px] font-bebas italic text-white/[0.01] select-none pointer-events-none group-hover:text-white/[0.02] transition-all">LINK</div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
                            <div className="space-y-12">
                                <div className="inline-flex px-6 py-2 bg-[#e8a230]/10 border border-[#e8a230]/20 rounded-full text-[9px] font-black text-[#e8a230] uppercase tracking-[0.4em] italic shadow-glow">
                                    // HARDWARE HANDSHAKE
                                </div>
                                <h3 className="text-5xl md:text-7xl font-bebas italic text-white tracking-tight leading-[0.9] uppercase italic">
                                    Link your physical <br />
                                    <span className="text-[#e8a230]">Store Terminal.</span>
                                </h3>
                                <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed italic pr-12">
                                    Whether you maintain a Toast or Square node, our protocol authorizes your hardware 
                                    within a secure environment. No complex APIs, just modular verification.
                                </p>
                                <Link href="/merchant/dashboard" className="inline-block px-14 py-6 bg-[#e8a230] text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:scale-105 transition-all shadow-glow shadow-[#e8a230]/20 italic">
                                    Launch Dashboard Interface →
                                </Link>
                            </div>

                            <div className="space-y-8">
                                <GuidelineItem 
                                    title="Toast Node" 
                                    desc="Select 'TrueServe' in your Toast Integration hub and synchronize the Client ID." 
                                />
                                <GuidelineItem 
                                    title="Square Node" 
                                    desc="Authorize production tokens within the Square Developer gateway in 60 seconds." 
                                />
                                <GuidelineItem 
                                    title="Manual Node Map" 
                                    desc="Our fleet engineers will hand-map your menu catalog if you lack a digital POS handshake." 
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Formal Verification Footer */}
                <footer className="max-w-7xl mx-auto px-8 pt-24 border-t border-white/5 pb-24 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                    <div className="flex flex-col gap-4">
                        <p className="text-[10px] font-black uppercase text-white tracking-[0.4em] leading-none italic">// Support Telemetry Active</p>
                        <p className="text-[9px] font-bold text-[#e8a230] uppercase tracking-[0.2em] opacity-60 italic animate-pulse">STATUS: VERIFIED PILOT NETWORK V2.0</p>
                    </div>
                    <div className="px-8 py-5 bg-white/[0.03] border border-white/10 rounded-2xl shadow-xl backdrop-blur-md">
                         <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.5em] italic">Official Network ID: <span className="text-white">TRUE-SERVE-PN-2026-X</span></p>
                    </div>
                </footer>
            </main>

            <style jsx>{`
                @media print {
                    body { background: white !important; color: black !important; padding: 0 !important; }
                    .min-h-screen { background: white !important; }
                    .absolute, .animate-pulse, header button { display: none !important; }
                    .bg-white\/\[0\.02\] { border: 1px solid #ccc !important; background: transparent !important; }
                    .text-white, .text-\[\#F0EDE8\] { color: black !important; }
                    .text-slate-500 { color: #555 !important; }
                    .text-\[\#e8a230\], .text-primary { color: #e8a230 !important; }
                    footer, header button { display: none !important; }
                }
            `}</style>
        </div>
    );
}

function OnboardingCard({ step, title, desc, icon }: { step: string, title: string, desc: string, icon: string }) {
    return (
        <div className="p-12 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-10 hover:border-[#e8a230]/30 transition-all group backdrop-blur-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-7xl opacity-[0.02] font-bebas italic pointer-events-none group-hover:opacity-[0.05] transition-all">DATA</div>
            <div className="flex justify-between items-center">
                <span className="text-5xl drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]">{icon}</span>
                <span className="text-[9px] font-black text-[#e8a230] uppercase tracking-[0.4em] italic shadow-glow">PROTOCOL {step}</span>
            </div>
            <div>
                <h4 className="text-3xl font-bebas italic text-white uppercase tracking-wider group-hover:text-[#e8a230] transition-colors mb-4">{title}</h4>
                <p className="text-sm text-slate-600 font-medium italic leading-relaxed group-hover:text-slate-400 transition-colors">{desc}</p>
            </div>
        </div>
    );
}

function GuidelineItem({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="p-10 bg-black/40 border border-white/5 rounded-[2rem] space-y-4 group hover:border-[#e8a230]/40 transition-all shadow-xl">
            <h4 className="text-[10px] font-black uppercase text-[#e8a230] tracking-[0.4em] italic">// {title}</h4>
            <p className="text-sm text-slate-500 font-medium italic leading-relaxed group-hover:text-slate-300 transition-colors">{desc}</p>
        </div>
    );
}


