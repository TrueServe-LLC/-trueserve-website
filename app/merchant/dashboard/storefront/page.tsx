import { createClient } from "@/lib/supabase/server";
import { getAuthSession } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
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
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const { userId } = await getAuthSession();
    const activeUserId = userId;

    if (!activeUserId && !isPreview) {
        redirect("/login?role=merchant");
    }

    let restaurant: any = null;

    if (isPreview) {
        restaurant = {
            id: "preview",
            name: "Pilot Kitchen",
            imageUrl: null,
            slug: "pilot-kitchen",
        };
    } else {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("Restaurant")
            .select("id, name, imageUrl")
            .eq("ownerId", activeUserId!)
            .maybeSingle();

        if (error || !data) {
            redirect("/merchant/signup");
        }

        restaurant = {
            ...data,
            slug: buildSlug(data.name || "restaurant"),
        };
    }

    const hasBanner = Boolean(restaurant.imageUrl);
    const storefrontPath = `/restaurants/${restaurant.slug || restaurant.id}`;
    const storefrontUrl = `https://trueserve.delivery${storefrontPath}`;

    return (
        <div className="animate-fade-in-up">
            {/* SUB-DESCRIPTION + QUICK ACTIONS HEADER ROW */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: -4, flexWrap: 'wrap', gap: 10 }}>
                <p style={{ fontSize: 11, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    Customer-facing banner, embed, and public link · {restaurant.name}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={storefrontPath} target="_blank" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid #1e2420', borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 700, color: '#3dd68c', letterSpacing: '0.06em' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3dd68c', display: 'inline-block' }} />
                        View Live Storefront
                    </Link>
                    <span style={{ display: 'flex', alignItems: 'center', background: 'rgba(61,214,140,0.08)', border: '1px solid rgba(61,214,140,0.2)', borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 700, color: '#3dd68c', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        Active
                    </span>
                </div>
            </div>

            {/* STAT GRID — matches mch-stat-card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
                {[
                    { label: 'Banner Status', icon: '🖼️', value: hasBanner ? 'Uploaded' : 'Not Set', color: hasBanner ? '#3dd68c' : '#777' },
                    { label: 'Embed Code',    icon: '🔗', value: 'Ready',                             color: '#3dd68c'                      },
                    { label: 'Public Path',   icon: '🌐', value: storefrontUrl,                       color: '#f97316', small: true          },
                ].map(({ label, icon, value, color, small }) => (
                    <div key={label} style={{ background: '#141a18', border: '1px solid #1e2420', borderRadius: 8, padding: 14 }}>
                        <div style={{ fontSize: 11, color: '#777', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 18, height: 18, borderRadius: 4, background: '#0f1210', border: '1px solid #1e2420', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>{icon}</span>
                            {label}
                        </div>
                        <div style={{ fontSize: small ? 13 : 27, fontWeight: 700, color, letterSpacing: small ? 0 : '-0.5px', wordBreak: 'break-all', lineHeight: 1.2 }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* QUICK ACTIONS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ background: '#141a18', border: '1px solid #1e2420', borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Quick Actions</div>
                    <p style={{ color: '#666', fontSize: 12, lineHeight: 1.6, marginBottom: 14 }}>
                        Preview how customers see your storefront and manage your public menu listing.
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Link href={storefrontPath} target="_blank" style={{ textDecoration: 'none', background: '#f97316', color: '#000', padding: '7px 14px', borderRadius: 6, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            Menu Preview ↗
                        </Link>
                        <Link href="/merchant/dashboard" style={{ textDecoration: 'none', background: 'transparent', border: '1px solid #1e2420', color: '#777', padding: '7px 14px', borderRadius: 6, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            Dashboard
                        </Link>
                    </div>
                </div>
                <div style={{ background: '#141a18', border: '1px solid #1e2420', borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Public Link</div>
                    <p style={{ color: '#666', fontSize: 12, lineHeight: 1.6, marginBottom: 14 }}>
                        Share this URL so customers can find and order from {restaurant.name} directly.
                    </p>
                    <div style={{ background: '#0f1210', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 6, padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#f97316', wordBreak: 'break-all' }}>
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
