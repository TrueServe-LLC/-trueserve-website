import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff } from "@/lib/rbac";
import { getTeamMembers } from "./actions";
import TeamManagerUI from "@/components/admin/TeamManagerUI";

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
            <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 px-4 md:px-6 py-4">
                <div className="container flex justify-between items-center">
                    <Link href="/" className="text-xl md:text-2xl font-bold tracking-tighter shrink-0">
                        True<span className="text-gradient">Serve</span><span className="hidden xs:inline"> Admin</span>
                    </Link>
                    <div className="flex gap-2 md:gap-4 items-center">
                        <Link href="/admin/dashboard" className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Controls</Link>
                        <div className="hidden sm:flex gap-4 items-center px-4 border-l border-white/10">
                            <Link href="/admin/pricing" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Pricing</Link>
                            <Link href="/admin/team" className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary pb-1">Team</Link>
                        </div>
                        <form action={async () => {
                            "use server";
                            const { logout } = await import("@/app/auth/actions");
                            await logout();
                        }}>
                            <button type="submit" className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors ml-2 sm:ml-4 sm:border-l border-white/10 sm:pl-4">Disconnect</button>
                        </form>
                    </div>
                </div>
            </nav>

            <main className="container py-8 animate-fade-in">
                <TeamManagerUI initialMembers={teamMembers} />
            </main>
        </div>
    );
}
