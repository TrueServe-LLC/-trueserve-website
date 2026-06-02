import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import AdminPortalWrapper from "@/app/admin/AdminPortalWrapper";
import { canAccessAdminSection } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const LAUNCH_ZONES = [
    { name: "Raleigh", status: "Planning", coverage: "Restaurant sourcing", driverNeed: "8-12 drivers" },
    { name: "Durham", status: "Next", coverage: "Market validation", driverNeed: "6-10 drivers" },
    { name: "Chapel Hill", status: "Future", coverage: "Campus + dinner pilots", driverNeed: "4-8 drivers" },
    { name: "Charlotte", status: "Partner lead", coverage: "Merchant onboarding", driverNeed: "12-18 drivers" },
];

export default async function AdminZonesPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && canAccessAdminSection(role, "zones"));
    if (!isAuthorized) redirect("/admin/login");

    const { data: restaurants } = await supabaseAdmin
        .from("Restaurant")
        .select("id, name, city, state, visibility")
        .limit(500);

    return (
        <AdminPortalWrapper role={role}>
            <style>{`
                .zone-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
                .zone-card { background: #141a18; border: 1px solid #1e2420; border-radius: 12px; padding: 16px; }
                .zone-card h2 { color: #fff; margin: 0 0 8px; font-size: 18px; }
                .zone-meta { color: #999; font-size: 13px; line-height: 1.55; display: grid; gap: 5px; }
                .zone-pill { display: inline-flex; width: fit-content; border-radius: 999px; padding: 3px 9px; font-size: 10px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; color: #34d399; background: rgba(52,211,153,.08); border: 1px solid rgba(52,211,153,.22); margin-bottom: 10px; }
                @media (max-width: 760px) { .zone-grid { grid-template-columns: 1fr; } }
            `}</style>
            <div className="adm-page-header">
                <h1>Zones</h1>
                <p>Launch market coverage for restaurants, drivers, and operating areas.</p>
            </div>
            <div className="adm-page-body">
                <div className="zone-grid">
                    {LAUNCH_ZONES.map((zone) => {
                        const zoneRestaurants = (restaurants || []).filter((restaurant: any) =>
                            String(restaurant.city || "").toLowerCase() === zone.name.toLowerCase()
                        );
                        const liveRestaurants = zoneRestaurants.filter((restaurant: any) => String(restaurant.visibility || "").toUpperCase() === "VISIBLE").length;
                        return (
                            <section key={zone.name} className="zone-card">
                                <span className="zone-pill">{zone.status}</span>
                                <h2>{zone.name}</h2>
                                <div className="zone-meta">
                                    <span>{zone.coverage}</span>
                                    <span>{zoneRestaurants.length} restaurants tracked · {liveRestaurants} live</span>
                                    <span>Driver target: {zone.driverNeed}</span>
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>
        </AdminPortalWrapper>
    );
}
