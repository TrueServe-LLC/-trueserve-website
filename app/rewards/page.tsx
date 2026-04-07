
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function RewardsPage() {
    return (
        <div className="min-h-screen bg-[#0c0e13] text-[#F0EDE8] selection:bg-[#e8a230]/30 pb-24 relative overflow-hidden font-barlow-cond">
            {/* Elite Industrial Background Elements */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#e8a230]/5 rounded-full blur-[160px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#e8a230]/3 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '3s' }} />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>
            </div>

            {/* Navigation - Industrial HUD Style */}
            <nav className="sticky top-0 z-50 backdrop-blur-2xl border-b border-white/5 px-6 sm:px-12 py-5 bg-[#0c0e13]/80">
                <div className="container mx-auto flex justify-between items-center">
                    <Logo size="md" showPlus={true} />
                    <div className="hidden sm:flex items-center gap-8">
                        <Link href="/restaurants" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-[#e8a230] transition-all italic">Back to Terminals</Link>
                        <div className="bg-[#e8a230]/10 border border-[#e8a230]/20 text-[#e8a230] px-5 py-2 rounded-xl text-[11px] font-black tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(232,162,48,0.1)]">
                            <span className="opacity-60 font-medium">BALANCE:</span> 2,450 PTS
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto py-20 px-6 animate-fade-in relative z-10">
                {/* Hero Section - Cinematic Industrial */}
                <div className="text-center mb-32 relative">
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/[0.03] border border-white/10 rounded-full text-[#e8a230] text-[9px] font-black uppercase tracking-[0.4em] mb-10 shadow-2xl backdrop-blur-md italic">
                        <span>// Loyalty Telemetry v2.0</span>
                    </div>
                    <h1 className="text-6xl md:text-9xl font-bebas italic font-black tracking-tighter mb-8 leading-[0.8] text-white uppercase">
                        Rewards <br /><span className="text-[#e8a230]">Interface.</span>
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed italic font-medium">
                        Synchronize your activity with premium redemptions. <br className="hidden md:block" />
                        A fair rewards system built for the elite delivery network.
                    </p>
                </div>

                {/* Points Balance HUD */}
                <div className="mb-24 relative group max-w-5xl mx-auto">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#e8a230]/20 to-transparent rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition-all duration-1000"></div>
                    <div className="relative bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[2rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-12 text-9xl font-bebas italic text-white/[0.02] select-none pointer-events-none">ASSET</div>
                        
                        <div className="text-center md:text-left flex-1 relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#e8a230] mb-6 italic">// Total Verified Yield</p>
                            <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-4 md:gap-8">
                                <span className="text-8xl md:text-9xl font-bebas italic text-white leading-none tracking-tighter">2,450</span>
                                <div className="flex flex-col items-center sm:items-start">
                                    <span className="text-[#e8a230] font-black text-sm uppercase tracking-widest italic animate-pulse shadow-glow">+150 PENDING</span>
                                    <span className="text-slate-600 text-[10px] uppercase font-bold tracking-widest mt-1">Gold Multiplier Active</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0 relative z-10">
                            <button className="flex-1 border border-white/10 hover:bg-white/5 py-4 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all">Audit History</button>
                            <button className="flex-1 bg-[#e8a230] text-black py-4 px-12 rounded-2xl text-[11px] font-black uppercase tracking-widest italic shadow-xl shadow-[#e8a230]/20 hover:scale-105 transition-all">Accumulate</button>
                        </div>
                    </div>
                </div>

                {/* PLUS BANNER - Fixed Integrated Version */}
                <div className="mb-32 max-w-5xl mx-auto relative group overflow-hidden rounded-3xl border border-[#e8a230]/20">
                     <div className="absolute inset-0 bg-gradient-to-r from-[#e8a230]/10 via-transparent to-transparent opacity-50"></div>
                     <div className="relative bg-[#0c0e13] px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
                         <div className="flex items-center gap-8">
                             <div className="w-16 h-16 rounded-2xl bg-[#e8a230]/20 border border-[#e8a230]/30 flex items-center justify-center text-3xl shadow-glow">⚡</div>
                             <div>
                                 <h3 className="text-2xl font-bebas italic text-white uppercase tracking-wider">TrueServe <span className="text-[#e8a230]">Plus</span></h3>
                                 <p className="text-slate-500 text-xs font-medium italic mt-1">Triple your rewards yields and unlock $0 delivery protocols instantly.</p>
                             </div>
                         </div>
                         <Link href="/login?plus=true" className="px-10 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all shadow-xl italic">Upgrade Status</Link>
                     </div>
                </div>

                {/* Redemptions Grid - Industrial Layout */}
                <h2 className="text-3xl font-bebas italic mb-12 px-4 uppercase tracking-widest text-white"><span className="text-[#e8a230]/50 mr-4">//</span> Available Redemptions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                    <RewardCard
                        title="$5.00 Credit"
                        points={500}
                        icon="💵"
                        desc="Instant capital injection applied at checkout terminal."
                    />
                    <RewardCard
                        title="Free Logistics"
                        points={750}
                        icon="🛵"
                        desc="Bypass service fees on your next delivery mission."
                    />
                    <RewardCard
                        title="Elite Appetizer"
                        points={1200}
                        icon="🍟"
                        desc="Authorized at participating merchant culinary nodes."
                    />
                    <RewardCard
                        title="$10.00 Credit"
                        points={1000}
                        icon="💰"
                        desc="Optimized value for recurring fleet operations."
                    />
                    <RewardCard
                        title="Priority Lane"
                        points={2000}
                        icon="⭐"
                        desc="Dedicated support corridor for all account inquiries."
                    />
                    <RewardCard
                        title="Meal Donation"
                        points={2500}
                        icon="❤️"
                        desc="External asset transfer to local community food banks."
                    />
                </div>

                {/* Status HUD */}
                <div className="relative overflow-hidden bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 md:p-20 shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#e8a230]/5 rounded-full blur-[120px] -z-10" />
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-12">
                        <div>
                            <span className="px-4 py-1.5 bg-[#e8a230]/10 text-[#e8a230] rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-[#e8a230]/20 italic shadow-glow">Active Protocol</span>
                            <h3 className="text-5xl md:text-7xl font-bebas italic text-white mt-6 mb-2 tracking-tight">Gold <span className="text-[#e8a230]">Operator</span></h3>
                            <p className="text-slate-500 font-medium italic text-lg leading-relaxed">System performance: 1.5x Multiplier active on all orders.</p>
                        </div>
                        <div className="text-left md:text-right min-w-[200px]">
                            <p className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-2 italic">Next Phase: PLATINUM</p>
                            <p className="text-[10px] text-[#e8a230] font-black uppercase tracking-widest opacity-80">550 pts remaining</p>
                        </div>
                    </div>
                    <div className="relative mt-8">
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                            <div className="h-full bg-gradient-to-r from-[#e8a230]/40 via-[#e8a230] to-[#fff] w-[75%] rounded-full shadow-[0_0_30px_rgba(232,162,48,0.3)]" />
                        </div>
                        <div className="flex justify-between mt-6 px-1">
                            <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] italic">Silver</span>
                            <span className="text-[9px] font-black text-[#e8a230] uppercase tracking-[0.4em] italic shadow-glow">Gold</span>
                            <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] italic">Platinum</span>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}

function RewardCard({ title, points, icon, desc }: { title: string, points: number, icon: string, desc: string }) {
    return (
        <div className="group bg-white/[0.02] border border-white/5 p-12 rounded-[2.5rem] flex flex-col h-full hover:bg-white/[0.05] hover:border-[#e8a230]/20 transition-all duration-500 relative overflow-hidden text-center items-center shadow-lg">
            <div className="absolute top-0 right-0 p-8 text-7xl opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-700 pointer-events-none italic font-bebas">REWARD</div>
            
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-3xl mb-10 group-hover:scale-110 group-hover:border-[#e8a230]/30 transition-all duration-500 mx-auto shadow-inner">
                {icon}
            </div>
            <div className="flex-1 flex flex-col items-center">
                <h3 className="text-2xl font-bebas italic text-white mb-3 uppercase tracking-wider">{title}</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed mb-8 italic max-w-[200px]">{desc}</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-6 mt-auto pt-8 border-t border-white/5 w-full">
                <span className="text-[#e8a230] font-bebas text-2xl tracking-wide">{points.toLocaleString()} <span className="text-[9px] font-black uppercase tracking-[0.4em] ml-1 opacity-60">PTS</span></span>
                <button className="w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-[#e8a230] hover:text-black text-[10px] font-black uppercase tracking-widest transition-all duration-300 italic">
                    Authorize
                </button>
            </div>
        </div>
    );
}

