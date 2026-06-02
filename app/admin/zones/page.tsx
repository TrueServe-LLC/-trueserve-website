import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import AdminPortalWrapper from "@/app/admin/AdminPortalWrapper";
import { isMockAdminRecord, shouldHideMockAdminData } from "@/lib/admin-data";
import { canAccessAdminSection } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const DEMO_RESTAURANT_PATTERN = /\b(mock|demo|test|seed|sandbox|preview|sample|qa|staging)\b/i;

function isDemoRestaurant(restaurant: any) {
    const text = [
        restaurant.name,
        restaurant.city,
        restaurant.state,
        restaurant.owner?.name,
        restaurant.owner?.email,
    ]
        .filter(Boolean)
        .join(" ");

    return restaurant.isMock === true || DEMO_RESTAURANT_PATTERN.test(text);
}

function formatZoneName(city: string, state: string) {
    return [city, state].filter(Boolean).join(", ");
}

export default async function AdminZonesPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && canAccessAdminSection(role, "zones"));
    if (!isAuthorized) redirect("/admin/login");

    const { data: restaurants } = await supabaseAdmin
        .from("Restaurant")
        .select("id, name, city, state, visibility, posSystem, isMock, owner:User(id, name, email)")
        .limit(500);

    const realRestaurants = (restaurants || [])
        .filter((restaurant: any) => !isDemoRestaurant(restaurant))
        .filter((restaurant: any) => !shouldHideMockAdminData() || !isMockAdminRecord(restaurant.owner))
        .filter((restaurant: any) => restaurant.city || restaurant.state);

    const zoneMap = new Map<string, { city: string; state: string; restaurants: any[] }>();
    realRestaurants.forEach((restaurant: any) => {
        const city = String(restaurant.city || "Unassigned").trim();
        const state = String(restaurant.state || "").trim();
        const key = `${city.toLowerCase()}|${state.toLowerCase()}`;
        if (!zoneMap.has(key)) zoneMap.set(key, { city, state, restaurants: [] });
        zoneMap.get(key)!.restaurants.push(restaurant);
    });

    const zones = Array.from(zoneMap.values()).sort((a, b) =>
        formatZoneName(a.city, a.state).localeCompare(formatZoneName(b.city, b.state))
    );

    const totalRestaurants = zones.reduce((sum, zone) => sum + zone.restaurants.length, 0);
    const liveRestaurants = zones.reduce(
        (sum, zone) =>
            sum +
            zone.restaurants.filter((restaurant: any) => String(restaurant.visibility || "").toUpperCase() === "VISIBLE")
                .length,
        0
    );
    const connectedPos = zones.reduce(
        (sum, zone) => sum + zone.restaurants.filter((restaurant: any) => !!restaurant.posSystem).length,
        0
    );

    return (
        <AdminPortalWrapper role={role}>
            <style>{`
                .zone-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
                .zone-summary-card, .zone-card, .zone-empty { background: #141a18; border: 1px solid #1e2420; border-radius: 12px; }
                .zone-summary-card { padding: 16px; }
                .zone-label { color: #777; font-size: 11px; font-weight: 850; letter-spacing: .12em; text-transform: uppercase; }
                .zone-value { color: #fff; font-size: 28px; font-weight: 850; margin-top: 7px; }
                .zone-sub { color: #888; font-size: 12px; margin-top: 4px; line-height: 1.45; }
                .zone-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
                .zone-card { padding: 16px; }
                .zone-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
                .zone-card h2 { color: #fff; margin: 0; font-size: 18px; }
                .zone-card p { color: #999; font-size: 13px; line-height: 1.55; margin: 4px 0 0; }
                .zone-pill { display: inline-flex; width: fit-content; border-radius: 999px; padding: 3px 9px; font-size: 10px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
                .zone-pill.green { color: #34d399; background: rgba(52,211,153,.08); border: 1px solid rgba(52,211,153,.22); }
                .zone-pill.orange { color: #fb923c; background: rgba(249,115,22,.08); border: 1px solid rgba(249,115,22,.22); }
                .zone-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-bottom: 14px; }
                .zone-metric { border: 1px solid #24302a; border-radius: 10px; padding: 10px; }
                .zone-metric strong { display: block; color: #fff; font-size: 18px; line-height: 1; }
                .zone-metric span { display: block; color: #888; font-size: 11px; margin-top: 5px; }
                .zone-restaurants { display: grid; gap: 8px; }
                .zone-restaurant { display: flex; justify-content: space-between; gap: 12px; border: 1px solid #24302a; border-radius: 10px; padding: 10px; color: #aaa; font-size: 12px; }
                .zone-restaurant strong { color: #fff; display: block; font-size: 13px; }
                .zone-empty { padding: 18px; color: #aaa; font-size: 13px; line-height: 1.6; }
                @media (max-width: 980px) { .zone-summary { grid-template-columns: repeat(2, 1fr); } .zone-grid { grid-template-columns: 1fr; } .zone-metrics { grid-template-columns: repeat(2, 1fr); } }
                @media (max-width: 640px) { .zone-summary { grid-template-columns: 1fr; } .zone-restaurant { flex-direction: column; } }
            `}</style>
            <div className="adm-page-header">
                <h1>Zones</h1>
                <p>Zones are generated from real restaurant records, so operating coverage reflects the merchants actually in the database. Demo and test merchants are excluded.</p>
            </div>
            <div className="adm-page-body">
                <div className="zone-summary">
                    <div className="zone-summary-card">
                        <div className="zone-label">Active zones</div>
                        <div className="zone-value">{zones.length}</div>
                        <div className="zone-sub">Based on restaurant city/state</div>
                    </div>
                    <div className="zone-summary-card">
                        <div className="zone-label">Restaurants</div>
                        <div className="zone-value">{liveRestaurants}/{totalRestaurants}</div>
                        <div className="zone-sub">Live / tracked real merchants</div>
                    </div>
                    <div className="zone-summary-card">
                        <div className="zone-label">POS coverage</div>
                        <div className="zone-value">{connectedPos}</div>
                        <div className="zone-sub">Restaurants with a POS selected</div>
                    </div>
                </div>

                {zones.length === 0 ? (
                    <div className="zone-empty">
                        No real merchant zones yet. Once a non-demo restaurant is approved with a city and state, it will appear here automatically.
                    </div>
                ) : (
                    <div className="zone-grid">
                        {zones.map((zone) => {
                            const live = zone.restaurants.filter(
                                (restaurant: any) => String(restaurant.visibility || "").toUpperCase() === "VISIBLE"
                            ).length;
                            const pending = zone.restaurants.length - live;
                            const pos = zone.restaurants.filter((restaurant: any) => !!restaurant.posSystem).length;
                            const driverLow = Math.max(2, Math.ceil(Math.max(live, 1) * 2));
                            const driverHigh = Math.max(4, Math.ceil(Math.max(live, 1) * 3));
                            return (
                                <section key={`${zone.city}-${zone.state}`} className="zone-card">
                                    <div className="zone-top">
                                        <div>
                                            <h2>{formatZoneName(zone.city, zone.state) || "Unassigned zone"}</h2>
                                            <p>{live > 0 ? "Active operating market" : "Merchant onboarding market"}</p>
                                        </div>
                                        <span className={`zone-pill ${live > 0 ? "green" : "orange"}`}>{live > 0 ? "Active" : "Building"}</span>
                                    </div>
                                    <div className="zone-metrics">
                                        <div className="zone-metric"><strong>{zone.restaurants.length}</strong><span>Restaurants</span></div>
                                        <div className="zone-metric"><strong>{live}</strong><span>Live</span></div>
                                        <div className="zone-metric"><strong>{pos}</strong><span>POS selected</span></div>
                                        <div className="zone-metric"><strong>{driverLow}-{driverHigh}</strong><span>Driver target</span></div>
                                    </div>
                                    <div className="zone-restaurants">
                                        {zone.restaurants.slice(0, 4).map((restaurant: any) => (
                                            <div key={restaurant.id} className="zone-restaurant">
                                                <div>
                                                    <strong>{restaurant.name || "Unnamed restaurant"}</strong>
                                                    {restaurant.posSystem || "POS not selected"}
                                                </div>
                                                <span>{String(restaurant.visibility || "").toUpperCase() === "VISIBLE" ? "Live" : "Pending"}</span>
                                            </div>
                                        ))}
                                        {pending > 0 ? <p>{pending} restaurant{pending === 1 ? "" : "s"} still pending visibility.</p> : null}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </AdminPortalWrapper>
    );
}
