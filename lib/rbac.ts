export type AppRole = 'ADMIN' | 'PM' | 'OPS' | 'SUPPORT' | 'FINANCE' | 'READONLY' | 'QA_TESTER' | 'MERCHANT' | 'DRIVER' | 'CUSTOMER';

export const ADMIN_ROLES: AppRole[] = ['ADMIN', 'PM', 'OPS', 'SUPPORT', 'FINANCE', 'READONLY', 'QA_TESTER'];

export type Permission = 
    | 'view_dashboard'
    | 'approve_restaurants'
    | 'manage_menu'
    | 'view_orders'
    | 'intervene_orders'
    | 'approve_drivers'
    | 'manage_payouts'
    | 'manage_pricing'
    | 'view_audit_logs'
    | 'manage_system_settings'
    | 'access_qa_toolbox';

export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
    'ADMIN': [
        'view_dashboard', 'approve_restaurants', 'manage_menu', 
        'view_orders', 'intervene_orders', 'approve_drivers', 
        'manage_payouts', 'manage_pricing', 'view_audit_logs', 
        'manage_system_settings'
    ],
    'PM': [
        'view_dashboard', 'approve_restaurants', 'manage_menu', 
        'view_orders', 'intervene_orders', 'approve_drivers', 
        'manage_payouts', 'manage_pricing', 'view_audit_logs', 
        'manage_system_settings'
    ],
    'OPS': [
        'view_dashboard', 'approve_restaurants', 'manage_menu', 
        'view_orders', 'intervene_orders', 'approve_drivers'
    ],
    'SUPPORT': [
        'view_dashboard', 'view_orders', 'intervene_orders'
    ],
    'FINANCE': [
        'view_dashboard', 'manage_payouts', 'view_orders'
    ],
    'READONLY': [
        'view_dashboard', 'view_orders', 'view_audit_logs'
    ],
    'QA_TESTER': [
        'view_dashboard', 'view_orders', 'intervene_orders', 'access_qa_toolbox', 'manage_menu'
    ],
    'MERCHANT': [], // Handled by separate dashboard logic
    'DRIVER': [],   // Handled by separate dashboard logic
    'CUSTOMER': []  // Handled by separate dashboard logic
};

export function hasPermission(role: string | undefined, permission: Permission): boolean {
    if (!role) return false;
    const permissions = ROLE_PERMISSIONS[role as AppRole] || [];
    return permissions.includes(permission);
}

export function isInternalStaff(role: string | undefined): boolean {
    return ADMIN_ROLES.includes(role as any);
}
