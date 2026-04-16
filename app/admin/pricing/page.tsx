import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff } from "@/lib/rbac";
import { getPricingRules } from "./actions";
import PricingRulesManager from "@/components/admin/PricingRulesManager";
import AdminPortalWrapper from "../AdminPortalWrapper";

export const dynamic = "force-dynamic";

export default async function PricingAdminPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && isInternalStaff(role));
    if (!isAuthorized) redirect("/admin/login");

    const rules = await getPricingRules();

    return (
        <AdminPortalWrapper>
            <div className="adm-page-header">
                <h1>Pricing Rules</h1>
                <p>Manage delivery fees, service charges, and rate configurations</p>
            </div>
            <div className="adm-page-body">
                <PricingRulesManager initialRules={rules} />
            </div>
        </AdminPortalWrapper>
    );
}
