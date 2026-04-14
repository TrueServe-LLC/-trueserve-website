import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * TEMPORARY: Set user role to ADMIN
 * This is a temporary endpoint for setup purposes
 * Should be removed after initial admin setup
 */
export async function POST(request: Request) {
    try {
        const { email, role } = await request.json();

        if (!email) {
            return Response.json({ error: "Email required" }, { status: 400 });
        }

        // Update user role
        const { data, error } = await supabaseAdmin
            .from("User")
            .update({ role: role || "ADMIN" })
            .eq("email", email)
            .select();

        if (error) {
            throw error;
        }

        return Response.json({
            success: true,
            message: `Updated ${email} to role ${role || "ADMIN"}`,
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
