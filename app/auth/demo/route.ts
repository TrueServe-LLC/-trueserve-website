
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    const cookieStore = await cookies();
    const DEMO_DRIVER_ID = "a18a0115-5238-4e82-a2e1-0020e2c40ba1";

    // Ensure records exist
    const { data: user } = await supabaseAdmin.from('User').select('id').eq('id', DEMO_DRIVER_ID).maybeSingle();
    if (!user) {
        await supabaseAdmin.from('User').insert({
            id: DEMO_DRIVER_ID,
            name: "Demo Driver",
            email: "demo-driver@trueservedelivery.com",
            role: "DRIVER",
            phone: "+15550001234"
        });
    }

    const { data: driver } = await supabaseAdmin.from('Driver').select('id').eq('userId', DEMO_DRIVER_ID).maybeSingle();
    if (!driver) {
        await supabaseAdmin.from('Driver').insert({
            id: uuidv4(),
            userId: DEMO_DRIVER_ID,
            status: 'ONLINE',
            vehicleType: 'CAR',
            vehicleMake: 'TrueServe',
            vehicleModel: 'Eco',
            vehicleColor: 'Black',
            licensePlate: 'DEMO-123'
        });
    }

    cookieStore.set("userId", DEMO_DRIVER_ID, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24
    });

    cookieStore.set("preview_mode", "true", {
        path: "/",
        httpOnly: false,
        secure: false,
        maxAge: 60 * 60 * 12
    });

    return redirect("/driver/dashboard");
}
