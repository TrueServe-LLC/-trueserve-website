import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function BenefitsPage() {
    const [selectedTier, setSelectedTier] = useState('Plus');

    return (
        <div className="min-h-screen bg-[#0c0e13] text-[#F0EDE8] selection:bg-[#e8a230]/30 font-barlow-cond relative overflow-hidden">
            {/* Elite Industrial HUD Background */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[10%] left-[-5%] w-[600px] h-[600px] bg-[#e8a230]/3 rounded-full blur-[140px] animate-pulse" />
                <div className="absolute bottom-0 right-0 w-full h-[40%] bg-gradient-to-t from-[#e8a230]/5 to-transparent opaicty-20" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]"></div>
            </div>

            {/* Header - Fixed Industrial HUD */}
            <nav className="sticky top-0 z-50 backdrop-blur-3xl border-b border-white/5 px-6 sm:px-12 py-5 bg-[#0c0e13]/90">
                <div className="container mx-auto flex justify-between items-center">
                    <Logo size="md" showPlus={true} />
                    <Link href="/restaurants" className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#e8a230] hover:text-black transition-all italic">
                        Terminal Access
                    </Link>
                </div>
            </nav>

            <main className="container max-w-7xl py-24 px-6 mx-auto relative z-10">
                {/* Hero Section - Cinematic Industrial */}
                <div className="text-center mb-40 relative px-4 flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/[0.03] border border-white/10 rounded-full text-[#e8a230] text-[9px] font-black uppercase tracking-[0.4em] mb-12 shadow-2xl backdrop-blur-md italic">
                        <span>// Enrollment Protocol v2.4</span>
                    </div>
                    <h1 className="text-6xl md:text-9xl font-bebas italic font-black tracking-tighter mb-10 leading-[0.8] uppercase text-white">
                        Elite <br />
                        <span className="text-[#e8a230]">Standards.</span>
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed italic font-medium" style={{ textWrap: 'balance' }}>
                        A modular logistics architecture built for high-performance independent centers and the community that synchronizes with them.
                    </p>
                </div>

                {/* Tiered Membership HUD */}
                <div className="mb-48 relative z-20">
                    <h2 className="text-center text-3xl md:text-4xl font-bebas italic mb-20 tracking-widest uppercase text-white shadow-glow">Tier Selection Hub</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 max-w-6xl mx-auto">
                        <PricingCard
                            tier="Basic"
                            price="Free"
                            subtitle="Default Access Nodes"
                            isActive={selectedTier === 'Basic'}
                            onClick={() => setSelectedTier('Basic')}
                            features={[
                                "Standard Marketplace Access",
                                "Basic Loyalty Accumulation",
                                "Digital Receipt Archiving",
                                "Community Status Updates"
                            ]}
                            buttonText="Select Standard"
                            buttonLink="/login"
                        />
                        <PricingCard
                            tier="Plus"
                            price="$9.99"
                            subtitle="High-Performance Tier"
                            isActive={selectedTier === 'Plus'}
                            onClick={() => setSelectedTier('Plus')}
                            features={[
                                "Priority Fleet Matching",
                                "Triple Loyalty Yields (3x)",
                                "Early Asset Dispatches",
                                "5% Merchant Reductions",
                                "Verified Tier Status"
                            ]}
                            isPopular={true}
                            buttonLink="/login?plus=true"
                        />
                        <PricingCard
                            tier="Premium"
                            price="$19.99"
                            subtitle="Ultimate Infrastructure"
                            isActive={selectedTier === 'Premium'}
                            onClick={() => setSelectedTier('Premium')}
                            features={[
                                "Zero Delivery Protocols ($0)",
                                "Exclusive Menu Telemetry",
                                "24/7 Strategic Support",
                                "Double Rewards Scaling",
                                "Advanced Mission Scheduling"
                            ]}
                            buttonLink="/login?premium=true"
                        />
                    </div>
                </div>

                {/* Industrial Feature Sections */}
                <div className="space-y-48 mb-48">
                    {/* 1. Merchant-Sync Architecture */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="order-2 lg:order-1">
                             <div className="inline-flex px-4 py-1.5 bg-[#e8a230]/10 border border-[#e8a230]/20 rounded-full text-[#e8a230] text-[9px] font-black uppercase tracking-[0.3em] mb-8 italic">
                                // MERCHANT-SYNC v1.0
                             </div>
                            <h2 className="text-4xl md:text-6xl font-bebas italic font-black mt-4 mb-10 leading-[0.9] text-white uppercase italic">Loyalty fuels <br /><span className="text-[#e8a230]">Culinary growth.</span></h2>
                            <div className="space-y-12">
                                <FeatureDetail
                                    icon="🤝"
                                    title="Strategic Discounts"
                                    text="Members receive 5–10% off at participating culinary centers. Merchants fund this exposure directly because they value long-term network sync."
                                />
                                <FeatureDetail
                                    icon="⭐"
                                    title="Exclusive Asset Access"
                                    text="Early access to limited menu items, member-only culinary drops, and special weekly tactical meal pairings."
                                />
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="w-full aspect-square bg-white/[0.02] border border-white/5 rounded-[4rem] flex items-center justify-center p-20 relative overflow-hidden group shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#e8a230]/10 via-transparent to-transparent opacity-50"></div>
                                <div className="absolute top-0 right-0 p-12 text-9xl font-bebas italic text-white/[0.01] select-none pointer-events-none group-hover:text-white/[0.03] transition-colors">SYNC</div>
                                <div className="text-[140px] filter drop-shadow-[0_0_50px_rgba(232,162,48,0.2)] group-hover:scale-110 transition-transform duration-700">🍴</div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Tactical Convenience */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="hidden lg:block relative">
                            <div className="w-full aspect-square bg-white/[0.02] border border-white/5 rounded-[4rem] flex items-center justify-center p-20 relative overflow-hidden group shadow-2xl rotate-3">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#e8a230]/5 via-transparent to-transparent opacity-30"></div>
                                <div className="text-[140px] filter drop-shadow-[0_0_60px_rgba(255,255,255,0.05)] group-hover:scale-110 transition-transform duration-700">⚡</div>
                            </div>
                        </div>
                        <div>
                            <div className="inline-flex px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-[9px] font-black uppercase tracking-[0.3em] mb-8 italic">
                                // MISSION PARAMETERS
                            </div>
                            <h2 className="text-4xl md:text-6xl font-bebas italic font-black mt-4 mb-10 leading-[0.9] text-white uppercase italic">
                                Tactical <br /><span className="text-[#e8a230]">Superiority.</span>
                            </h2>
                            <div className="space-y-12">
                                <FeatureDetail
                                    icon="🏁"
                                    title="Elite Fleet Dispatch"
                                    text="Accelerated driver assignment protocols and peak-hour prioritization. Dedicated tactical support lanes for instant resolution."
                                />
                                <FeatureDetail
                                    icon="💎"
                                    title="Transparent Pricing"
                                    text="Zero hidden variables. Audit exactly what the merchant and driver settle on every single mission handshake."
                                />
                                <FeatureDetail
                                    icon="📂"
                                    title="Mission Archives"
                                    text="Single-click re-engagement of your favorite culinary mission parameters and scheduled recurring supply drops."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final Call to Order */}
                <div className="text-center mb-40 bg-white/[0.02] border border-white/5 rounded-[3rem] p-16 md:p-32 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-[#e8a230]/5 rounded-full blur-[100px] -z-10" />
                    <h2 className="text-4xl md:text-6xl font-bebas italic font-black mb-8 uppercase text-white tracking-widest">Execute Your Upgrade.</h2>
                    <p className="text-slate-500 mb-16 italic font-medium max-w-2xl mx-auto">Launch-ready features include Elite Dispatch, Asset Protection, and 5% Instant Merchant Yields.</p>
                    <Link href="/login" className="inline-block px-14 py-6 bg-[#e8a230] text-black text-xs font-black uppercase tracking-[0.3em] shadow-glow rounded-2xl hover:scale-105 active:scale-95 transition-all italic">
                        Initialize {selectedTier} Status →
                    </Link>
                </div>

            </main>

            {/* Industrial Footer */}
            <footer className="border-t border-white/5 py-24 px-6 bg-[#0c0e13] relative z-10">
                <div className="container max-w-6xl mx-auto flex flex-col items-center text-center">
                    <Logo size="md" className="mb-10" />
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.5em] italic">
                        Redefining the digital bridge between <br />
                        culinary artists and elite logistics.
                    </p>
                </div>
            </footer>
        </div>
    );
}

