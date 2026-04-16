export const dynamic = "force-dynamic";

import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/components/Logo";
import { getAuthSession } from "@/app/auth/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { joinRewardsTier } from "./actions";
import { Crown, Gift, ShieldCheck, Sparkles, Star, TrendingUp } from "lucide-react";

type RewardsSnapshot = {
    plan: string;
    hasPaymentMethod: boolean;
    points: number;
    ordersCount: number;
    lifetimeSpend: number;
    multiplierText: string;
};

const TIER_POINT_TARGET = {
    Plus: 1200,
    Premium: 3000
} as const;

function getMultiplier(plan: string): number {
    if (plan === "Premium") return 2;
    if (plan === "Plus") return 1.5;
    return 1;
}

async function getSnapshot(userId?: string): Promise<RewardsSnapshot | null> {
    if (!userId) return null;

    const { data: user } = await supabaseAdmin
        .from("User")
        .select("plan, stripeCustomerId")
        .eq("id", userId)
        .maybeSingle();

    if (!user) return null;

    const { data: orders } = await supabaseAdmin
        .from("Order")
        .select("total, status")
        .eq("userId", userId);

    const completed = (orders || []).filter((o) => o.status !== "CANCELLED");
    const lifetimeSpend = completed.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const multiplier = getMultiplier(user.plan || "Basic");
    const points = Math.floor(lifetimeSpend * multiplier);

    return {
        plan: user.plan || "Basic",
        hasPaymentMethod: Boolean(user.stripeCustomerId),
        points,
        ordersCount: completed.length,
        lifetimeSpend,
        multiplierText: `${multiplier}x`
    };
}

function getJourney(points: number, plan: string) {
    if (plan === "Premium") {
        return {
            title: "Top Tier Unlocked",
            detail: "You already have the highest multiplier and fastest support lane.",
            remaining: 0,
            progress: 100
        };
    }

    if (plan === "Plus") {
        const target = TIER_POINT_TARGET.Premium;
        const remaining = Math.max(target - points, 0);
        return {
            title: "Next Stop: Premium",
            detail: `${remaining.toLocaleString()} more points to unlock 2x rewards and concierge support.`,
            remaining,
            progress: Math.min(100, Math.round((points / target) * 100))
        };
    }

    const target = TIER_POINT_TARGET.Plus;
    const remaining = Math.max(target - points, 0);
    return {
        title: "Next Stop: Plus",
        detail: `${remaining.toLocaleString()} more points to unlock priority dispatch and 1.5x rewards.`,
        remaining,
        progress: Math.min(100, Math.round((points / target) * 100))
    };
}

function MessageBanner({ update, tier }: { update?: string; tier?: string }) {
    if (!update) return null;

    if (update === "success") {
        return (
            <div className="food-panel mb-6 border border-emerald-400/30 bg-emerald-500/10 text-emerald-200">
                Rewards plan updated successfully to <strong>{tier || "your selected tier"}</strong>.
            </div>
        );
    }
    if (update === "needs_wallet") {
        return (
            <div className="food-panel mb-6 border border-[#f97316]/35 bg-[#f97316]/10 text-[#f4d7a3]">
                Add a saved card in <Link href="/user/settings#wallet" className="underline font-bold">Account Settings</Link> before joining a paid rewards tier.
            </div>
        );
    }
    return (
        <div className="food-panel mb-6 border border-red-500/30 bg-red-500/10 text-red-200">
            We couldn’t update your rewards tier. Please try again.
        </div>
    );
}

