"use client";

export default function OnboardingPortal() {
    return (
        <div className="min-h-screen bg-[#02040a] text-white selection:bg-primary font-sans relative overflow-x-hidden p-4 md:p-8">
            {/* Structural Background Pattern (Legitimacy Indicator) */}
            <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Main Directive Enclosure */}
            <div className="relative z-10 w-full max-w-5xl mx-auto bg-white/[0.02] border border-white/10 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
                
                {/* Official Header Bar */}
                <div className="bg-white/5 border-b border-white/10 p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-8 text-center md:text-left">
                        <div className="p-3 bg-white rounded-2xl shadow-2xl flex-shrink-0">
                            <img src="/logo.png" alt="TrueServe Official Logo" className="w-16 h-16 object-contain" />
                        </div>
                        <div className="h-16 w-px bg-white/10 hidden md:block" />
                        <div>
                            <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">Corporate Directive</h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-primary">Pilot Fleet Operational Protocol — v2026.1</p>
                        </div>
                    </div>
                    <div className="text-center md:text-right space-y-2 border border-white/10 p-4 rounded-xl bg-black/40">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Status: <span className="text-primary font-black">● AUTHORIZED SYSTEM</span></p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-2">Control ID: <span className="text-white">TRUE-SERVE-P-001</span></p>
                    </div>
                </div>

                <main className="p-8 md:p-20 space-y-24">
                    {/* Part I: Integration Hierarchy */}
                    <section className="space-y-12">
                        <div className="flex items-baseline gap-4 border-b border-white/5 pb-6">
                            <span className="text-5xl font-serif italic text-primary">I.</span>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">System Integration Registry</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            {/* Toast Section */}
                            <div className="space-y-8 p-10 bg-white/[0.02] border border-white/5 rounded-3xl relative group transition-colors hover:border-primary/20">
                                <div className="absolute -top-4 -left-4 bg-primary text-black text-[10px] font-black px-4 py-1 uppercase tracking-widest">Standard: TOAST</div>
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter pt-4">Hardware Sync</h3>
                                <div className="space-y-4 text-xs font-bold text-slate-500 leading-relaxed italic">
                                    <p>1. Access Authorized Partner Portal (Admin Level).</p>
                                    <p>2. Generate Secure "Custom Integration" Credentials.</p>
                                    <p>3. Capture Client ID & Managed Secret.</p>
                                    <div className="mt-6 p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-[10px] text-primary">
                                        TARGET: /api/webhook/pos/toast
                                    </div>
                                </div>
                            </div>

                            {/* Square Section */}
                            <div className="space-y-8 p-10 bg-white/[0.02] border border-white/5 rounded-3xl relative group transition-colors hover:border-primary/20">
                                <div className="absolute -top-4 -left-4 bg-primary text-black text-[10px] font-black px-4 py-1 uppercase tracking-widest">Standard: SQUARE</div>
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter pt-4">Marketplace Link</h3>
                                <div className="space-y-4 text-xs font-bold text-slate-500 leading-relaxed italic">
                                    <p>1. Initialize Square Developer Console Dashboard.</p>
                                    <p>2. Provision Production Access API Environment.</p>
                                    <p>3. Deploy Personal Access Token to TrueServe Hub.</p>
                                    <div className="mt-6 p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-[10px] text-primary">
                                        TARGET: /api/webhook/pos/square
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Part II: Verification Checklist */}
                    <section className="space-y-12">
                         <div className="flex items-baseline gap-4 border-b border-white/5 pb-6">
                            <span className="text-5xl font-serif italic text-primary">II.</span>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Compliance Checklist</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ComplianceRow title="Financial Settlement" status="Verified Connect Path Required" />
                            <ComplianceRow title="Operational Hours" status="Synchronized with POS Calendar" />
                            <ComplianceRow title="Menu Pricing" status="Configured for Marketplace Margin" />
                            <ComplianceRow title="Support Protocol" status="Email tech@trueservedelivery.com" />
                        </div>
                    </section>

                    {/* Part III: Handover & Approval (THE "LEGIT" SECTION) */}
                    <section className="space-y-12 pt-12 border-t border-white/10">
                        <div className="flex items-baseline gap-4">
                            <span className="text-5xl font-serif italic text-primary">III.</span>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Authorized Handover</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-8">
                             <div className="space-y-8">
                                 <p className="text-[10px] uppercase font-black tracking-widest text-slate-700 italic">Merchant Representative Certification</p>
                                 <div className="h-px bg-white/20 w-full" />
                                 <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 italic">
                                     <span>Signature</span>
                                     <span>Date</span>
                                 </div>
                             </div>
                             <div className="space-y-8">
                                 <p className="text-[10px] uppercase font-black tracking-widest text-slate-700 italic">TrueServe Operational Witness</p>
                                 <div className="h-px bg-white/20 w-full" />
                                 <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 italic">
                                     <span>Verified Seal</span>
                                     <span>Official Initials</span>
                                 </div>
                             </div>
                        </div>
                    </section>
                </main>

                {/* Footer Bar */}
                <footer className="bg-white/5 border-t border-white/10 p-12 text-center flex flex-col items-center gap-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-600">Encrypted Deployment Pipeline • Zero Trust Protocol</p>
                    <div className="flex gap-4">
                        <button onClick={() => window.print()} className="px-10 py-4 bg-primary text-black text-[11px] font-black uppercase tracking-widest rounded-full h-glow hover:scale-105 transition-transform italic">
                            Generate Document File (PDF)
                        </button>
                    </div>
                </footer>
            </div>

            <style jsx>{`
                @media print {
                    body { background: white !important; padding: 0 !important; }
                    .min-h-screen { background: white !important; padding: 0 !important; }
                    .relative.z-10 { box-shadow: none !important; border: 1px solid #eee !important; width: 100% !important; max-width: 100% !important; }
                    .bg-white\/5 { background: #f9f9f9 !important; }
                    .bg-\[\#02040a\] { background: white !important; }
                    .text-white { color: black !important; }
                    .text-slate-500, .text-slate-600, .text-slate-700 { color: #666 !important; }
                    .border-white\/10, .border-white\/5 { border-color: #eee !important; }
                    .bg-primary { background: #f59e0b !important; color: white !important; }
                    .text-primary { color: #000 !important; font-weight: 900 !important; }
                    .fixed, footer button { display: none !important; }
                }
            `}</style>
        </div>
    );
}

function ComplianceRow({ title, status }: { title: string, status: string }) {
    return (
        <div className="flex items-center justify-between p-6 bg-white/[0.01] border border-white/5 rounded-2xl group transition-all hover:bg-white/[0.03]">
            <div className="flex items-center gap-4">
                <div className="w-5 h-5 border border-white/10 rounded flex items-center justify-center text-[10px] font-black text-primary opacity-20 group-hover:opacity-100 transition-opacity">✓</div>
                <p className="text-[11px] font-black uppercase text-white tracking-widest italic">{title}</p>
            </div>
            <p className="text-[10px] font-bold italic text-slate-700 uppercase tracking-widest">{status}</p>
        </div>
    );
}
