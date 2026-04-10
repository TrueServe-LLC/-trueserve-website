import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminStyles from "@/components/admin/AdminStyles";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff, hasPermission } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildScopedConfigKey, type ConfigEnvironment, type ConfigKey } from "@/lib/system";
import { logout, updateEnvironmentFeatureSwitch } from "../actions";

type FeatureDefinition = {
    key: ConfigKey;
    label: string;
    description: string;
    defaultValue: boolean;
};

const FEATURE_DEFINITIONS: FeatureDefinition[] = [
    {
        key: "ORDERING_SYSTEM_ENABLED",
        label: "Marketplace Ordering",
        description: "Enable or disable customer ordering across the app.",
        defaultValue: true,
    },
    {
        key: "AI_MENU_SCANNER_ENABLED",
        label: "AI Menu Scanner",
        description: "Controls AI menu upload and extraction for merchants.",
        defaultValue: true,
    },
    {
        key: "GOOGLE_RATINGS_SYNC_ENABLED",
        label: "Google Ratings Sync",
        description: "Use Google reviews/ratings in restaurant discovery.",
        defaultValue: false,
    },
    {
        key: "EXPRESS_CHECKOUT_ACTIVE",
        label: "Express Checkout",
        description: "Apple/Google wallet quick-pay options in checkout.",
        defaultValue: true,
    },
    {
        key: "INSTANT_PAYOUTS_ENABLED",
        label: "Instant Payouts",
        description: "Driver and merchant fast payout flows.",
        defaultValue: true,
    },
    {
        key: "MARKETPLACE_EMERGENCY_LOCK",
        label: "Emergency Lock",
        description: "Hard stop for marketplace traffic in emergencies.",
        defaultValue: false,
    },
];

const ENVIRONMENTS: Array<{ id: "global" | ConfigEnvironment; title: string; subtitle: string }> = [
    { id: "global", title: "Global Defaults", subtitle: "Fallback values used when no environment override exists." },
    { id: "production", title: "Production", subtitle: "Live customer traffic and payments." },
    { id: "preview", title: "Preview", subtitle: "Vercel preview deploys for QA and release checks." },
    { id: "development", title: "Development", subtitle: "Local/dev workflows and integration testing." },
];

function toBoolean(value: unknown, fallback: boolean) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "true" || normalized === "1") return true;
        if (normalized === "false" || normalized === "0") return false;
    }
    return fallback;
}

async function getFeatureConfigs() {
    const keys = FEATURE_DEFINITIONS.flatMap((feature) => [
        feature.key,
        buildScopedConfigKey(feature.key, "production"),
        buildScopedConfigKey(feature.key, "preview"),
        buildScopedConfigKey(feature.key, "development"),
    ]);

    const { data } = await supabaseAdmin
        .from("SystemConfig")
        .select("key, value, updatedAt")
        .in("key", keys);

    return data || [];
}

export default async function FeatureSwitchesPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();

    const isAuthorized = !!adminSession || (isAuth && isInternalStaff(role));
    if (!isAuthorized) redirect("/admin/login");

    const configs = await getFeatureConfigs();
    const configMap = new Map<string, { value: unknown; updatedAt?: string }>(
        configs.map((config: any) => [config.key, { value: config.value, updatedAt: config.updatedAt }])
    );

    const runtimeEnvironment = (process.env.VERCEL_ENV || process.env.NODE_ENV || "development").toLowerCase();

    return (
        <div className="db">
            <AdminStyles />
            <div className="nav">
                <div className="nav-brand">True <span>SERVE</span></div>
                <div className="nav-links">
                    {hasPermission(role, "manage_pricing") && <Link href="/admin/pricing" className="nav-link">Pricing</Link>}
                    {hasPermission(role, "manage_system_settings") && <Link href="/admin/settings" className="nav-link">Settings</Link>}
                    {hasPermission(role, "manage_system_settings") && <Link href="/admin/feature-switches" className="nav-link active">Feature Switches</Link>}
                    <Link href="/admin/content" className="nav-link">CMS</Link>
                    <Link href="/admin/team" className="nav-link">Team</Link>
                    <a href="https://app.asana.com/0/1213802368265152/board" target="_blank" rel="noopener noreferrer" className="nav-link">Asana</a>
                    {hasPermission(role, "view_dashboard") && <Link href="/admin/dashboard" className="nav-link">Dashboard</Link>}
                    <form action={async () => { "use server"; await logout(); }}>
                        <button className="nav-link !bg-transparent !border-none !cursor-pointer">Log Out</button>
                    </form>
                </div>
            </div>

            <div className="page">
                <div className="page-title">Feature <span>Switches</span></div>
                <div className="page-sub">Scoped controls for global, production, preview, and development rollouts.</div>

                <div className="panel !mb-8">
                    <div className="panel-hd">Environment Runtime</div>
                    <div className="text-[11px] text-[#8a93a7] uppercase tracking-[0.12em]">
                        Current runtime detected as <span className="text-[#e8a230] font-black">{runtimeEnvironment}</span>
                    </div>
                </div>

                <div className="space-y-8">
                    {ENVIRONMENTS.map((environment) => (
                        <div key={environment.id} className="panel">
                            <div className="panel-hd">
                                {environment.title}
                                <span className="badge badge-gray">{environment.id.toUpperCase()}</span>
                            </div>
                            <div className="text-[11px] text-[#657089] mt-1 mb-4">{environment.subtitle}</div>

                            <div className="params-grid">
                                {FEATURE_DEFINITIONS.map((feature) => {
                                    const scopedKey = environment.id === "global"
                                        ? feature.key
                                        : buildScopedConfigKey(feature.key, environment.id);
                                    const globalRecord = configMap.get(feature.key);
                                    const scopedRecord = configMap.get(scopedKey);
                                    const hasExplicitOverride = environment.id === "global" || !!scopedRecord;
                                    const effectiveValue = scopedRecord
                                        ? toBoolean(scopedRecord.value, feature.defaultValue)
                                        : toBoolean(globalRecord?.value, feature.defaultValue);
                                    const sourceLabel = environment.id === "global"
                                        ? "Global"
                                        : hasExplicitOverride
                                            ? "Override"
                                            : "Inherited";

                                    return (
                                        <div key={`${environment.id}-${feature.key}`} className="param-row">
                                            <div className="param-info">
                                                <div className="param-name">{feature.label}</div>
                                                <div className="param-desc">{feature.description}</div>
                                                <div style={{ marginTop: "6px" }}>
                                                    <span style={{ fontSize: "9px", fontFamily: "DM Mono", color: "#e8a230", background: "#e8a23010", padding: "2px 6px", border: "1px solid #e8a23020" }}>
                                                        {scopedKey}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="param-right">
                                                <div className={`param-value ${effectiveValue ? "enabled" : ""}`} style={{ fontSize: "10px", textTransform: "uppercase" }}>
                                                    {effectiveValue ? "Enabled" : "Disabled"} · {sourceLabel}
                                                </div>
                                                <form
                                                    action={async () => {
                                                        "use server";
                                                        await updateEnvironmentFeatureSwitch(
                                                            feature.key,
                                                            !effectiveValue,
                                                            environment.id
                                                        );
                                                    }}
                                                >
                                                    <button className="nav-cta" style={{ fontSize: "9px", padding: "6px 12px" }}>
                                                        {effectiveValue ? "Disable" : "Enable"}
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
