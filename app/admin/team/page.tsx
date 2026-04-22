import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { canAccessAdminSection } from "@/lib/rbac";
import { getTeamMembers } from "./actions";
import TeamManagerUI from "@/components/admin/TeamManagerUI";
import AsanaBoard from "@/components/admin/AsanaBoard";
import AdminPortalWrapper from "../AdminPortalWrapper";

export const dynamic = "force-dynamic";

export default async function TeamManagementPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && canAccessAdminSection(role, 'team'));
    if (!isAuthorized) redirect("/admin/login");

    const teamMembers = await getTeamMembers();

    return (
        <AdminPortalWrapper role={role}>
            <div className="adm-page-body" style={{ paddingTop: '28px' }}>
                <TeamManagerUI initialMembers={teamMembers} />
                <div style={{ marginTop: 28 }}>
                    <AsanaBoard />
                </div>
            </div>
        </AdminPortalWrapper>
    );
}
