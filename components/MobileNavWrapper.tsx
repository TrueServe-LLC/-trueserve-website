import MobileNav from "@/components/MobileNav";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export default async function MobileNavWrapper() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    let role = null;
    if (userId) {
        try {
            const supabase = await createClient();
            const { data } = await supabase.from('User').select('role').eq('id', userId).single();
            if (data) {
                role = data.role;
            }
        } catch (error) {
            console.error("Failed to fetch user role for MobileNav:", error);
        }
    }

    return <MobileNav role={role} />;
}