function PricingCard({ tier, price, subtitle, isActive = false, isPopular = false, onClick, features, buttonText = "Join " + tier, buttonLink = "/login" }: any) {
    return (
        <div
            onClick={onClick}
            className={`cursor-pointer group relative rounded-[3rem] border-2 flex flex-col items-center text-center transition-all duration-500 h-full overflow-hidden ${isActive
                ? 'bg-[#0c0e13] border-[#e8a230] shadow-[0_0_80px_rgba(232,162,48,0.1)] z-10 scale-[1.05]'
                : 'bg-white/[0.02] border-white/5 z-0 hover:border-white/20 hover:bg-white/[0.04]'
                }`}>

            <div className="flex-1 w-full p-12 flex flex-col items-center">
                <div className="mb-10 w-full relative">
                    {isPopular && (
                        <span className="absolute -top-16 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#e8a230] text-black rounded-full text-[8px] font-black uppercase tracking-widest shadow-glow italic">RECOMMENDED</span>
                    )}
                    <h3 className={`text-4xl font-bebas italic mb-2 transition-colors uppercase ${isActive ? 'text-[#e8a230]' : 'text-white'}`}>{tier}</h3>
                    <p className="text-[8px] text-[#e8a230] font-black uppercase tracking-[0.4em] opacity-60 italic">{subtitle}</p>
                </div>

                <div className="flex items-end justify-center gap-2 mb-12 w-full text-white">
                    <span className="text-7xl font-bebas italic tracking-tighter">{price}</span>
                    {price !== 'Free' && <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-3">/ mission</span>}
                </div>

                <ul className="space-y-6 w-full flex-1">
                    {features.map((f: string) => (
                        <li key={f} className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center justify-center gap-3 italic">
                            <div className={`w-1 h-1 rounded-full shrink-0 ${isActive ? 'bg-[#e8a230]' : 'bg-white/10'}`} />
                            <span className="leading-tight group-hover:text-slate-300 transition-colors">{f}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <Link
                href={buttonLink}
                onClick={(e) => e.stopPropagation()}
                className={`block w-full py-6 font-black text-[10px] uppercase tracking-[0.3em] transition-all text-center relative z-20 italic ${isActive
                    ? 'bg-[#e8a230] text-black'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 border-t border-white/5'
                    }`}
            >
                {buttonText}
            </Link>
        </div>
    );
}

function FeatureDetail({ icon, title, text }: { icon: string, title: string, text: string }) {
    return (
        <div className="flex gap-8 items-start group">
            <div className="w-16 h-16 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 group-hover:border-[#e8a230]/40 transition-all duration-500 shadow-xl">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bebas italic mb-3 text-white uppercase tracking-widest">{title}</h3>
                <p className="text-slate-500 italic leading-relaxed text-sm font-medium pr-10">{text}</p>
            </div>
        </div>
    );
}


