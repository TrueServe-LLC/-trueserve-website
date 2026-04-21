import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { canAccessAdminSection } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildScopedConfigKey, type ConfigEnvironment, type ConfigKey } from "@/lib/system";
import { updateEnvironmentFeatureSwitch } from "../actions";
import AdminPortalWrapper from "../AdminPortalWrapper";

export const dynamic = "force-dynamic";

type FeatureDefinition = {
    key: ConfigKey;
    label: string;
    description: string;
    defaultValue: boolean;
};

const FEATURE_DEFINITIONS: FeatureDefinition[] = [
    { key: "ORDERING_SYSTEM_ENABLED",    label: "Marketplace Ordering",  description: "Enable or disable customer ordering across the app.",                              defaultValue: true  },
    { key: "AI_MENU_SCANNER_ENABLED",    label: "AI Menu Scanner",        description: "Controls AI menu upload and extraction for merchants.",                          defaultValue: true  },
    { key: "GOOGLE_RATINGS_SYNC_ENABLED",label: "Google Ratings Sync",    description: "Use Google reviews/ratings in restaurant discovery.",                           defaultValue: false },
    { key: "EXPRESS_CHECKOUT_ACTIVE",    label: "Express Checkout",       description: "Apple/Google wallet quick-pay options in checkout.",                            defaultValue: true  },
    { key: "INSTANT_PAYOUTS_ENABLED",    label: "Instant Payouts",        description: "Driver and merchant fast payout flows.",                                        defaultValue: true  },
    { key: "COMPLIANCE_LAYER_ENABLED",   label: "Compliance Layer",       description: "Toggle the TrueServe compliance dashboards, inspections, and driver attestations.", defaultValue: false },
    { key: "MARKETPLACE_EMERGENCY_LOCK", label: "Emergency Lock",         description: "Hard stop for marketplace traffic in emergencies.",                             defaultValue: false },
];

const ENVIRONMENTS: Array<{ id: "global" | ConfigEnvironment; title: string; subtitle: string }> = [
    { id: "global",      title: "Global Defaults", subtitle: "Fallback values used when no environment override exists." },
    { id: "production",  title: "Production",      subtitle: "Live customer traffic and payments." },
    { id: "preview",     title: "Preview",         subtitle: "Vercel preview deploys for QA and release checks." },
    { id: "development", title: "Development",     subtitle: "Local/dev workflows and integration testing." },
];

function toBoolean(value: unknown, fallback: boolean) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
        const n = value.trim().toLowerCase();
        if (n === "true" || n === "1") return true;
        if (n === "false" || n === "0") return false;
    }
    return fallback;
}

async function getFeatureConfigs() {
    const keys = FEATURE_DEFINITIONS.flatMap((f) => [
        f.key,
        buildScopedConfigKey(f.key, "production"),
        buildScopedConfigKey(f.key, "preview"),
        buildScopedConfigKey(f.key, "development"),
    ]);
    const { data } = await supabaseAdmin.from("SystemConfig").select("key, value, updatedAt").in("key", keys);
    return data || [];
}

export default async function FeatureSwitchesPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && canAccessAdminSection(role, 'feature-switches'));
    if (!isAuthorized) redirect("/admin/login");

    const configs = await getFeatureConfigs();
    const configMap = new Map<string, { value: unknown; updatedAt?: string }>(
        configs.map((c: any) => [c.key, { value: c.value, updatedAt: c.updatedAt }])
    );
    const runtimeEnvironment = (process.env.VERCEL_ENV || process.env.NODE_ENV || "development").toLowerCase();

    return (
        <AdminPortalWrapper role={role}>
            <style>{`
                .fs-env-block { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 18px; margin-bottom: 16px; }
                .fs-env-title { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 2px; }
                .fs-env-sub { font-size: 12px; color: #555; margin-bottom: 14px; }
                .fs-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1e2420; gap: 12px; }
                .fs-row:last-child { border-bottom: none; }
                .fs-info { flex: 1; min-width: 0; }
                .fs-label { font-size: 13px; font-weight: 500; color: #ccc; }
                .fs-desc { font-size: 12px; color: #555; margin-top: 2px; }
                .fs-key { font-size: 10px; color: #f97316; background: rgba(249,115,22,0.1); padding: 1px 6px; border-radius: 3px; display: inline-block; margin-top: 4px; font-family: monospace; }
                .fs-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
                .fs-status { font-size: 11px; font-weight: 500; white-space: nowrap; }
                .fs-status.on { color: #34d399; }
                .fs-status.off { color: #555; }
                .fs-btn { background: #1e2420; border: 1px solid #2e3830; color: #ccc; font-size: 12px; padding: 5px 12px; border-radius: 4px; cursor: pointer; white-space: nowrap; }
                .fs-btn:hover { border-color: #f97316; color: #f97316; }
                .fs-runtime { background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.2); border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; font-size: 13px; color: #ccc; }
                .fs-runtime span { color: #f97316; font-weight: 600; }
            `}</style>

            <div className="adm-page-header">
                <h1>Feature Switches</h1>
                <p>Scoped feature flags for global, production, preview, and development environments</p>
            </div>
            <div className="adm-page-body">
                <div className="fs-runtime">
                    Current runtime: <span>{runtimeEnvironment}</span>
                </div>

                {ENVIRONMENTS.map((env) => (
                    <div key={env.id} className="fs-env-block">
                        <div className="fs-env-title">{env.title}</div>
                        <div className="fs-env-sub">{env.subtitle}</div>

                        {FEATURE_DEFINITIONS.map((feature) => {
                            const scopedKey = env.id === "global"
                                ? feature.key
                                : buildScopedConfigKey(feature.key, env.id);
                            const globalRecord = configMap.get(feature.key);
                            const scopedRecord = configMap.get(scopedKey);
                            const effectiveValue = scopedRecord
                                ? toBoolean(scopedRecord.value, feature.defaultValue)
                                : toBoolean(globalRecord?.value, feature.defaultValue);
                            const sourceLabel = env.id === "global" ? "global" : scopedRecord ? "override" : "inherited";

                            return (
                                <div key={`${env.id}-${feature.key}`} className="fs-row">
                                    <div className="fs-info">
                                        <div className="fs-label">{feature.label}</div>
                                        <div className="fs-desc">{feature.description}</div>
                                        <div className="fs-key">{scopedKey}</div>
                                    </div>
                                    <div className="fs-right">
                                        <span className={`fs-status ${effectiveValue ? 'on' : 'off'}`}>
                                            {effectiveValue ? '● Enabled' : '○ Disabled'} · {sourceLabel}
                                        </span>
                                        <form action={async () => {
                                            "use server";
                                            await updateEnvironmentFeatureSwitch(feature.key, !effectiveValue, env.id);
                                        }}>
                                            <button type="submit" className="fs-btn">
                                                {effectiveValue ? "Disable" : "Enable"}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </AdminPortalWrapper>
    );
}
