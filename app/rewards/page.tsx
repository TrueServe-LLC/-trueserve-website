
import Link from 'next/link';

export default function RewardsPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30 pb-24">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Navigation */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5 px-6 py-4 bg-black/50">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-full border border-white/10 group-hover:border-primary transition-all shadow-lg" />
                        <span className="text-2xl font-black tracking-tighter">
                            True<span className="text-gradient">Serve</span>
                        </span>
                    </Link>
                    <div className="hidden sm:flex items-center gap-6">
                        <Link href="/restaurants" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Restaurants</Link>
                        <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black border border-primary/20 shadow-lg shadow-primary/5">
                            2,450 PTS
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto py-12 px-6 animate-fade-in">
                {/* Hero Section */}
                <div className="text-center mb-20 relative">
                    <div className="inline-block px-4 py-1.5 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-primary/30">
                        Loyalty Program
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.85] text-white">
                        Rewards <br /><span className="text-gradient italic">Center.</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Earn as you eat. Redeem points for premium perks, free meals, or charitable impact.
                    </p>
                </div>

                {/* Points Balance Card - Polish Box Sizing */}
                <div className="mb-24 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition-all duration-1000"></div>
                    <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="text-center md:text-left flex-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Total Balance</p>
                            <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-4 md:gap-6">
                                <span className="text-7xl md:text-8xl lg:text-9xl font-black text-white tabular-nums tracking-tighter">2,450</span>
                                <div className="flex flex-col items-center sm:items-start">
                                    <span className="text-primary font-black text-sm uppercase tracking-widest whitespace-nowrap">+150 PENDING</span>
                                    <span className="text-slate-500 text-[10px] uppercase font-bold whitespace-nowrap">Gold Multiplier Active</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
                            <button className="flex-1 btn btn-outline border-white/10 hover:bg-white/5 py-4 px-8 rounded-2xl text-xs font-black uppercase tracking-widest min-w-[140px]">History</button>
                            <button className="flex-1 btn btn-primary py-4 px-10 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 min-w-[140px]">Earn More</button>
                        </div>
                    </div>
                </div>

                {/* MEMBERSHIP SELECTION - Fixed Clickability with higher Z-Index */}
                <div className="mb-32 relative z-20">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 uppercase">Upgrade Your Standard</h2>
                        <p className="text-slate-500 max-w-xl mx-auto font-medium">Earn points faster and unlock exclusive benefits with TrueServe+ Membership.</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12 max-w-6xl mx-auto">
                        <PricingCard
                            tier="Basic"
                            price="Free"
                            subtitle="The standard access"
                            features={[
                                "Access to platform",
                                "Standard delivery times",
                                "Basic rewards points",
                                "Community news & updates"
                            ]}
                            buttonText="Current Plan"
                            buttonLink="/login"
                        />
                        <PricingCard
                            tier="Plus"
                            price="$9.99"
                            subtitle="The community favorite"
                            isPopular={true}
                            features={[
                                "Reduced service fees",
                                "Priority driver dispatch",
                                "Annual birthday credit",
                                "5% Member-only discount",
                            ]}
                            buttonLink="/login?plus=true"
                        />
                        <PricingCard
                            tier="Premium"
                            price="$19.99"
                            subtitle="The ultimate standard"
                            features={[
                                "Zero delivery fees on all orders",
                                "Exclusive early access menu items",
                                "24/7 Concierge support",
                                "Double loyalty rewards points",
                                "Advanced 7-day scheduling"
                            ]}
                            buttonLink="/login?premium=true"
                        />
                    </div>
                </div>

                {/* Rewards Grid */}
                <h2 className="text-2xl font-black mb-8 px-2 uppercase tracking-tight">Available Redemptions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                    <RewardCard
                        title="$5 Off Order"
                        points={500}
                        icon="💵"
                        desc="Instant discount applied at checkout."
                        accent="emerald"
                    />
                    <RewardCard
                        title="Free Delivery"
                        points={750}
                        icon="🛵"
                        desc="Skip the delivery fee on any order."
                        accent="blue"
                    />
                    <RewardCard
                        title="Free Appetizer"
                        points={1200}
                        icon="🍟"
                        desc="Valid at participating local partners."
                        accent="orange"
                    />
                    <RewardCard
                        title="$10 Off Order"
                        points={1000}
                        icon="💰"
                        desc="Double value discount for savvy savers."
                        accent="purple"
                    />
                    <RewardCard
                        title="Priority Support"
                        points={2000}
                        icon="⭐"
                        desc="Priority lane for all your inquiries."
                        accent="yellow"
                    />
                    <RewardCard
                        title="Donate Meal"
                        points={2500}
                        icon="❤️"
                        desc="Feed a neighbor through local food banks."
                        accent="red"
                    />
                </div>

                {/* Status Tier */}
                <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-[3rem] p-10 md:p-16">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-500/10 rounded-full blur-[100px] -z-10" />
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-10">
                        <div>
                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-500/30">Current Tier</span>
                            <h3 className="text-4xl md:text-5xl font-black text-white mt-4 mb-2">Gold Member</h3>
                            <p className="text-slate-400 font-medium">Enjoy 1.5x points on every order and exclusive chef drops.</p>
                        </div>
                        <div className="text-left md:text-right min-w-[150px]">
                            <p className="text-sm font-bold text-white mb-1">Platinum Tier</p>
                            <p className="text-xs text-slate-500 font-medium">550 pts until next level</p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                            <div className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-200 w-[75%] rounded-full shadow-[0_0_30px_rgba(253,224,71,0.4)]" />
                        </div>
                        <div className="flex justify-between mt-4 px-1">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Silver</span>
                            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Gold</span>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Platinum</span>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}

