import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthSession } from "@/app/auth/actions";
import { ADMIN_ROLES } from "@/lib/rbac";

/**
 * Protected admin role update endpoint.
 * Used by authorized admins to assign internal application roles.
 */
export async function POST(request: Request) {
    try {
        const { isAuth, role: authRole } = await getAuthSession();

        if (!isAuth || authRole !== "ADMIN") {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { email, role: requestedRole } = await request.json();

        if (!email) {
            return Response.json({ error: "Email required" }, { status: 400 });
        }

        const nextRole = requestedRole || "ADMIN";

        if (!ADMIN_ROLES.includes(nextRole as any)) {
            return Response.json({ error: "Invalid admin role" }, { status: 400 });
        }

        // Update user role
        const { data, error } = await supabaseAdmin
            .from("User")
            .update({ role: nextRole })
            .eq("email", email)
            .select();

        if (error) {
            throw error;
        }

        return Response.json({
            success: true,
            message: `Updated ${email} to role ${nextRole}`,
            user: data?.[0],
        });
    } catch (error) {
        console.error("Error setting role:", error);
        return Response.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
