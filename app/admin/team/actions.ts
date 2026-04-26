"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthSession } from "@/app/auth/actions";
import { ADMIN_ROLES, canAccessAdminSection } from "@/lib/rbac";
import { v4 as uuidv4 } from "uuid";
import { ADMIN_EMAILS, getStaffDisplayName, resolveStaffRole } from "@/lib/admin-config";

// 1. Fetch Team Members
export async function getTeamMembers() {
    const { isAuth, role } = await getAuthSession();
    if (!isAuth || !canAccessAdminSection(role, 'team')) return [];

    const [roleResponse, staffResponse] = await Promise.all([
        supabaseAdmin
            .from('User')
            .select('id, name, email, role, phone')
            .in('role', ADMIN_ROLES),
        supabaseAdmin
            .from('User')
            .select('id, name, email, role, phone')
            .in('email', ADMIN_EMAILS),
    ]);

    if (roleResponse.error) {
        console.error("Error fetching team members:", roleResponse.error);
        return [];
    }

    if (staffResponse.error) {
        console.error("Error fetching staff members:", staffResponse.error);
    }

    const combinedMembers = new Map<string, any>();

    [...(roleResponse.data || []), ...(staffResponse.data || [])].forEach((member: any) => {
        if (!member?.email) return;
        const email = member.email.trim().toLowerCase();
        const resolvedRole = resolveStaffRole(email) || member.role || 'READONLY';
        combinedMembers.set(email, {
            ...member,
            email,
            role: resolvedRole,
            name: member.name || getStaffDisplayName(email),
            isDirectoryEntry: false,
        });
    });

    ADMIN_EMAILS.forEach((email) => {
        const normalizedEmail = email.trim().toLowerCase();
        if (combinedMembers.has(normalizedEmail)) return;

        combinedMembers.set(normalizedEmail, {
            id: `directory:${normalizedEmail}`,
            name: getStaffDisplayName(normalizedEmail),
            email: normalizedEmail,
            role: resolveStaffRole(normalizedEmail) || 'READONLY',
            isDirectoryEntry: true,
        });
    });

    return Array.from(combinedMembers.values()).sort((left: any, right: any) => {
        const roleOrder = (value: string) => {
            const index = ADMIN_ROLES.indexOf(value as any);
            return index === -1 ? 99 : index;
        };

        const roleDiff = roleOrder(left.role) - roleOrder(right.role);
        if (roleDiff !== 0) return roleDiff;

        return String(left.name || left.email).localeCompare(String(right.name || right.email));
    });
}

// 2. Invite a missing Admin user that has an Auth account but no Public User account,
// or just create a stub.
export async function inviteTeamMember(formData: FormData) {
    const { isAuth, role: currentRole, userId } = await getAuthSession();
    if (!isAuth || !['ADMIN', 'PM'].includes(currentRole || '')) {
        return { error: 'Only ADMIN or PM users can invite team members.' };
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
    if (!isAuth || !['ADMIN', 'PM'].includes(currentRole || '')) {
        return { error: 'Only ADMIN or PM users can reset passwords.' };
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

// 5. Update Phone Number
export async function updateMemberPhone(userId: string, email: string, phone: string) {
    const { isAuth, role: currentRole, userId: actorId } = await getAuthSession();
    if (!isAuth || !['ADMIN', 'PM'].includes(currentRole || '')) {
        return { error: 'Only ADMIN or PM users can update phone numbers.' };
    }

    const normalized = phone.trim();
    if (normalized && !/^\+?[1-9]\d{6,14}$/.test(normalized.replace(/[\s\-().]/g, ''))) {
        return { error: 'Invalid phone number format. Use E.164 format, e.g. +18005551234' };
    }

    try {
        const { error } = await supabaseAdmin
            .from('User')
            .update({ phone: normalized || null })
            .eq('id', userId);

        if (error) throw error;

        await logTeamAction(actorId!, `Updated phone for ${email}`);
        revalidatePath('/admin/team');
        return { success: `Phone updated for ${email}.` };
    } catch (e: any) {
        return { error: e.message || 'Failed to update phone.' };
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
