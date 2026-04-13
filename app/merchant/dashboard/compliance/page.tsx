import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type MerchantComplianceRestaurant = {
    id: string;
    name: string;
    complianceScore?: number | null;
    healthGrade?: string | null;
    complianceStatus?: string | null;
    complianceTier?: string | null;
    lastInspectionAt?: string | null;
    lastInspectionSource?: string | null;
    publicInspectionUrl?: string | null;
};

type ComplianceIntegration = {
    id: string;
    provider: string;
    status?: string | null;
    syncMode?: string | null;
    lastSyncAt?: string | null;
};

type ComplianceInspection = {
    id: string;
    provider: string;
    inspectionDate?: string | null;
    score?: number | null;
    grade?: string | null;
    status?: string | null;
    sourceUrl?: string | null;
};

type ComplianceScoreHistory = {
    id: string;
    score?: number | null;
    reason?: string | null;
    createdAt?: string | null;
};

function formatDate(value?: string | null) {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleString();
}

function normalizeStatus(value?: string | null) {
    if (!value) return "Unavailable";
    return value.replaceAll("_", " ");
}

async function safeSingle<T>(query: PromiseLike<{ data: T | null; error: unknown }>): Promise<T | null> {
    try {
        const { data, error } = await query;
        if (error) return null;
        return data ?? null;
    } catch {
        return null;
    }
}

async function safeList<T>(query: PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
    try {
        const { data, error } = await query;
        if (error) return [];
        return data || [];
    } catch {
        return [];
    }
}

