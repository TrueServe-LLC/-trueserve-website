import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff, hasPermission } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { updateConfigParam, logout } from "../actions";
import AdminStyles from "@/components/admin/AdminStyles";

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

    let isAuthorized = !!adminSession || (isAuth && isInternalStaff(role));
    if (!isAuthorized) redirect("/admin/login");

    const configs = await getConfigs();
    const auditLogs = await getAuditLogs();

    return (
        <div className="db">
            <AdminStyles />
            {/* Nav */}
            <div className="nav">
                <div className="nav-brand">True <span>SERVE</span></div>
                <div className="nav-links">
                    {hasPermission(role, 'manage_pricing') && <Link href="/admin/pricing" className="nav-link">Pricing</Link>}
                    {hasPermission(role, 'manage_system_settings') && <Link href="/admin/settings" className="nav-link active">Settings</Link>}
                    <Link href="/admin/content" className="nav-link">CMS</Link>
                    <Link href="/admin/team" className="nav-link">Team</Link>
                    <a href="https://app.asana.com/0/1213802368265152/board" target="_blank" rel="noopener noreferrer" className="nav-link alert">● Asana</a>
                    {hasPermission(role, 'view_dashboard') && <Link href="/admin/dashboard" className="nav-link">Dashboard</Link>}
                    <a href="https://lcking992-1774309654202.atlassian.net/servicedesk/customer/portal/1" target="_blank" rel="noopener noreferrer" className="nav-link alert">● Triage Center</a>
                    <form action={async () => { "use server"; await logout(); }}>
                        <button className="nav-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>Log Out</button>
                    </form>
                </div>
            </div>

            <div className="page">
                <div className="page-title">Operational <span>Parameters</span></div>
                <div className="page-sub">Fine-tune global platform constraints and feature rollouts.</div>

                <div className="sec-hd" style={{marginTop: '40px'}}>
                    <div className="sec-title">PLATFORM PARAMETERS</div>
                </div>

                <div className="params-grid">
                    {configs.map((config) => (
                        <div key={config.key} className="param-row">
                            <div className="param-info">
                                <div className="param-name">{config.key.replace(/_/g, ' ')}</div>
                                <div className="param-desc">{config.description}</div>
                                <div style={{marginTop: '6px'}}>
                                    <span style={{fontSize: '9px', fontFamily: 'DM Mono', color: '#e8a230', background: '#e8a23010', padding: '2px 6px', border: '1px solid #e8a23020'}}>{config.key}</span>
                                </div>
                            </div>
                            <div className="param-right">
                                <form action={async (formData: FormData) => {
                                    "use server";
                                    const val = formData.get('value');
                                    let parsedVal: any = val;
                                    if (val === 'true') parsedVal = true;
                                    else if (val === 'false') parsedVal = false;
                                    else if (!isNaN(Number(val))) parsedVal = Number(val);
                                    await updateConfigParam(config.key as any, parsedVal);
                                }} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    {typeof config.value === 'boolean' ? (
                                        <>
                                            <input type="hidden" name="value" value={config.value ? 'false' : 'true'} />
                                            <div className={`param-value ${config.value ? 'enabled' : ''}`} style={{fontSize: '10px', textTransform: 'uppercase'}}>
                                                {config.value ? 'Enabled' : 'Disabled'}
                                            </div>
                                        </>
                                    ) : (
                                        <input 
                                            name="value" 
                                            defaultValue={config.value} 
                                            className="param-value"
                                            style={{width: '80px', outline: 'none'}}
                                        />
                                    )}
                                    <button className="nav-cta" style={{fontSize: '9px', padding: '6px 12px'}}>
                                        {typeof config.value === 'boolean' ? 'Toggle' : 'Update'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="divider" />

                <div className="two-col">
                    <div className="panel" style={{gridColumn: 'span 2'}}>
                        <div className="panel-hd">📜 Change History</div>
                        <div className="audit-table-wrapper" style={{background: '#0c0e13', border: '1px solid #1c1f28'}}>
                            <table className="audit-table">
                                <thead>
                                    <tr>
                                        <th>Actor</th>
                                        <th>Parameter</th>
                                        <th>Value Change</th>
                                        <th>Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td style={{color: '#fff'}}>{log.actor?.name || 'SYSTEM'}</td>
                                            <td style={{color: '#e8a230'}}>{log.targetId.replace(/_/g, ' ')}</td>
                                            <td style={{fontSize: '10px'}}>{JSON.stringify(log.before)} → {JSON.stringify(log.after)}</td>
                                            <td>{new Date(log.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {auditLogs.length === 0 && (
                                        <tr><td colSpan={4} className="empty-panel">No recent changes logged.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
