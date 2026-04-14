import { getAuthSession } from "@/app/auth/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";

export async function getMerchantOrRedirect() {
    const { isAuth, userId } = await getAuthSession();
    if (!isAuth || !userId) {
        redirect("/merchant/login");
    }

    const { data: merchant } = await supabaseAdmin
        .from('Merchant')
        .select(`
            *,
            user:User(*),
            drivers:Driver(*),
            complianceInspections:ComplianceInspection(*)
        `)
        .eq('userId', userId)
        .maybeSingle();

    if (!merchant) {
        redirect("/merchant");
    }

    return merchant;
}
