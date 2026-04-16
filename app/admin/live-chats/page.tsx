import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff } from "@/lib/rbac";
import { getLiveChats } from "./actions";
import LiveChatDashboard from "@/components/admin/LiveChatDashboard";
import AdminPortalWrapper from "../AdminPortalWrapper";

export const dynamic = "force-dynamic";

export default async function LiveChatsPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && isInternalStaff(role));
    if (!isAuthorized) redirect("/admin/login");

    const chats = await getLiveChats();

    return (
        <AdminPortalWrapper>
            <div className="adm-page-header">
                <h1>Live Chats</h1>
                <p>Real-time AI interactions and human escalation requests</p>
            </div>
            <div className="adm-page-body">
                <LiveChatDashboard initialChats={chats} />
            </div>
        </AdminPortalWrapper>
    );
}
