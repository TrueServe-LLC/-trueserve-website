
/**
 * Normalizes a phone number to E.164 (+1XXXXXXXXXX) for US compatibility.
 */
export function normalizePhoneNumber(phone: string): string {
    if (!phone) return "";
    
    // Remove all non-digits, keeping the + if it's already there
    const hasPlus = phone.startsWith('+');
    const cleaned = phone.replace(/[^\d]/g, '');
    
    if (cleaned.length === 0) return "";
    
    // 10 digits (no prefix)
    if (cleaned.length === 10) {
        return `+1${cleaned}`;
    }
    
    // 11 digits (starts with 1)
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return `+${cleaned}`;
    }
    
    // Already has +1 prefix and digits
    if (hasPlus && cleaned.startsWith('1')) {
        return `+${cleaned}`;
    }

    // Default to +1 if just general digits
    return `+1${cleaned}`;
}
