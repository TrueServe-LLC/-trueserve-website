import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { canAccessAdminSection, ADMIN_ROLE_MATRIX, ADMIN_SECTION_PERMISSIONS, getPermissionLabel } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { updateConfigParam } from "../actions";
import AdminPortalWrapper from "../AdminPortalWrapper";

export const dynamic = "force-dynamic";

async function getConfigs() {
    const { data } = await supabaseAdmin.from('SystemConfig').select('*').order('key');
    return data || [];
}

async function getAuditLogs() {
    const { data } = await supabaseAdmin
        .from('AuditLog')
        .select(`*, actor:User(name)`)
        .eq('entityType', 'SystemConfig')
        .order('createdAt', { ascending: false })
        .limit(12);
    return data || [];
}

export default async function SettingsPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && canAccessAdminSection(role, 'settings'));
    if (!isAuthorized) redirect("/admin/login");

    const configs = await getConfigs();
    const auditLogs = await getAuditLogs();

    return (
        <AdminPortalWrapper role={role}>
            <style>{`
                .iam-overview { display: grid; grid-template-columns: 1.15fr 1fr; gap: 12px; margin-bottom: 16px; }
                .iam-callouts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
                .iam-callout { background: #101512; border: 1px solid #1e2420; border-radius: 8px; padding: 10px 12px; }
                .iam-callout strong { display: block; color: #fff; font-size: 13px; margin-bottom: 2px; }
                .iam-callout span { color: #777; font-size: 12px; line-height: 1.45; }
                .iam-role-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
                .iam-role-card { background: #101512; border: 1px solid #1e2420; border-radius: 8px; padding: 14px; }
                .iam-role-name { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 4px; }
                .iam-role-desc { font-size: 12px; color: #777; line-height: 1.5; margin-bottom: 10px; }
                .iam-perm-list { display: flex; flex-wrap: wrap; gap: 6px; }
                .iam-perm-chip { font-size: 10px; color: #f97316; background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.16); padding: 3px 8px; border-radius: 4px; white-space: nowrap; }
                .iam-section-table-wrap { border: 1px solid #1e2420; border-radius: 8px; overflow-x: auto; background: #101512; margin-top: 12px; }
                .iam-section-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                .iam-section-table th { padding: 10px 12px; text-align: left; color: #666; font-weight: 500; border-bottom: 1px solid #1e2420; white-space: nowrap; }
                .iam-section-table td { padding: 10px 12px; color: #aaa; border-bottom: 1px solid #1e2420; vertical-align: top; }
                .iam-section-table tr:last-child td { border-bottom: none; }
                .iam-section-title { color: #fff; font-weight: 600; }
                .iam-role-tags { display: flex; flex-wrap: wrap; gap: 6px; }
                .iam-role-tag { font-size: 10px; color: #f5a623; background: rgba(245,166,35,0.08); border: 1px solid rgba(245,166,35,0.14); padding: 3px 8px; border-radius: 4px; white-space: nowrap; }
                .set-param-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #1e2420; gap: 12px; }
                .set-param-row:last-child { border-bottom: none; }
                .set-param-name { font-size: 13px; font-weight: 500; color: #ccc; }
                .set-param-desc { font-size: 12px; color: #555; margin-top: 2px; }
                .set-param-key { font-size: 10px; color: #f97316; background: rgba(249,115,22,0.1); padding: 1px 6px; border-radius: 3px; display: inline-block; margin-top: 4px; font-family: monospace; }
                .set-param-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
                .set-param-input { background: #0f1210; border: 1px solid #2e3830; color: #fff; font-size: 13px; padding: 6px 10px; border-radius: 4px; width: 100px; outline: none; }
                .set-param-input:focus { border-color: #f97316; }
                .set-val-badge { font-size: 11px; padding: 3px 10px; border-radius: 4px; font-weight: 500; }
                .set-val-badge.on { background: rgba(52,211,153,0.12); color: #34d399; }
                .set-val-badge.off { background: rgba(85,85,85,0.2); color: #666; }
                .set-btn { background: #1e2420; border: 1px solid #2e3830; color: #ccc; font-size: 12px; padding: 6px 12px; border-radius: 4px; cursor: pointer; white-space: nowrap; }
                .set-btn:hover { border-color: #f97316; color: #f97316; }
                .set-audit-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                .set-audit-table th { padding: 8px 12px; text-align: left; color: #555; font-weight: 500; border-bottom: 1px solid #1e2420; }
                .set-audit-table td { padding: 8px 12px; color: #888; border-bottom: 1px solid #1e2420; }
                .set-audit-table tr:last-child td { border-bottom: none; }
            `}</style>

            <div className="adm-page-header">
                <h1>Settings</h1>
                <p>Platform parameters, system configuration, and change history</p>
            </div>
            <div className="adm-page-body">
                <div className="adm-card" style={{ marginBottom: 16 }}>
                    <div className="adm-card-title">Identity &amp; Access Matrix</div>
                    <div className="iam-overview">
                        <div className="iam-callouts">
                            <div className="iam-callout">
                                <strong>Eric</strong>
                                <span>Super Admin — full control over platform settings, billing, support, and access.</span>
                            </div>
                            <div className="iam-callout">
                                <strong>Leon</strong>
                                <span>Super Admin — same top-level access as Eric for redundancy.</span>
                            </div>
                            <div className="iam-callout">
                                <strong>Santhini</strong>
                                <span>QA — release checks, feature flags, and validation tooling.</span>
                            </div>
                            <div className="iam-callout">
                                <strong>Ronni / Providant Consulting</strong>
                                <span>Project Manager — operational oversight, content, team coordination, and support.</span>
                            </div>
                        </div>
                        <div className="iam-role-grid">
                            {ADMIN_ROLE_MATRIX.map((entry) => (
                                <div key={entry.role} className="iam-role-card">
                                    <div className="iam-role-name">{entry.label}</div>
                                    <div className="iam-role-desc">{entry.description}</div>
                                    <div className="iam-perm-list">
                                        {entry.permissions.map((permission) => (
                                            <span key={permission} className="iam-perm-chip">{getPermissionLabel(permission)}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="iam-section-table-wrap">
                        <table className="iam-section-table">
                            <thead>
                                <tr>
                                    <th>Portal Section</th>
                                    <th>Required Permission</th>
                                    <th>Allowed Roles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(ADMIN_SECTION_PERMISSIONS).map(([section, permissions]) => {
                                    const allowedRoles = ADMIN_ROLE_MATRIX
                                        .filter((entry) => permissions.some((permission) => entry.permissions.includes(permission)))
                                        .map((entry) => entry.label);

                                    return (
                                        <tr key={section}>
                                            <td className="iam-section-title">{section.replace(/-/g, ' ')}</td>
                                            <td>
                                                <div className="iam-role-tags">
                                                    {permissions.map((permission) => (
                                                        <span key={permission} className="iam-role-tag">{getPermissionLabel(permission)}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="iam-role-tags">
                                                    {allowedRoles.map((label) => (
                                                        <span key={label} className="iam-role-tag">{label}</span>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Platform Parameters */}
                <div className="adm-card" style={{ marginBottom: 16 }}>
                    <div className="adm-card-title">Platform Parameters</div>
                    {configs.length === 0 && (
                        <p style={{ color: '#555', fontSize: 13 }}>No configuration parameters found.</p>
                    )}
                    {configs.map((config: any) => (
                        <div key={config.key} className="set-param-row">
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="set-param-name">{config.key.replace(/_/g, ' ')}</div>
                                {config.description && <div className="set-param-desc">{config.description}</div>}
                                <div className="set-param-key">{config.key}</div>
                            </div>
                            <div className="set-param-right">
                                <form action={async (formData: FormData) => {
                                    "use server";
                                    const val = formData.get('value');
                                    let parsed: any = val;
                                    if (val === 'true') parsed = true;
                                    else if (val === 'false') parsed = false;
                                    else if (!isNaN(Number(val))) parsed = Number(val);
                                    await updateConfigParam(config.key as any, parsed);
                                }} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {typeof config.value === 'boolean' ? (
                                        <>
                                            <input type="hidden" name="value" value={config.value ? 'false' : 'true'} />
                                            <span className={`set-val-badge ${config.value ? 'on' : 'off'}`}>
                                                {config.value ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </>
                                    ) : (
                                        <input name="value" defaultValue={config.value} className="set-param-input" />
                                    )}
                                    <button type="submit" className="set-btn">
                                        {typeof config.value === 'boolean' ? 'Toggle' : 'Update'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Change History */}
                <div className="adm-card">
                    <div className="adm-card-title">Change History</div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="set-audit-table">
                            <thead>
                                <tr>
                                    <th>Actor</th>
                                    <th>Parameter</th>
                                    <th>Change</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.map((log: any) => (
                                    <tr key={log.id}>
                                        <td style={{ color: '#ccc' }}>{log.actor?.name || 'SYSTEM'}</td>
                                        <td style={{ color: '#f97316' }}>{log.targetId?.replace(/_/g, ' ')}</td>
                                        <td>{JSON.stringify(log.before)} → {JSON.stringify(log.after)}</td>
                                        <td>{new Date(log.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {auditLogs.length === 0 && (
                                    <tr><td colSpan={4} style={{ color: '#555', padding: '16px 12px' }}>No changes logged yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminPortalWrapper>
    );
}
