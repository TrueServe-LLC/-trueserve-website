import { supabaseAdmin } from "./supabase-admin";
import { getAuthSession } from "@/app/auth/actions";

export async function logAudit({
    action,
    targetId,
    entityType,
    before = null,
    after = null,
    message = "",
    metadata = null
}: {
    action: string;
    targetId: string;
    entityType: string;
    before?: any;
    after?: any;
    message?: string;
    metadata?: any;
}) {
    try {
        const { isAuth, userId } = await getAuthSession();
        // If not authenticated via standard session, we might be in a context where userId is provided differently, 
        // but for now we follow the existing pattern.
        const actorId = isAuth ? userId : null;

        // In the database, we use 'before' and 'after' JSONB columns.
        // If the caller provides 'metadata' but not 'after', we use 'metadata' as 'after'.
        const finalAfter = after || metadata;

        const { error } = await supabaseAdmin.from('AuditLog').insert({
            actorId,
            action,
            targetId,
            entityType,
            before,
            after: finalAfter,
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

// Keep logAuditAction for backward compatibility with existing code
export const logAuditAction = logAudit;

