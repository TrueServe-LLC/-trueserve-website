
import Link from 'next/link';

export default function RewardsPage() {
    return (
        <div className="min-h-screen pb-20">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 px-6 py-4">
                <div className="container flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-full border border-white/10 group-hover:border-primary transition-all shadow-lg" />
                        <span className="text-2xl font-black tracking-tighter">
                            True<span className="text-gradient">Serve</span>
                        </span>
                    </Link>
                    <div className="flex gap-4 items-center">
                        <Link href="/restaurants" className="hover:text-primary transition-colors">Restaurants</Link>
                        <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">
                            2,450 pts
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container py-12 animate-fade-in">
                {/* Hero Section */}
                <div className="text-center mb-16 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-white">
                        Rewards <span className="text-gradient">Store</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Redeem your hard-earned points for exclusive perks, free meals, and charitable donations.
                    </p>
                </div>

                {/* Points Balance Card */}
                <div className="mb-12 card bg-gradient-to-r from-secondary/10 to-primary/10 border-white/10 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Current Balance</p>
                        <div className="text-6xl font-black text-white tabular-nums tracking-tighter">
                            2,450 <span className="text-2xl text-primary align-top">+150 pending</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="btn btn-outline border-white/10 hover:bg-white/5">History</button>
                        <button className="btn btn-primary px-8">Earn More</button>
                    </div>
                </div>

                {/* Rewards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <RewardCard
                        title="$5 Off Order"
                        points={500}
                        image="💵"
                        color="bg-green-500/10 border-green-500/20 text-green-400"
                    />
                    <RewardCard
                        title="Free Delivery"
                        points={750}
                        image="🛵"
                        color="bg-blue-500/10 border-blue-500/20 text-blue-400"
                    />
                    <RewardCard
                        title="Free Appetizer"
                        points={1200}
                        image="🍟"
                        color="bg-orange-500/10 border-orange-500/20 text-orange-400"
                    />
                    <RewardCard
                        title="$10 Off Order"
                        points={1000}
                        image="💰"
                        color="bg-purple-500/10 border-purple-500/20 text-purple-400"
                    />
                    <RewardCard
                        title="Priority Support"
                        points={2000}
                        image="⭐"
                        color="bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                    />
                    <RewardCard
                        title="Donate Meal"
                        points={2500}
                        image="❤️"
                        color="bg-red-500/10 border-red-500/20 text-red-400"
                    />
                </div>

                {/* Status Tier */}
                <div className="card bg-white/5 border-white/10 p-8">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-1">Gold Tier</h3>
                            <p className="text-slate-400 text-sm">Earn 1.5x points on every order.</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-400">Next Tier: Platinum</p>
                            <p className="text-xs text-slate-500">550 points to go</p>
                        </div>
                    </div>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-300 w-[75%] rounded-full shadow-[0_0_20px_rgba(253,224,71,0.5)]" />
                    </div>
                </div>

            </main>
        </div>
    );
}

function RewardCard({ title, points, image, color }: { title: string, points: number, image: string, color: string }) {
    return (
        <div className={`card group hover:scale-[1.02] transition-all cursor-pointer border ${color.replace('text-', 'border-').split(' ')[1] || 'border-white/10'} bg-white/5 p-6 flex flex-col items-center text-center`}>
            <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-3xl mb-4 group-hover:rotate-12 transition-transform`}>
                {image}
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-primary font-bold">{points} pts</p>
            <button className="mt-4 w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-colors">
                Redeem
            </button>
        </div>
    )
}
