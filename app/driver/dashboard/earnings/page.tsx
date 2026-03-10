import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DriverEarningsClient from "./DriverEarningsClient";

export const dynamic = "force-dynamic";

export default async function DriverEarningsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/driver/login");
    }

    // 1. Fetch Driver Profile
    const { data: driver } = await supabase
        .from('Driver')
        .select('*')
        .eq('userId', user.id)
        .single();

    if (!driver) {
        redirect("/driver/dashboard/account");
    }

    // 2. Fetch Driver's Orders for transactions and chart
    const { data: orders } = await supabase
        .from('Order')
        .select(`
            *,
            restaurant:Restaurant(name)
        `)
        .eq('driverId', driver.id)
        .order('createdAt', { ascending: false });

    return (
        <DriverEarningsClient
            driver={driver}
            orders={orders || []}
        />
    );
}
