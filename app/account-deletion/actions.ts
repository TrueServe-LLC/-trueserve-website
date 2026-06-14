"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";
import { escapeDeletionHtml } from "@/lib/account-deletion";

export type AccountDeletionState = {
    error?: string;
    success?: boolean;
};

export async function requestAccountDeletion(
    _previousState: AccountDeletionState,
    formData: FormData,
): Promise<AccountDeletionState> {
    const submittedEmail = String(formData.get("email") || "").trim().toLowerCase();
    const details = String(formData.get("details") || "").trim().slice(0, 1000);
    const website = String(formData.get("website") || "");

    if (website) return { success: true };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const email = (user?.email || submittedEmail).trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: "Enter the email address associated with your TrueServe account." };
    }

    let role: string | null = null;
    if (user?.id) {
        const { data: profile } = await supabaseAdmin
            .from("User")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();
        role = profile?.role || null;
    }

    const now = new Date().toISOString();
    const { data: request, error } = await supabaseAdmin
        .from("AccountDeletionRequest")
        .insert({
            userId: user?.id || null,
            email,
            role,
            status: user ? "PROCESSING" : "PENDING_VERIFICATION",
            source: user ? "IN_APP" : "PUBLIC_WEB",
            requestedAt: now,
            retentionNotes: "Direct identifiers will be removed within 30 days. Legally required transaction, payout, tax, fraud-prevention, and dispute records may be retained.",
            updatedAt: now,
        })
        .select("id")
        .single();

    if (error) {
        console.error("[AccountDeletion] Request failed:", error.message);
        return { error: "We could not record the request. Email privacy@trueservedelivery.com for assistance." };
    }

    await sendEmail(
        "support@trueserve.delivery",
        "New TrueServe account deletion request",
        `<p><strong>Reference:</strong> ${request.id}</p><p><strong>Account:</strong> ${escapeDeletionHtml(email)}</p><p><strong>Signed in:</strong> ${user ? "Yes" : "No"}</p><p>${escapeDeletionHtml(details || "No additional details provided.")}</p>`,
    );

    return { success: true };
}