function PricingCard({ tier, price, subtitle, isPopular = false, features, buttonText = "Join " + tier, buttonLink = "/login" }: any) {
    return (
        <div className={`relative p-10 md:p-12 rounded-[3rem] border flex flex-col items-center text-center transition-all h-full ${isPopular
            ? 'bg-slate-900 border-primary shadow-[0_0_50px_rgba(255,165,0,0.1)] z-10'
            : 'bg-white/5 border-white/10 z-0'
            }`}>

            <div className="mb-8">
                <h3 className="text-3xl font-black mb-2 text-white">{tier}</h3>
                <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{subtitle}</p>
            </div>

            <div className="flex items-end gap-1 mb-10 text-white">
                <span className="text-6xl font-black tracking-tighter">{price}</span>
                {price !== 'Free' && <span className="text-sm text-slate-500 font-bold mb-2">/ mo</span>}
            </div>

            <ul className="space-y-5 mb-12 w-full flex-1">
                {features.map((f: string) => (
                    <li key={f} className="text-sm text-slate-400 font-bold flex items-center justify-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                        <span className="leading-tight">{f}</span>
                    </li>
                ))}
            </ul>

            <Link
                href={buttonLink}
                className={`block w-full py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all text-center relative z-20 ${isPopular
                    ? 'bg-primary text-black hover:bg-white hover:scale-[1.02] shadow-2xl shadow-primary/20'
                    : 'bg-white/10 text-white hover:bg-white/20 hover:border-white/40 border border-transparent'
                    }`}
            >
                {buttonText}
            </Link>
        </div>
    )
}

function RewardCard({ title, points, icon, desc, accent }: { title: string, points: number, icon: string, desc: string, accent: string }) {
    const accents: any = {
        emerald: "from-emerald-500/20 text-emerald-400 border-emerald-500/20",
        blue: "from-blue-500/20 text-blue-400 border-blue-500/20",
        orange: "from-orange-500/20 text-orange-400 border-orange-500/20",
        purple: "from-purple-500/20 text-purple-400 border-purple-500/20",
        yellow: "from-yellow-500/20 text-yellow-500 border-yellow-500/20",
        red: "from-red-500/20 text-red-400 border-red-500/20",
    }

    return (
        <div className="group bg-white/5 border border-white/10 p-10 rounded-[2.5rem] flex flex-col h-full hover:bg-white/10 hover:border-white/20 transition-all duration-300 relative overflow-hidden">
            <div className={`absolute -bottom-6 -right-6 text-8xl opacity-[0.03] group-hover:opacity-10 transition-all duration-500 transform group-hover:-rotate-12 pointer-events-none`}>
                {icon}
            </div>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${accents[accent]} border flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div className="flex-1">
                <h3 className="text-xl font-black text-white mb-2 leading-tight break-words">{title}</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6 break-words max-w-[240px]">{desc}</p>
            </div>
            <div className="flex items-center justify-between gap-4 mt-auto pt-6 border-t border-white/5">
                <span className="text-primary font-black text-lg tracking-tight whitespace-nowrap">{points.toLocaleString()} <span className="text-[10px] uppercase tracking-widest">PTS</span></span>
                <button className="px-5 py-2 rounded-xl bg-white/10 hover:bg-primary hover:text-black text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">
                    Redeem
                </button>
            </div>
        </div>
    )
}
