export const ADMIN_EMAILS = [
    "lcking992@gmail.com",
    "leonking@trueservedelivery.com",
    "leon@trueservedelivery.com",
    "admin@true-serve.com",
    "eric.mcduffie@thetieredconsulting.com",
    "ericmcduffie7@gmail.com"
];

export const isStaffEmail = (email?: string) => {
    if (!email) return false;
    const lowerEmail = email.toLowerCase();
    return ADMIN_EMAILS.includes(lowerEmail) || 
           lowerEmail.endsWith("@trueservedelivery.com") ||
           lowerEmail.endsWith("@thetieredconsulting.com") ||
           lowerEmail.endsWith("@true-serve.com");
};