function TierCard({
    tier,
    subtitle,
    price,
    currentPlan,
    canChoose,
    features,
    badge,
    icon
}: {
    tier: "Basic" | "Plus" | "Premium";
    subtitle: string;
    price: string;
    currentPlan: string;
    canChoose: boolean;
    features: string[];
    badge?: string;
    icon: ReactNode;
}) {
    const isCurrent = currentPlan === tier;
    return (
        <article className={`food-card relative overflow-hidden ${isCurrent ? "border border-[#f97316]/50" : ""}`}>
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_45%)]" />
            <div className="relative z-10">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="rounded-xl border border-[#f97316]/35 bg-[#f97316]/10 p-2 text-[#f97316]">
                        {icon}
                    </div>
                    {badge && (
                        <span className="rounded-full border border-[#f97316]/40 bg-[#f97316]/16 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#f6d8a1]">
                            {badge}
                        </span>
                    )}
                </div>
                <p className="food-kicker mb-2">{subtitle}</p>
                <h3 className="food-heading !text-[34px]">{tier}</h3>
                <p className="text-xl font-bold text-[#f97316] mt-2">{price}</p>
            </div>

            <div className="mt-4 grid gap-2 relative z-10">
                {features.map((feature) => (
                    <div key={feature} className="text-sm text-white/78 flex items-start gap-2">
                        <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-[#f97316]" />
                        <span>{feature}</span>
                    </div>
                ))}
            </div>
            <form action={joinRewardsTier} className="mt-6 relative z-10">
                <input type="hidden" name="tier" value={tier} />
                <button
                    type="submit"
                    disabled={isCurrent || !canChoose}
                    className={`w-full ${isCurrent ? "btn btn-ghost opacity-70 cursor-not-allowed" : "place-btn"}`}
                >
                    {isCurrent ? "Current Plan" : `Join ${tier}`}
                </button>
            </form>
        </article>
    );
}

