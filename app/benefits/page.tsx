
import Link from 'next/link';

export default function BenefitsPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30">
            {/* Header */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5 px-6 py-4 bg-black/50">
                <div className="container flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-full border border-white/10 group-hover:border-primary transition-all shadow-lg" />
                        <span className="text-2xl font-black tracking-tighter">
                            True<span className="text-gradient">Serve</span><span className="text-primary">+</span>
                        </span>
                    </Link>
                    <Link href="/restaurants" className="btn btn-outline border-white/10 text-xs py-2 px-6 hover:bg-white/5 transition-all">
                        Back to Ordering
                    </Link>
                </div>
            </nav>

            <main className="container max-w-6xl py-20 px-6">
                {/* Hero Section */}
                <div className="text-center mb-24 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
                    <div className="inline-block px-4 py-1.5 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-primary/30">
                        Exclusive Membership
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-tight">
                        Unlock the <br />
                        <span className="text-gradient">True Standard.</span>
                    </h1>
                    <p className="text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium">
                        Elevate your delivery experience with TrueServe+. Save more on every order, get priority support, and support your local drivers better.
                    </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    <BenefitCard
                        icon="🛵"
                        title="$0 Delivery Fees"
                        description="Say goodbye to delivery costs. Members enjoy unlimited $0 delivery fees on every single order from any local partner."
                    />
                    <BenefitCard
                        icon="💎"
                        title="Exclusive Member Perks"
                        description="Access secret menu items, special discounts, and limited-time offers available only to TrueServe+ members."
                    />
                    <BenefitCard
                        icon="⚡"
                        title="Priority Dispatch"
                        description="Your orders go to the front of the line. Experience even faster delivery with our priority driver matching system."
                    />
                    <BenefitCard
                        icon="❤️"
                        title="Better Driver Pay"
                        description="A portion of your membership goes directly into a driver support fund, ensuring our couriers earn more than anywhere else."
                    />
                    <BenefitCard
                        icon="🎁"
                        title="Monthly Rewards"
                        description="Get bonus rewards points every month just for being a member. Redeem them for free meals in our Rewards Store."
                    />
                    <BenefitCard
                        icon="📞"
                        title="24/7 VIP Support"
                        description="Get a dedicated support line for your orders. Our VIP team is always ready to handle any request instantly."
                    />
                </div>

                {/* Pricing Section */}
                <div className="relative group max-w-2xl mx-auto">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-12 text-center">
                        <h2 className="text-3xl font-bold mb-2">Ready to go Plus?</h2>
                        <p className="text-slate-400 mb-8">Join thousands of locals saving over $40/month on delivery.</p>

                        <div className="flex items-center justify-center gap-2 mb-8">
                            <span className="text-5xl font-black text-white">$9.99</span>
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">/ Month</span>
                        </div>

                        <button className="w-full btn btn-primary py-4 text-xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                            Join TrueServe+ Now
                        </button>
                        <p className="mt-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Cancel anytime • No commitments</p>
                    </div>
                </div>

            </main>
        </div>
    );
}

function BenefitCard({ icon, title, description }: { icon: string, title: string, description: string }) {
    return (
        <div className="card bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-all group overflow-hidden relative">
            <div className="absolute -bottom-10 -right-10 text-9xl opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:-rotate-12">
                {icon}
            </div>
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-primary/20">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
            <p className="text-slate-400 leading-relaxed text-sm font-medium">
                {description}
            </p>
        </div>
    )
}