function compliancePillStyle(status?: string | null) {
    const normalized = String(status || "").toUpperCase();
    if (normalized.includes("PASS") || normalized.includes("COMPLIANT")) {
        return { borderColor: "#1a4a2a", background: "#0d1a10", color: "#2ee5a0" };
    }
    if (normalized.includes("WARN") || normalized.includes("REVIEW")) {
        return { borderColor: "#57400f", background: "#1c1508", color: "#f1b243" };
    }
    if (normalized.includes("FAIL") || normalized.includes("FLAG")) {
        return { borderColor: "#4a1a1a", background: "#1a0d10", color: "#f87171" };
    }
    return { borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#aab4c8" };
}

export default async function CompliancePage() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;
    const { userId } = await getAuthSession();
    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) {
        redirect("/login?role=merchant&next=/merchant/dashboard/compliance");
    }

    if (isPreview) {
        return (
            <div className="md-body min-h-screen animate-fade-in-up">
                <div className="md-page-hd">
                    <div>
                        <div className="md-page-title">Compliance</div>
                        <div className="md-page-sub">Preview mode is active. Sign in with a merchant account to load live compliance data.</div>
                    </div>
                </div>
            </div>
        );
    }

    const restaurant =
        (await safeSingle(
            supabaseAdmin
                .from("Restaurant")
                .select("id, name, complianceScore, healthGrade, complianceStatus, complianceTier, lastInspectionAt, lastInspectionSource, publicInspectionUrl")
                .eq("ownerId", activeUserId!)
                .maybeSingle()
        )) ||
        (await safeSingle(
            supabaseAdmin
                .from("Restaurant")
                .select("id, name")
                .eq("ownerId", activeUserId!)
                .maybeSingle()
        ));

    if (!restaurant) {
        redirect("/merchant/signup");
    }

    try {
        await supabaseAdmin.rpc("recalculate_restaurant_compliance_score", {
            target_restaurant_id: restaurant.id,
        });
    } catch {
    }

    const [integrations, inspections, scoreHistory] = await Promise.all([
        safeList(
            supabaseAdmin
                .from("ComplianceIntegration")
                .select("id, provider, status, syncMode, lastSyncAt")
                .eq("restaurantId", restaurant.id)
                .order("createdAt", { ascending: false })
                .limit(5)
        ),
        safeList(
            supabaseAdmin
                .from("ComplianceInspection")
                .select("id, provider, inspectionDate, score, grade, status, sourceUrl")
                .eq("restaurantId", restaurant.id)
                .order("inspectionDate", { ascending: false })
                .limit(8)
        ),
        safeList(
            supabaseAdmin
                .from("ComplianceScoreHistory")
                .select("id, score, reason, createdAt")
                .eq("restaurantId", restaurant.id)
                .order("createdAt", { ascending: false })
                .limit(8)
        ),
    ]);

    const latestInspection = inspections[0] || null;
    const latestIntegration = integrations[0] || null;
    const pillStyle = compliancePillStyle(restaurant.complianceStatus);
    const setupSteps = [
        {
            key: "integration",
            label: "Connect compliance provider",
            description: latestIntegration
                ? `${latestIntegration.provider} is linked (${normalizeStatus(latestIntegration.status)}).`
                : "Go to Integrations and connect SafetyCulture or your chosen provider.",
            done: Boolean(latestIntegration),
        },
        {
            key: "source",
            label: "Add public inspection source",
            description: restaurant.publicInspectionUrl
                ? "Public inspection URL is saved and visible to your team."
                : "Add your county/city inspection URL in integrations for reference.",
            done: Boolean(restaurant.publicInspectionUrl),
        },
        {
            key: "data",
            label: "Confirm first sync",
            description: latestInspection
                ? `Latest record: ${latestInspection.provider} · ${formatDate(latestInspection.inspectionDate)}.`
                : "Run initial sync or wait for webhook events to pull inspection data.",
            done: Boolean(latestInspection),
        },
    ];

    return (
        <div className="md-body min-h-screen animate-fade-in-up">
            <div className="md-page-hd">
                <div>
                    <div className="md-page-title">Compliance Dashboard</div>
                    <div className="md-page-sub">Live compliance records for {restaurant.name}.</div>
                </div>
                <div className="grid gap-2 sm:grid-cols-1">
                    <Link href="/merchant/dashboard/integrations" className="btn btn-gold justify-center">Manage Integrations</Link>
                </div>
            </div>

            <div className="md-stat-grid">
                <div className="md-stat-block">
                    <div className="md-stat-name">Latest Score</div>
                    <div className="md-stat-value">{typeof restaurant.complianceScore === "number" ? `${restaurant.complianceScore}/100` : "—"}</div>
                </div>
                <div className="md-stat-block">
                    <div className="md-stat-name">Latest Grade</div>
                    <div className="md-stat-value">{restaurant.healthGrade || "—"}</div>
                </div>
                <div className="md-stat-block">
                    <div className="md-stat-name">Compliance Status</div>
                    <div className="md-stat-value">
                        <span
                            className="inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em]"
                            style={pillStyle}
                        >
                            {normalizeStatus(restaurant.complianceStatus)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="md-stat-block" style={{ borderColor: "#2a3140", background: "linear-gradient(180deg, #121826 0%, #0d1320 100%)" }}>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="md-stat-name">Compliance Setup</div>
                        <p style={{ color: "var(--t2)", fontSize: "13px", lineHeight: 1.6, marginTop: "8px" }}>
                            Use these steps to get your compliance feed fully active for this merchant account.
                        </p>
                    </div>
                    <Link href="/merchant/dashboard/integrations" className="btn btn-gold justify-center">Setup Provider</Link>
                </div>
                <div className="mt-4 grid gap-2">
                    {setupSteps.map((step, index) => (
                        <div key={step.key} className="btn btn-ghost justify-between" style={{ cursor: "default", borderColor: step.done ? "#21503a" : "rgba(255,255,255,0.1)", background: step.done ? "rgba(46,229,160,0.08)" : "rgba(255,255,255,0.02)" }}>
                            <span>
                                {index + 1}. {step.label}
                                <span className="ml-3 text-xs text-[#8da0bf]">{step.description}</span>
                            </span>
                            <span className="text-xs font-black uppercase tracking-[0.12em]" style={{ color: step.done ? "#2ee5a0" : "#f1b243" }}>
                                {step.done ? "Done" : "Pending"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="md-two-col">
                <div className="md-stat-block">
                    <div className="md-stat-name">Connected Status</div>
                    <p style={{ color: "var(--t2)", fontSize: "13px", lineHeight: 1.6, marginBottom: "14px" }}>
                        Real provider sync state for your merchant account.
                    </p>
                    <div className="grid gap-2">
                        {latestIntegration ? (
                            <>
                                <div className="btn btn-ghost justify-between" style={{ cursor: "default" }}>
                                    <span>{latestIntegration.provider}</span>
                                    <span>{normalizeStatus(latestIntegration.status)}</span>
                                </div>
                                <div className="btn btn-ghost justify-between" style={{ cursor: "default" }}>
                                    <span>Sync mode</span>
                                    <span>{latestIntegration.syncMode || "—"}</span>
                                </div>
                                <div className="btn btn-ghost justify-between" style={{ cursor: "default" }}>
                                    <span>Last sync</span>
                                    <span>{formatDate(latestIntegration.lastSyncAt)}</span>
                                </div>
                            </>
                        ) : (
                            <div className="btn btn-ghost justify-center" style={{ cursor: "default" }}>
                                No compliance integration connected yet
                            </div>
                        )}
                    </div>
                </div>

                <div className="md-stat-block">
                    <div className="md-stat-name">Public Inspection View</div>
                    <p style={{ color: "var(--t2)", fontSize: "13px", lineHeight: 1.6, marginBottom: "14px" }}>
                        Latest source and inspection reference used by the portal.
                    </p>
                    <div className="grid gap-2">
                        <div className="btn btn-ghost justify-between" style={{ cursor: "default" }}>
                            <span>Latest source</span>
                            <span>{restaurant.lastInspectionSource || "Unavailable"}</span>
                        </div>
                        <div className="btn btn-ghost justify-between" style={{ cursor: "default" }}>
                            <span>Last inspection</span>
                            <span>{formatDate(restaurant.lastInspectionAt || latestInspection?.inspectionDate)}</span>
                        </div>
                        {restaurant.publicInspectionUrl ? (
                            <a href={restaurant.publicInspectionUrl} target="_blank" rel="noreferrer" className="btn btn-gold justify-center">
                                Open Public Record
                            </a>
                        ) : (
                            <div className="btn btn-ghost justify-center" style={{ cursor: "default" }}>
                                No public inspection URL stored
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="md-two-col">
                <div className="md-stat-block">
                    <div className="md-stat-name">Recent Records</div>
                    <p style={{ color: "var(--t2)", fontSize: "13px", lineHeight: 1.6, marginBottom: "14px" }}>
                        Most recent inspections pulled from connected providers.
                    </p>
                    <div className="grid gap-2">
                        {inspections.length === 0 && (
                            <div className="btn btn-ghost justify-center" style={{ cursor: "default" }}>
                                No inspection records synced yet
                            </div>
                        )}
                        {inspections.slice(0, 5).map((record) => (
                            <div key={record.id} className="btn btn-ghost justify-between" style={{ cursor: "default" }}>
                                <span>{record.provider}</span>
                                <span>
                                    {typeof record.score === "number" ? `${record.score}/100` : "—"} · {record.grade || "—"} · {formatDate(record.inspectionDate)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="md-stat-block">
                    <div className="md-stat-name">Score History</div>
                    <p style={{ color: "var(--t2)", fontSize: "13px", lineHeight: 1.6, marginBottom: "14px" }}>
                        Chronological compliance score changes.
                    </p>
                    <div className="grid gap-2">
                        {scoreHistory.length === 0 && (
                            <div className="btn btn-ghost justify-center" style={{ cursor: "default" }}>
                                No score history recorded yet
                            </div>
                        )}
                        {scoreHistory.slice(0, 5).map((history) => (
                            <div key={history.id} className="btn btn-ghost justify-between" style={{ cursor: "default" }}>
                                <span>{history.reason || "Compliance update"}</span>
                                <span>
                                    {typeof history.score === "number" ? `${history.score}/100` : "—"} · {formatDate(history.createdAt)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
