"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff } from "@/lib/rbac";
import { v4 as uuidv4 } from "uuid";

// 1. Fetch Team Members
export async function getTeamMembers() {
    const { isAuth, role } = await getAuthSession();
    if (!isAuth || !isInternalStaff(role)) return [];

    const { data: teamMembers, error } = await supabaseAdmin
        .from('User')
        .select('id, name, email, role')
        .in('role', ['ADMIN', 'OPS', 'SUPPORT', 'FINANCE']);

    if (error) {
        console.error("Error fetching team members:", error);
        return [];
    }

    return teamMembers || [];
}

// 2. Invite a missing Admin user that has an Auth account but no Public User account,
// or just create a stub.
export async function inviteTeamMember(formData: FormData) {
    const { isAuth, role: currentRole, userId } = await getAuthSession();
    if (!isAuth || currentRole !== 'ADMIN') {
        return { error: 'Only ADMIN users can invite team members.' };
    }

    const email = formData.get("email") as string;
    const name = formData.get("name") as string || email.split('@')[0];
    const role = formData.get("role") as string;

    if (!email || !role) return { error: "Email and Role are required" };

    try {
        // Invite via Supabase Admin Auth
        const { data: authData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: { name, role }
        });

        if (inviteError) {
            // Check if user already exists
            if (inviteError.message.includes('already registered')) {
                // Manually upgrade their role in the public table
                const { error: updateError } = await supabaseAdmin
                    .from('User')
                    .update({ role: role })
                    .eq('email', email);

                if (updateError) throw updateError;
                
                // Audit log
                await logTeamAction(userId!, `Updated ${email} to role ${role}`);
                revalidatePath("/admin/team");
                return { success: "User updated to new role." };
            }
            throw inviteError;
        }

        // Add to public User table
        if (authData.user) {
            await supabaseAdmin.from('User').insert({
                id: authData.user.id,
                email: email,
                name: name,
                role: role,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            // Audit
            await logTeamAction(userId!, `Invited ${email} with role ${role}`);
        }

        revalidatePath("/admin/team");
        return { success: `Invitation sent to ${email}` };

    } catch (e: any) {
        console.error("Invite Error:", e.message);
        return { error: e.message || "Failed to invite member." };
    }
}

// 3. Reset Password Link
export async function sendPasswordReset(userIdToReset: string, email: string) {
    const { isAuth, role: currentRole, userId } = await getAuthSession();
    if (!isAuth || currentRole !== 'ADMIN') {
        return { error: 'Only ADMIN users can reset passwords.' };
    }

    try {
        const { error } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: email
        });

        if (error) throw error;

        // Audit log
        await logTeamAction(userId!, `Triggered password reset for ${email}`);

        return { success: `Password reset link sent to ${email}.` };

    } catch (e: any) {
        console.error("Reset Error:", e.message);
        return { error: e.message || "Failed to send reset link." };
    }
}

// 4. Revoke Access
export async function revokeAccess(userIdToRevoke: string, email: string) {
    const { isAuth, role: currentRole, userId } = await getAuthSession();
    if (!isAuth || currentRole !== 'ADMIN') {
        return { error: 'Only ADMIN users can revoke access.' };
    }

    if (userId === userIdToRevoke) {
        return { error: "You cannot revoke your own access." };
    }

    try {
        // Demote in public table
        const { error: demoteError } = await supabaseAdmin
            .from('User')
            .update({ role: 'CUSTOMER' })
            .eq('id', userIdToRevoke);

        if (demoteError) throw demoteError;

        // Disable in Auth (optional: completely delete from Auth if needed, but demoting is safer)
        // await supabaseAdmin.auth.admin.deleteUser(userIdToRevoke);

        // Audit log
        await logTeamAction(userId!, `Revoked admin access for ${email}`);
        revalidatePath("/admin/team");

        return { success: `Access revoked for ${email}.` };
    } catch (e: any) {
        console.error("Revoke Error:", e.message);
        return { error: e.message || "Failed to revoke access." };
    }
}

// Helper: Audit Logging
async function logTeamAction(adminId: string, message: string) {
    await supabaseAdmin.from('AuditLog').insert({
        id: uuidv4(),
        action: "TEAM_MGMT",
        entityType: "User",
        targetId: adminId,
        actorId: adminId,
        message: message,
        createdAt: new Date().toISOString()
    });
}
