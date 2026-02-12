
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

            <main className="container max-w-7xl py-20 px-6 mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-32 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] -z-10 animate-pulse" />
                    <div className="inline-block px-4 py-1.5 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-primary/30">
                        Membership 2.0
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.9]">
                        Built for <br />
                        <span className="text-gradient italic">Community.</span>
                    </h1>
                    <p className="text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium">
                        TrueServe isn't just "cheaper than DoorDash." It's a standard built for local restaurants and the customers who love them.
                    </p>
                </div>

                {/* Tiered Membership Model */}
                <div className="mb-40">
                    <h2 className="text-center text-3xl font-bold mb-16">Choose Your Standard</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Basic */}
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
                            buttonText="Get Started"
                        />
                        {/* Plus */}
                        <PricingCard
                            tier="Plus"
                            price="$9.99"
                            subtitle="The community favorite"
                            isPopular={true}
                            features={[
                                "Reduced service fees",
                                "Priority driver dispatch",
                                "Order protection guarantee",
                                "5% Member-only discount",
                                "Annual birthday credit"
                            ]}
                            buttonLink="/login?plus=true"
                        />
                        {/* Premium */}
                        <PricingCard
                            tier="Premium"
                            price="$19.99"
                            subtitle="The ultimate standard"
                            features={[
                                "Zero delivery fees on all orders",
                                "Exclusive early access menu items",
                                "24/7 Concierge support",
                                "AI Voice VIP ordering line",
                                "Double loyalty rewards points",
                                "Advanced 7-day scheduling"
                            ]}
                        />
                    </div>
                </div>

                {/* Detailed Features Sections */}
                <div className="space-y-40 mb-40">
                    {/* 1. Restaurant-First Value */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-emerald-400 font-black uppercase tracking-widest text-[10px]">Restaurant-First Value</span>
                            <h2 className="text-4xl font-bold mt-4 mb-8 leading-tight">Your loyalty helps <br /> restaurants thrive.</h2>
                            <div className="space-y-8">
                                <FeatureDetail
                                    icon="🏷️"
                                    title="Member-Only Discounts"
                                    text="Get 5–10% off at participating local spots. Restaurants fund this exposure directly because they love your loyalty."
                                />
                                <FeatureDetail
                                    icon="⭐"
                                    title="TrueServe Local Favorites"
                                    text="Early access to limited menu items, member-only tasting menus, and special weekly chef drops."
                                />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-white/5 p-12 rounded-[3rem] relative overflow-hidden group">
                            <div className="text-7xl mb-8 group-hover:scale-110 transition-transform duration-500">🍔</div>
                            <p className="text-slate-400 leading-relaxed italic">"TrueServe focuses on bringing traffic to my kitchen, not just taking a cut of my sales. That's why I offer 10% off to Plus members."</p>
                            <p className="mt-4 text-xs font-bold">— Maria S., Owner of Local Bistro</p>
                        </div>
                    </div>

                    {/* 2. Convenience & Experience - Polish Box Sizing */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">
                        <div className="lg:col-span-5 order-2 lg:order-1 flex">
                            <div className="w-full bg-gradient-to-br from-blue-500/10 to-transparent border border-white/5 p-10 md:p-14 rounded-[3.5rem] flex flex-col justify-center text-center lg:text-right relative overflow-hidden backdrop-blur-sm">
                                <div className="text-6xl mb-8 opacity-20 lg:opacity-100 italic font-black absolute top-6 right-8 lg:static">⚡</div>
                                <p className="text-slate-300 leading-relaxed italic text-xl md:text-2xl relative z-10 break-words">
                                    "I don't have time to chase refunds. With TrueServe Premium, if it's not right, they fix it instantly. No questions asked."
                                </p>
                                <p className="mt-8 text-sm font-black uppercase tracking-widest text-blue-400">— James L., Premium Member</p>
                            </div>
                        </div>
                        <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-center">
                            <div className="mb-6">
                                <span className="text-blue-400 font-black uppercase tracking-widest text-[10px] bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">Convenience & Experience</span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black mb-12 leading-[0.9] tracking-tight text-white break-words">
                                Elevate your order <br className="hidden md:block" /> from start to finish.
                            </h2>
                            <div className="space-y-10">
                                <FeatureDetail
                                    icon="⚡"
                                    title="Priority Dispatch & Support"
                                    text="Faster driver assignment and peak-hour prioritization. Plus a dedicated, instant-reply support lane."
                                />
                                <FeatureDetail
                                    icon="🛡️"
                                    title="Order Protection Guarantee"
                                    text="Late or missing items? Members get instant credit. We trust you, so there's no friction or long dispute process."
                                />
                                <FeatureDetail
                                    icon="📱"
                                    title="Reorder Concierge"
                                    text="One-click reorders of your go-to meals and scheduled recurring deliveries for your weekly routine."
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. Tech & Transparency - Fixed Overlap */}
                    <div className="w-full bg-slate-900/50 border border-white/10 rounded-[4rem] p-8 md:p-20 relative overflow-hidden backdrop-blur-md">
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
                            <div className="lg:col-span-5">
                                <div className="inline-block px-4 py-1.5 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-primary/30">
                                    Advanced Tech
                                </div>
                                <h2 className="text-5xl md:text-6xl font-black mb-8 leading-none tracking-tighter text-white">
                                    Technology with <br /><span className="text-gradient italic">Transparency.</span>
                                </h2>
                                <p className="text-slate-400 mb-12 max-w-lg text-lg leading-relaxed font-medium">
                                    We believe in a fair marketplace. Our tech isn't meant to hide fees—it's meant to reveal them.
                                </p>
                                <div className="space-y-10">
                                    {[
                                        { t: "Earnings Dashboard", d: "See exactly how much the restaurant and driver earned." },
                                        { t: "AI Voice VIP Line", d: "Hands-free, priority AI voice ordering for all members." },
                                        { t: "Advanced Scheduling", d: "Lock-in time windows up to 7 days in advance." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-6 items-start">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-black shrink-0 border border-primary/20">i</div>
                                            <div>
                                                <p className="font-black text-xl text-white mb-1 uppercase tracking-tight">{item.t}</p>
                                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.d}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-7 self-center">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 h-full">
                                    {[
                                        { i: "📢", l: "Impact", d: "Direct contributions to local food programs." },
                                        { i: "🎂", l: "Birthday", d: "$10 credit on your special day." },
                                        { i: "💳", l: "Wallet", d: "Unified rewards across all partners." },
                                        { i: "🛡️", l: "No Fees", d: "Zero hidden charges. Pure transparency." }
                                    ].map((card, i) => (
                                        <div key={i} className="p-8 lg:p-10 bg-black/60 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center group hover:bg-black/80 transition-all hover:border-primary/30 shrink-0">
                                            <div className="text-4xl mb-6 group-hover:scale-125 transition-transform duration-500">{card.i}</div>
                                            <p className="text-[10px] font-black uppercase mb-3 tracking-[0.25em] text-primary whitespace-nowrap">{card.l}</p>
                                            <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-[150px]">{card.d}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Strategic Recommendation Call to Action */}
                <div className="text-center mb-40">
                    <h2 className="text-5xl font-black mb-6">Start Your Standard.</h2>
                    <p className="text-slate-400 mb-12">Launch features include Priority Dispatch, Order Protection, and 5% Restaurant Savings.</p>
                    <Link href="/login" className="btn btn-primary px-12 py-5 text-xl shadow-2xl shadow-primary/30 rounded-2xl">
                        Join Plus Today — $9.99/mo
                    </Link>
                </div>

            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 py-20 px-6 bg-slate-900/20 backdrop-blur-md">
                <div className="container max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div>
                        <Link href="/" className="text-2xl font-black tracking-tighter mb-4 block">
                            True<span className="text-gradient">Serve</span>
                        </Link>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            Redefining the relationship between <br />
                            restaurants, drivers, and the community.
                        </p>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <p className="font-bold text-xs uppercase tracking-[0.2em] mb-4 opacity-50">Local</p>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li>About Us</li>
                                <li>Impact Fund</li>
                                <li>Partners</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-bold text-xs uppercase tracking-[0.2em] mb-4 opacity-50">Legal</p>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li>Privacy</li>
                                <li>Transparency Report</li>
                                <li>Terms</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function PricingCard({ tier, price, subtitle, isPopular = false, features, buttonText = "Join " + tier, buttonLink = "/login" }: any) {
    return (
        <div className={`relative p-8 rounded-[2.5rem] border ${isPopular ? 'bg-white/10 border-primary shadow-2xl scale-[1.05] z-10' : 'bg-white/5 border-white/10'} flex flex-col items-center text-center transition-all hover:scale-[1.02]`}>
            {isPopular && (
                <div className="absolute -top-4 bg-primary text-black font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full">
                    Most Loved
                </div>
            )}
            <h3 className="text-2xl font-black mb-1">{tier}</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">{subtitle}</p>

            <div className="flex items-end gap-1 mb-8">
                <span className="text-5xl font-black tracking-tighter">{price}</span>
                {price !== 'Free' && <span className="text-xs text-slate-500 font-bold mb-1">/ mo</span>}
            </div>

            <ul className="space-y-4 mb-10 w-full">
                {features.map((f: string) => (
                    <li key={f} className="text-sm text-slate-400 font-medium flex items-center justify-center gap-2">
                        <span className="text-primary/50">•</span> {f}
                    </li>
                ))}
            </ul>

            <Link
                href={buttonLink}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${isPopular ? 'bg-primary text-black shadow-xl shadow-primary/20' : 'bg-white/10 hover:bg-white/20'}`}
            >
                {buttonText}
            </Link>
        </div>
    )
}

function FeatureDetail({ icon, title, text }: { icon: string, title: string, text: string }) {
    return (
        <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl border border-white/5 shrink-0 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm font-medium">{text}</p>
            </div>
        </div>
    )
}
