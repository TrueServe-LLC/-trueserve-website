import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { canAccessAdminSection } from "@/lib/rbac";
import { getLiveChats } from "../live-chats/actions";
import LiveChatDashboard from "@/components/admin/LiveChatDashboard";
import AdminPortalWrapper from "../AdminPortalWrapper";

export const dynamic = "force-dynamic";

export default async function SupportAdminPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && canAccessAdminSection(role, 'support'));

    if (!isAuthorized) redirect("/admin/login");

    const chats = await getLiveChats();
    const urgentChats = chats.filter((chat: any) => chat.status === "HUMAN_REQUIRED").length;

    return (
        <AdminPortalWrapper role={role}>
            <div className="adm-page-header">
                <h1>Support Center</h1>
                <p>Live customer, driver, and merchant support with human escalation</p>
            </div>

            <div className="adm-page-body">
                <div className="adm-card" style={{ marginBottom: 16 }}>
                    <div className="adm-card-title">Support Overview</div>
                    <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                        This is the support command center. It gives the team a quick snapshot of open chats and escalations, so you can review AI conversations, jump in when a user needs a human, and close out resolved issues without digging through the inbox.
                    </p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14, color: '#aaa', fontSize: 12 }}>
                        <span>Active chats: {chats.length}</span>
                        <span>Human required: {urgentChats}</span>
                    </div>
                </div>

                <LiveChatDashboard initialChats={chats} />
            </div>
        </AdminPortalWrapper>
    );
}
