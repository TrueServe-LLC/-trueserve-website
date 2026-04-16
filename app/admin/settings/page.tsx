import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff } from "@/lib/rbac";
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
    const isAuthorized = !!adminSession || (isAuth && isInternalStaff(role));
    if (!isAuthorized) redirect("/admin/login");

    const configs = await getConfigs();
    const auditLogs = await getAuditLogs();

    return (
        <AdminPortalWrapper>
            <style>{`
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
