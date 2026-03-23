export const ADMIN_EMAILS = [
    "lcking992@gmail.com",
    "leonking@trueservedelivery.com",
    "leon@trueservedelivery.com",
    "admin@true-serve.com"
];

export const isStaffEmail = (email?: string) => {
    if (!email) return false;
    const lowerEmail = email.toLowerCase();
    return ADMIN_EMAILS.includes(lowerEmail) || lowerEmail.endsWith("@trueservedelivery.com");
};
