import { getAuthSession } from "@/app/auth/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function getDriverOrRedirect() {
    const isPreview = (await cookies()).get("preview_mode")?.value === "true";

    if (isPreview) {
        return {
            id: "preview-driver",
            userId: "preview-user-id",
            name: "Marcus Rivera",
            currentLat: 35.2271,
            currentLng: -80.8431,
            totalEarnings: 248.50,
            balance: 62.00,
            rating: 4.9,
            navigationApp: "google",
            orders: Array.from({ length: 27 }, (_, i) => ({ id: `order-${i}` })),
            user: { id: "preview-user-id", name: "Marcus Rivera", phone: "+15551234567" },
        } as any;
    }

    const { isAuth, userId } = await getAuthSession();
    if (!isAuth || !userId) {
        redirect("/driver/login");
    }

    const { data: driver } = await supabaseAdmin
        .from('Driver')
        .select(`
            *,
            user:User(*),
            orders:Order(*)
        `)
        .eq('userId', userId)
        .maybeSingle();

    if (!driver && !isPreview) {
        redirect("/driver");
    }

    return driver;
}
