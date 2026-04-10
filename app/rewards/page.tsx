export const dynamic = "force-dynamic";

import Link from "next/link";
import Logo from "@/components/Logo";
import { getAuthSession } from "@/app/auth/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { joinRewardsTier } from "./actions";

type RewardsSnapshot = {
    plan: string;
    hasPaymentMethod: boolean;
    points: number;
    ordersCount: number;
    lifetimeSpend: number;
    multiplierText: string;
};

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
            <div className="food-panel mb-6 border border-[#e8a230]/35 bg-[#e8a230]/10 text-[#f4d7a3]">
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
    features
}: {
    tier: "Basic" | "Plus" | "Premium";
    subtitle: string;
    price: string;
    currentPlan: string;
    canChoose: boolean;
    features: string[];
}) {
    const isCurrent = currentPlan === tier;
    return (
        <article className={`food-card ${isCurrent ? "border border-[#e8a230]/50" : ""}`}>
            <p className="food-kicker mb-2">{subtitle}</p>
            <h3 className="food-heading !text-[34px]">{tier}</h3>
            <p className="text-xl font-bold text-[#e8a230] mt-2">{price}</p>
            <div className="mt-4 grid gap-2">
                {features.map((feature) => (
                    <div key={feature} className="text-sm text-white/70">• {feature}</div>
                ))}
            </div>
            <form action={joinRewardsTier} className="mt-6">
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
    searchParams?: { update?: string; tier?: string };
}) {
    const { isAuth, userId } = await getAuthSession();
    const snapshot = await getSnapshot(userId);
    const currentPlan = snapshot?.plan || "Basic";
    const isSignedIn = Boolean(isAuth && userId);
    const canChoosePaid = Boolean(snapshot?.hasPaymentMethod);

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
                <MessageBanner update={searchParams?.update} tier={searchParams?.tier} />

                <section className="food-panel">
                    <p className="food-kicker mb-3">Customer Loyalty</p>
                    <h1 className="food-heading">TrueServe Rewards</h1>
                    <p className="food-subtitle mt-3 !max-w-none">
                        Earn points from every order and choose the tier that fits your ordering habits.
                    </p>
                    {!isSignedIn && (
                        <div className="mt-5">
                            <Link href="/login" className="btn btn-gold">Sign In To Join Rewards</Link>
                        </div>
                    )}
                </section>

                <section className="mt-8 grid gap-6 md:grid-cols-3">
                    <article className="food-card">
                        <p className="food-kicker mb-2">Current Tier</p>
                        <h3 className="food-heading !text-[34px]">{currentPlan}</h3>
                        <p className="text-sm text-white/65 mt-2">Updates instantly in your account settings after selection.</p>
                    </article>
                    <article className="food-card">
                        <p className="food-kicker mb-2">Reward Points</p>
                        <h3 className="food-heading !text-[34px]">{snapshot ? snapshot.points.toLocaleString() : "0"}</h3>
                        <p className="text-sm text-white/65 mt-2">Based on lifetime order spend and your current tier multiplier.</p>
                    </article>
                    <article className="food-card">
                        <p className="food-kicker mb-2">Order Activity</p>
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
                            tier="Basic"
                            subtitle="Starter"
                            price="Free"
                            currentPlan={currentPlan}
                            canChoose={isSignedIn}
                            features={[
                                "Standard points earning",
                                "Access to all restaurants",
                                "Core order tracking"
                            ]}
                        />
                        <TierCard
                            tier="Plus"
                            subtitle="Most Popular"
                            price="$9.99 / month"
                            currentPlan={currentPlan}
                            canChoose={isSignedIn && canChoosePaid}
                            features={[
                                "Priority dispatch",
                                "Faster support response",
                                "1.5x points multiplier"
                            ]}
                        />
                        <TierCard
                            tier="Premium"
                            subtitle="Power User"
                            price="$19.99 / month"
                            currentPlan={currentPlan}
                            canChoose={isSignedIn && canChoosePaid}
                            features={[
                                "Highest dispatch priority",
                                "Concierge support",
                                "2x points multiplier"
                            ]}
                        />
                    </div>

                    {isSignedIn && !canChoosePaid && (
                        <p className="mt-4 text-sm text-[#e8a230]">
                            Add a payment method first to unlock Plus or Premium.
                        </p>
                    )}
                </section>
            </main>
        </div>
    );
}
