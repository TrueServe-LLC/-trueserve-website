import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { updateInAppContent } from "../actions";
import PolicyCMS from "@/components/admin/PolicyCMS";
import AdminPortalWrapper from "../AdminPortalWrapper";

export const dynamic = "force-dynamic";

async function getPolicies() {
    try {
        const { data } = await supabaseAdmin
            .from('InAppContent')
            .select('*')
            .order('key');
        return data || [];
    } catch {
        return [];
    }
}

export default async function ContentCMSPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && isInternalStaff(role));
    if (!isAuthorized) redirect("/admin/login");

    const policies = await getPolicies();

    return (
        <AdminPortalWrapper>
            <div className="adm-page-header">
                <h1>Content CMS</h1>
                <p>Manage policies, FAQs, legal docs, and in-app content</p>
            </div>
            <div className="adm-page-body">
                <PolicyCMS
                    policies={policies}
                    onSave={async (key, title, content) => {
                        "use server";
                        return await updateInAppContent(key, title, content);
                    }}
                />
            </div>
        </AdminPortalWrapper>
    );
}
