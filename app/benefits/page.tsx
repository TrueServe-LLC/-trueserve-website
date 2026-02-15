
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
                <div className="text-center mb-40 relative px-4">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] -z-10 animate-pulse" />
                    <div className="inline-block px-4 py-1.5 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-10 border border-primary/30">
                        Membership 2.0
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-10 leading-[0.85] text-white">
                        Built for <br />
                        <span className="text-gradient italic">Community.</span>
                    </h1>
                    <p className="text-slate-400 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed font-medium">
                        A new standard in delivery, built specifically for local restaurants and the community that supports them.
                    </p>
                </div>

                {/* Tiered Membership Model - Fixed Clickability */}
                <div className="mb-48 relative z-20">
                    <h2 className="text-center text-4xl md:text-5xl font-black mb-20 tracking-tight uppercase">Choose Your Standard</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 max-w-6xl mx-auto px-4">
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
                                "Order protection guarantee",
                                "5% Member-only discount",
                                "Annual birthday credit"
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

                    {/* 2. Convenience & Experience - CLEAN LAYOUT, NO BOXES */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="bg-primary/5 border border-primary/10 p-10 md:p-14 rounded-[3.5rem] relative overflow-hidden text-center">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-3xl -z-10" />
                                <p className="text-slate-300 mx-auto leading-relaxed italic text-xl md:text-2xl relative z-10">
                                    "I don't have time to chase refunds. With TrueServe Premium, if it's not right, they fix it instantly. No questions asked."
                                </p>
                                <p className="mt-8 text-sm font-black uppercase tracking-widest text-primary">— James L., Premium Member</p>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <span className="text-primary font-black uppercase tracking-widest text-[10px] bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Convenience & Experience</span>
                            <h2 className="text-4xl md:text-6xl font-black mt-8 mb-10 leading-[1.1] tracking-tight text-white">
                                Elevate your order <br /> from start to finish.
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

                    {/* 3. Tech & Transparency - CLEAN LAYOUT, NO BOXES */}
                    <div className="pt-20">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                            <div>
                                <div className="inline-block px-4 py-1.5 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-primary/30">
                                    Advanced Tech
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1] tracking-tight text-white">
                                    Technology with <br /><span className="text-gradient italic">Transparency.</span>
                                </h2>
                                <p className="text-slate-400 mb-12 max-w-lg text-lg leading-relaxed">
                                    We believe in a fair marketplace. Our tech isn't meant to hide fees—it's meant to reveal them.
                                </p>
                                <div className="space-y-10">
                                    {[
                                        { i: "📊", t: "Earnings Dashboard", d: "See exactly how much the restaurant and driver earned." },
                                        { i: "🎯", t: "Priority Support", d: "Instant access to our dedicated support team." },
                                        { i: "📅", t: "Advanced Scheduling", d: "Lock-in time windows up to 7 days in advance." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-6 items-start">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl shrink-0 border border-white/10">{item.i}</div>
                                            <div>
                                                <p className="font-black text-xl text-white mb-1 uppercase tracking-tight">{item.t}</p>
                                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.d}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    { i: "📢", l: "Impact", d: "Direct contributions to local food programs." },
                                    { i: "🎂", l: "Birthday", d: "$10 credit on your special day." },
                                    { i: "💳", l: "Wallet", d: "Unified rewards across all partners." },
                                    { i: "🛡️", l: "No Fees", d: "Zero hidden charges. Pure transparency." }
                                ].map((card, i) => (
                                    <div key={i} className="p-10 bg-white/5 rounded-[2.5rem] border border-white/10 flex flex-col items-center text-center group hover:bg-white/10 transition-all">
                                        <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">{card.i}</div>
                                        <p className="text-[10px] font-black uppercase mb-3 tracking-[0.25em] text-primary">{card.l}</p>
                                        <p className="text-xs text-slate-500 font-bold leading-relaxed">{card.d}</p>
                                    </div>
                                ))}
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
