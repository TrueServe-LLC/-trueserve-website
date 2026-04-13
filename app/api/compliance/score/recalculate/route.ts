import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff } from "@/lib/rbac";
import { isComplianceLayerEnabled } from "@/lib/system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    if (!(await isComplianceLayerEnabled())) {
        return NextResponse.json({ error: "Compliance layer is disabled" }, { status: 404 });
    }

    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const session = await getAuthSession();
    const isAuthorized = session.isAuth && isInternalStaff(session.role);
    const isCron = cronSecret ? authHeader === `Bearer ${cronSecret}` : false;

    if (!isAuthorized && !isCron) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const restaurantId = body.restaurantId as string | undefined;
    const driverId = body.driverId as string | undefined;

    if (restaurantId) {
        const { data, error } = await supabaseAdmin.rpc("recalculate_restaurant_compliance_score", {
            target_restaurant_id: restaurantId,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, scope: "restaurant", result: data });
    }

    if (driverId) {
        const { data, error } = await supabaseAdmin.rpc("recalculate_driver_compliance_score", {
            target_driver_id: driverId,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, scope: "driver", result: data });
    }

    return NextResponse.json({ error: "Provide restaurantId or driverId" }, { status: 400 });
}
