import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";

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

    return (
        <>
            <style>{`
                .um-page { min-height: 100vh; background: #0a0c09; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #e0e0e0; padding: 24px; }
                .um-title { font-size: 22px; font-weight: 600; color: #fff; margin-bottom: 4px; }
                .um-sub { font-size: 13px; color: #666; margin-bottom: 24px; }
                .um-summary { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
                .um-badge { background: #141a18; border: 1px solid #1e2420; border-radius: 6px; padding: 10px 16px; font-size: 13px; color: #ccc; }
                .um-badge strong { color: #fff; font-size: 18px; display: block; }
                .um-table-wrap { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; overflow: auto; }
                .um-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .um-table th { padding: 10px 16px; text-align: left; color: #666; font-weight: 500; border-bottom: 1px solid #1e2420; }
                .um-table td { padding: 10px 16px; color: #ccc; border-bottom: 1px solid #1e2420; }
                .um-table tr:last-child td { border-bottom: none; }
                .um-role { font-size: 11px; padding: 2px 8px; border-radius: 4px; background: rgba(249,115,22,0.12); color: #f97316; font-weight: 500; }
                .um-role.customer { background: rgba(99,102,241,0.12); color: #818cf8; }
                .um-role.driver { background: rgba(16,185,129,0.12); color: #34d399; }
                .um-role.merchant { background: rgba(245,158,11,0.12); color: #fbbf24; }
            `}</style>
            <div className="um-page">
                <div className="um-title">User Management</div>
                <div className="um-sub">Last 100 registered users · {allUsers.length} shown</div>
                <div className="um-summary">
                    {Object.entries(byRole).map(([r, count]) => (
                        <div key={r} className="um-badge">
                            <strong>{count}</strong>{r}
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
                                        <span className={`um-role ${u.role?.toLowerCase()}`}>
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
        </>
    );
}
