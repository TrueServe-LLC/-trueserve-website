import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff } from "@/lib/rbac";
import { getTeamMembers } from "./actions";

export default async function TeamManagementPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();

    let isAuthorized = !!adminSession || (isAuth && isInternalStaff(role));

    if (!isAuthorized || role !== 'ADMIN') {
        redirect("/admin/dashboard");
    }

    const teamMembers = await getTeamMembers();

    return (
        <div className="min-h-screen">
            <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 px-6 py-4">
                <div className="container flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold tracking-tighter">
                        True<span className="text-gradient">Serve</span> Admin
                    </Link>
                    <div className="flex gap-4 items-center">
                        <Link href="/admin/dashboard" className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Control Center</Link>
                        <Link href="/admin/pricing" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Pricing</Link>
                        <Link href="/admin/settings" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Settings</Link>
                        <Link href="/admin/team" className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary pb-1">Team</Link>
                        <form action={async () => {
                            "use server";
                            const { logout } = await import("@/app/auth/actions");
                            await logout();
                        }}>
                            <button type="submit" className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors ml-4 border-l border-white/10 pl-4">Disconnect</button>
                        </form>
                    </div>
                </div>
            </nav>

            <main className="container py-8 space-y-8 animate-fade-in">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Identity & Access</h1>
                        <p className="text-slate-400 text-sm mt-1">Manage admin roles, API permissions, and internal team members.</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 border border-white/5 rounded-2xl w-full max-w-md mt-6 md:mt-0">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Invite New Team Member</h3>
                        <form action={async (formData) => { 
                            "use server"; 
                            const { inviteTeamMember } = await import("./actions"); 
                            await inviteTeamMember(formData); 
                        }} className="flex gap-2">
                            <input required name="email" type="email" placeholder="Employee Email..." className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                            <select required name="role" className="bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors cursor-pointer w-[110px]">
                                <option value="OPS">Ops</option>
                                <option value="SUPPORT">Support</option>
                                <option value="FINANCE">Finance</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                            <button type="submit" className="bg-primary text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded hover:brightness-110 transition-all">Invite</button>
                        </form>
                    </div>
                </div>

                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                            Active Staff ({teamMembers.length})
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-800/50 text-slate-300">
                                <tr>
                                    <th className="px-6 py-4 font-semibold rounded-tl-lg">Member</th>
                                    <th className="px-6 py-4 font-semibold">Role</th>
                                    <th className="px-6 py-4 font-semibold">Joined</th>
                                    <th className="px-6 py-4 font-semibold rounded-tr-lg text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {teamMembers.map((member: any) => (
                                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-white">{member.name || 'Unknown'}</div>
                                            <div className="text-slate-400 text-xs">{member.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${
                                                member.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                member.role === 'SUPPORT' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                            }`}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                            N/A
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <form action={async () => {
                                                    "use server";
                                                    const { sendPasswordReset } = await import("./actions");
                                                    await sendPasswordReset(member.id, member.email);
                                                }}>
                                                    <button type="submit" className="text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded text-xs transition-colors border border-slate-700">
                                                        Reset Password
                                                    </button>
                                                </form>
                                                {member.role !== 'ADMIN' && (
                                                    <form action={async () => {
                                                        "use server";
                                                        const { revokeAccess } = await import("./actions");
                                                        await revokeAccess(member.id, member.email);
                                                    }}>
                                                        <button type="submit" className="text-red-400 hover:text-white px-3 py-1 bg-red-950/30 rounded text-xs transition-colors border border-red-900/50">
                                                            Revoke
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {teamMembers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                            No explicit team members found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
