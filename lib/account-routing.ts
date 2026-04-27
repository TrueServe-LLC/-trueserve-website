import type { AppRole } from "@/lib/rbac";
import { ADMIN_ROLES } from "@/lib/rbac";

export function normalizeRole(role?: string | null): AppRole | undefined {
    if (!role) return undefined;
    return role.toUpperCase() as AppRole;
}

export function isCustomerRole(role?: string | null) {
    return normalizeRole(role) === "CUSTOMER";
}

export function getAccountHomeHref(role?: string | null) {
    const normalizedRole = normalizeRole(role);

    if (!normalizedRole || normalizedRole === "CUSTOMER") {
        return "/user/settings";
    }

    if (normalizedRole === "MERCHANT") {
        return "/merchant/dashboard";
    }

    if (normalizedRole === "DRIVER") {
        return "/driver/dashboard";
    }

    if (ADMIN_ROLES.includes(normalizedRole)) {
        return "/admin/dashboard";
    }

    return "/user/settings";
}
