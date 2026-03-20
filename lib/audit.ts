import { supabaseAdmin } from "./supabase-admin";
import { getAuthSession } from "@/app/auth/actions";

export async function logAuditAction({
    action,
    targetId,
    entityType,
    before = null,
    after = null,
    message = ""
}: {
    action: string;
    targetId: string;
    entityType: string;
    before?: any;
    after?: any;
    message?: string;
}) {
    try {
        const { isAuth, userId } = await getAuthSession();
        // If not authenticated via standard session, we might be in a context where userId is provided differently, 
        // but for now we follow the existing pattern.
        const actorId = isAuth ? userId : null;

        const { error } = await supabaseAdmin.from('AuditLog').insert({
            actorId,
            action,
            targetId,
            entityType,
            before,
            after,
            message,
            createdAt: new Date().toISOString()
        });

        if (error) {
            console.error("Audit Log Insert Error:", error);
        }
    } catch (e) {
        console.error("Critical: Failed to log audit action:", e);
    }
}
