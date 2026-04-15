import { getAuthSession } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import SupportWidget from "@/components/SupportWidget";
import PortalTour from "@/components/PortalTour";
import MerchantDashboardWrapper from "./MerchantDashboardWrapper";

export const dynamic = 'force-dynamic';

export default async function MerchantDashboardLayout({ children }: { children: React.ReactNode }) {
    const { userId } = await getAuthSession();
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;

    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) {
        redirect('/login?role=merchant&next=/merchant/dashboard');
    }

    let restaurant: any = null;

    if (isPreview) {
        restaurant = { name: "Pilot Kitchen" };
    } else {
        const supabase = await createClient();
        const { data: allRestaurants } = await supabase
            .from('Restaurant')
            .select('id, name')
            .eq('ownerId', activeUserId)
            .order('createdAt', { ascending: true });

        restaurant = (allRestaurants || [{}])[0];
    }

    return (
        <>
            {children}
            <SupportWidget role="MERCHANT" />
            <PortalTour portal="MERCHANT" />
        </>
    );
}
