import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";
import AdminPortalWrapper from "../AdminPortalWrapper";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && isInternalStaff(role));
    if (!isAuthorized) redirect("/admin/login");

    const { data: users } = await supabaseAdmin
        .from('User')
        .select('id, email, name, role, createdAt')
        .order('createdAt', { ascending: false })
        .limit(100);

    const allUsers = users || [];
    const byRole: Record<string, number> = {};
    allUsers.forEach(u => { byRole[u.role] = (byRole[u.role] || 0) + 1; });

    const roleColor: Record<string, string> = {
        ADMIN: '#f97316', PM: '#f97316', OPS: '#f97316',
        MERCHANT: '#fbbf24', DRIVER: '#34d399', CUSTOMER: '#818cf8',
    };

    return (
        <AdminPortalWrapper>
            <style>{`
                .um-summary { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
                .um-badge { background: #141a18; border: 1px solid #1e2420; border-radius: 6px; padding: 10px 16px; }
                .um-badge strong { font-size: 20px; font-weight: 600; color: #fff; display: block; }
                .um-badge span { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.08em; }
                .um-table-wrap { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; overflow-x: auto; }
                .um-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .um-table th { padding: 10px 16px; text-align: left; color: #555; font-weight: 500; border-bottom: 1px solid #1e2420; }
                .um-table td { padding: 10px 16px; color: #aaa; border-bottom: 1px solid #1e2420; }
                .um-table tr:last-child td { border-bottom: none; }
                .um-role-badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 500; }
            `}</style>

            <div className="adm-page-header">
                <h1>Users</h1>
                <p>Last 100 registered accounts · {allUsers.length} shown</p>
            </div>
            <div className="adm-page-body">
                <div className="um-summary">
                    {Object.entries(byRole).sort((a, b) => b[1] - a[1]).map(([r, count]) => (
                        <div key={r} className="um-badge">
                            <strong>{count}</strong>
                            <span>{r}</span>
                        </div>
                    ))}
                </div>
                <div className="um-table-wrap">
                    <table className="um-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allUsers.map(u => (
                                <tr key={u.id}>
                                    <td style={{ color: '#fff' }}>{u.name || '—'}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className="um-role-badge" style={{
                                            background: `${roleColor[u.role] || '#555'}18`,
                                            color: roleColor[u.role] || '#888'
                                        }}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                                </tr>
                            ))}
                            {allUsers.length === 0 && (
                                <tr><td colSpan={4} style={{ color: '#555', padding: '24px 16px' }}>No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminPortalWrapper>
    );
}
