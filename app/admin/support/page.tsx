import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff } from "@/lib/rbac";
import { getSupportTickets } from "./actions";
import SupportCenter from "@/components/admin/SupportCenter";
import AdminPortalWrapper from "../AdminPortalWrapper";

export const dynamic = "force-dynamic";

export default async function SupportAdminPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role, userId } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && isInternalStaff(role));
    if (!isAuthorized) redirect("/admin/login");

    const tickets = await getSupportTickets();

    return (
        <AdminPortalWrapper>
            <div className="adm-page-header">
                <h1>Support Center</h1>
                <p>Manage customer tickets, disputes, and refund authorizations</p>
            </div>
            <div className="adm-page-body">
                <SupportCenter initialTickets={tickets} currentAdminId={userId || "system_admin"} />
            </div>
        </AdminPortalWrapper>
    );
}
