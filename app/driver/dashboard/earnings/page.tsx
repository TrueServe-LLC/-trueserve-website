import { getDriverOrRedirect } from "@/lib/driver-auth";
import { createClient } from "@/lib/supabase/server";
import DriverEarningsClient from "./DriverEarningsClient";

export const dynamic = "force-dynamic";

export default async function DriverEarningsPage() {
    const driver = await getDriverOrRedirect();
    const supabase = await createClient();

    // Fetch Driver's Orders for transactions and chart
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
