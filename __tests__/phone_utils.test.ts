
import { normalizePhoneNumber } from '@/lib/phoneUtils';

/**
 * TDD Example: Phone Normalization
 * Testers use this to ensure our SMS delivery system always gets
 * correctly formatted E.164 phone numbers.
 */

describe('Phone Utility - Normalization (TDD)', () => {

    test('Converts standard 10-digit number to E.164 (+1)', () => {
        expect(normalizePhoneNumber('5554443333')).toBe('+15554443333');
    });

    test('Handles dots, dashes, and parentheses', () => {
        expect(normalizePhoneNumber('(555) 444-3333')).toBe('+15554443333');
        expect(normalizePhoneNumber('555.444.3333')).toBe('+15554443333');
    });

    test('Preserves existing +1 prefix', () => {
        expect(normalizePhoneNumber('+15554443333')).toBe('+15554443333');
    });

    test('Handles 1 prefix without plus', () => {
        expect(normalizePhoneNumber('15554443333')).toBe('+15554443333');
    });

    test('Returns empty string for invalid garbage input', () => {
        expect(normalizePhoneNumber('abcdef')).toBe('');
        expect(normalizePhoneNumber('')).toBe('');
    });
});