export default async function RewardsPage({
    searchParams
}: {
    searchParams?: Promise<{ update?: string; tier?: string }>;
}) {
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const { isAuth, userId } = await getAuthSession();
    const snapshot = await getSnapshot(userId);
    const currentPlan = snapshot?.plan || "Basic";
    const isSignedIn = Boolean(isAuth && userId);
    const canChoosePaid = Boolean(snapshot?.hasPaymentMethod);
    const safePoints = snapshot?.points ?? 0;
    const journey = getJourney(safePoints, currentPlan);

    return (
        <div className="food-app-shell">
            <nav className="food-app-nav">
                <div className="mx-auto flex items-center justify-between px-4 sm:px-0" style={{ width: "min(1180px, calc(100% - 32px))", padding: "14px 0" }}>
                    <Logo size="sm" />
                    <div className="flex gap-2">
                        <Link href="/user/settings" className="btn btn-ghost">Account</Link>
                        <Link href="/restaurants" className="btn btn-gold">Order Food</Link>
                    </div>
                </div>
            </nav>

            <main className="food-app-main">
                <MessageBanner update={resolvedSearchParams?.update} tier={resolvedSearchParams?.tier} />

                <section className="food-panel relative overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.22),transparent_48%),radial-gradient(circle_at_bottom_left,rgba(255,122,45,0.14),transparent_38%)]" />
                    <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <div>
                            <p className="food-kicker mb-3">Customer Loyalty</p>
                            <h1 className="food-heading">TrueServe Rewards</h1>
                            <p className="food-subtitle mt-3 !max-w-none">
                                Turn every order into perks. Earn points automatically, climb tiers, and unlock faster service plus stronger rewards over time.
                            </p>
                            <div className="food-chip-row mt-5">
                                <div className="food-chip"><span className="food-chip-dot" /> Points tracked in real-time</div>
                                <div className="food-chip"><span className="food-chip-dot" /> Tier upgrades in one tap</div>
                                <div className="food-chip"><span className="food-chip-dot" /> Rewards tied to real order activity</div>
                            </div>
                            {!isSignedIn && (
                                <div className="mt-5">
                                    <Link href="/login" className="btn btn-gold">Sign In To Join Rewards</Link>
                                </div>
                            )}
                        </div>

                        <div className="food-card border border-[#f97316]/30">
                            <p className="food-kicker mb-2">Progress</p>
                            <h3 className="food-heading !text-[30px]">{journey.title}</h3>
                            <p className="text-sm text-white/75 mt-2">{journey.detail}</p>
                            <div className="mt-4 rounded-full bg-white/10 h-2 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#f97316] to-[#ffb64a]"
                                    style={{ width: `${journey.progress}%` }}
                                />
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                                <span>{journey.progress}% complete</span>
                                <span>{journey.remaining.toLocaleString()} points to go</span>
                            </div>
                            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/65">
                                Tip: Place larger group orders to accelerate your next tier faster.
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid gap-6 md:grid-cols-3">
                    <article className="food-card">
                        <p className="food-kicker mb-2 flex items-center gap-2">
                            <Crown size={14} className="text-[#f97316]" />
                            Current Tier
                        </p>
                        <h3 className="food-heading !text-[34px]">{currentPlan}</h3>
                        <p className="text-sm text-white/65 mt-2">Updates instantly in your account settings after selection.</p>
                    </article>
                    <article className="food-card">
                        <p className="food-kicker mb-2 flex items-center gap-2">
                            <Sparkles size={14} className="text-[#f97316]" />
                            Reward Points
                        </p>
                        <h3 className="food-heading !text-[34px]">{snapshot ? snapshot.points.toLocaleString() : "0"}</h3>
                        <p className="text-sm text-white/65 mt-2">Based on lifetime order spend and your current tier multiplier.</p>
                    </article>
                    <article className="food-card">
                        <p className="food-kicker mb-2 flex items-center gap-2">
                            <TrendingUp size={14} className="text-[#f97316]" />
                            Order Activity
                        </p>
                        <h3 className="food-heading !text-[34px]">{snapshot ? snapshot.ordersCount : 0}</h3>
                        <p className="text-sm text-white/65 mt-2">
                            Lifetime spend ${snapshot ? snapshot.lifetimeSpend.toFixed(2) : "0.00"} · Multiplier {snapshot?.multiplierText || "1x"}
                        </p>
                    </article>
                </section>

                <section className="mt-8">
                    <div className="food-section-head">
                        <div>
                            <p className="food-kicker mb-2">Membership</p>
                            <h2 className="food-heading">Choose Your Tier</h2>
                        </div>
                        <Link href="/user/settings#wallet" className="btn btn-ghost">Manage Wallet</Link>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <TierCard
                            tier="Plus"
                            subtitle="Most Popular"
                            price="$9.99 / month"
                            currentPlan={currentPlan}
                            canChoose={isSignedIn && canChoosePaid}
                            badge="Best Value"
                            icon={<Star size={17} />}
                            features={[
                                "Priority dispatch during peak times",
                                "Faster support response windows",
                                "1.5x points multiplier on all orders"
                            ]}
                        />
                        <TierCard
                            tier="Basic"
                            subtitle="Starter"
                            price="Free"
                            currentPlan={currentPlan}
                            canChoose={isSignedIn}
                            icon={<Gift size={17} />}
                            features={[
                                "Standard points earning",
                                "Access to all restaurants",
                                "Core order tracking"
                            ]}
                        />
                        <TierCard
                            tier="Premium"
                            subtitle="Power User"
                            price="$19.99 / month"
                            currentPlan={currentPlan}
                            canChoose={isSignedIn && canChoosePaid}
                            badge="Top Perks"
                            icon={<ShieldCheck size={17} />}
                            features={[
                                "Highest dispatch priority",
                                "Concierge support",
                                "2x points multiplier"
                            ]}
                        />
                    </div>

                    {isSignedIn && !canChoosePaid && (
                        <p className="mt-4 text-sm text-[#f97316]">
                            Add a payment method first to unlock Plus or Premium.
                        </p>
                    )}
                </section>

                <section className="mt-8 grid gap-6 md:grid-cols-3">
                    <article className="food-card">
                        <p className="food-kicker mb-2">How It Works</p>
                        <h3 className="food-heading !text-[30px]">Order</h3>
                        <p className="text-sm text-white/70 mt-2">Place food orders as normal from local restaurants.</p>
                    </article>
                    <article className="food-card">
                        <p className="food-kicker mb-2">How It Works</p>
                        <h3 className="food-heading !text-[30px]">Earn</h3>
                        <p className="text-sm text-white/70 mt-2">Points are added automatically based on your tier multiplier.</p>
                    </article>
                    <article className="food-card">
                        <p className="food-kicker mb-2">How It Works</p>
                        <h3 className="food-heading !text-[30px]">Unlock</h3>
                        <p className="text-sm text-white/70 mt-2">Upgrade anytime to increase perks and accelerate your rewards.</p>
                    </article>
                </section>
            </main>
        </div>
    );
}
