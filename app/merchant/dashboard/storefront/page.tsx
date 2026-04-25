import { createClient } from "@/lib/supabase/server";
import { getAuthSession } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import StoreBannerUpload from "../StoreBannerUpload";
import EmbedManager from "../EmbedManager";

export const dynamic = "force-dynamic";

function buildSlug(value: string) {
    return value
        .toLowerCase()
        .replace(/['']/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export default async function StorefrontPage() {
    const { userId } = await getAuthSession();
    const activeUserId = userId;

    if (!activeUserId) {
        redirect("/login?role=merchant");
    }

    let restaurant: any = null;
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("Restaurant")
        .select("id, name, imageUrl")
        .eq("ownerId", activeUserId)
        .maybeSingle();

    if (error || !data) {
        redirect("/merchant/signup");
    }

    restaurant = {
        ...data,
        slug: buildSlug(data.name || "restaurant"),
    };

    const hasBanner = Boolean(restaurant.imageUrl);
    const storefrontPath = `/restaurants/${restaurant.slug || restaurant.id}`;
    const storefrontUrl = `https://trueserve.delivery${storefrontPath}`;

    return (
        <div className="md-body min-h-screen animate-fade-in-up">
            {/* PAGE HEADER */}
            <div className="md-page-hd">
                <div>
                    <div className="md-page-title">Storefront</div>
                    <div className="md-page-sub">Customer-facing banner, embed, and public link · {restaurant.name}</div>
                </div>
                <div className="md-hd-right">
                    <Link href={storefrontPath} target="_blank" className="md-terminal-btn" style={{ textDecoration: "none" }}>
                        <span className="md-terminal-dot" style={{ background: "var(--green)" }}></span>
                        View Live Storefront
                    </Link>
                    <div className="md-online-badge">Storefront Active</div>
                </div>
            </div>

            {/* STAT GRID */}
            <div className="md-stat-grid">
                <div className="md-stat-block">
                    <div className="md-stat-name">Banner Status</div>
                    <div className="md-stat-value" style={{ fontSize: "24px", color: hasBanner ? "var(--green)" : "var(--t2)" }}>
                        {hasBanner ? "Uploaded" : "Not Set"}
                    </div>
                </div>
                <div className="md-stat-block">
                    <div className="md-stat-name">Embed Code</div>
                    <div className="md-stat-value" style={{ fontSize: "24px", color: "var(--green)" }}>Ready</div>
                </div>
                <div className="md-stat-block">
                    <div className="md-stat-name">Public Path</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--gold)", marginTop: "8px", wordBreak: "break-all" }}>
                        {storefrontUrl}
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="md-two-col">
                <div className="md-stat-block">
                    <div className="md-stat-name">Quick Actions</div>
                    <p style={{ color: "var(--t2)", fontSize: "13px", lineHeight: 1.6, marginBottom: "14px" }}>
                        Preview how customers see your storefront and manage your public menu listing.
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <Link href={storefrontPath} target="_blank" className="btn btn-gold justify-center" style={{ textDecoration: "none" }}>
                            Menu Preview ↗
                        </Link>
                        <Link href="/merchant/dashboard" className="btn btn-ghost justify-center" style={{ textDecoration: "none" }}>
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
                <div className="md-stat-block">
                    <div className="md-stat-name">Public Link</div>
                    <p style={{ color: "var(--t2)", fontSize: "13px", lineHeight: 1.6, marginBottom: "14px" }}>
                        Share this path so customers can find and order from {restaurant.name} directly.
                    </p>
                    <div className="btn btn-ghost justify-center w-full" style={{ cursor: "default", color: "var(--gold)", borderColor: "rgba(249,115,22,.3)" }}>
                        {storefrontUrl}
                    </div>
                </div>
            </div>

            {/* BANNER UPLOAD */}
            <StoreBannerUpload currentImageUrl={restaurant.imageUrl || ""} />

            {/* EMBED MANAGER */}
            <EmbedManager
                restaurantId={restaurant.id}
                restaurantName={restaurant.name}
                slug={restaurant.slug}
                storefrontPath={storefrontPath}
                storefrontUrl={storefrontUrl}
                bannerImageUrl={restaurant.imageUrl || ""}
            />
        </div>
    );
}
