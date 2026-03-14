
import { calculateDriverPay } from '@/lib/payEngine';
import { calculateDistance } from '@/lib/utils';

/**
 * Onboarding Tester Guide:
 * These tests serve as the "Contract" for the TrueServe platform's business logic.
 * Every tester should run these to ensure the core mathematics haven't been broken by updates.
 */

describe('TrueServe Platform - Core Logic Onboarding Tests', () => {

    describe('1. The "Golden Payout" Rule', () => {
        // This test ensures the sample calculation on the homepage ALWAYS matches the code.
        // Rule: Base $3 + 4.2mi @ $0.7/mi ($2.94) + 12m @ $0.25/m ($3.00) = $8.94 (pre-tip)
        // With $6 tip = $14.94
        test('Golden Ratio: 4.2 miles, 12 minutes wait equals $8.94 total (pre-tip)', () => {
            const result = calculateDriverPay(4.2, 12, false, 1.0);
            
            expect(result.basePay).toBe(3.00);
            expect(result.distancePay).toBe(2.94);
            expect(result.timePay).toBe(3.00);
            expect(result.totalPay).toBe(8.94);
        });
    });

    describe('2. Geography Accuracy (The Haversine Test)', () => {
        // Statue of Liberty (40.6892, -74.0445) to Empire State Building (40.7484, -73.9857)
        // Known Distance: ~5.1-5.2 miles
        test('Statue of Liberty to Empire State correctly calculates ~5.1-5.2 miles', () => {
            const distanceStr = calculateDistance(40.6892, -74.0445, 40.7484, -73.9857);
            const distanceVal = parseFloat(distanceStr);
            
            // Allow a small margin of error (0.1 miles) for spherical Earth approximation
            expect(distanceVal).toBeGreaterThanOrEqual(5.0);
            expect(distanceVal).toBeLessThanOrEqual(5.3);
        });

        test('Same point returns 0.0 miles', () => {
            const distanceStr = calculateDistance(40.6892, -74.0445, 40.6892, -74.0445);
            expect(distanceStr).toBe("0.0");
        });
    });

    describe('3. Edge Cases & Resilience (The "Chaos" Test)', () => {
        test('Handles fractional distances with high precision (0.17 miles)', () => {
            const result = calculateDriverPay(0.17, 0, false, 1.0);
            // 0.17 * 0.70 = 0.119. Rounded to 0.12.
            // 3.00 + 0.12 = 3.12
            expect(result.distancePay).toBe(0.12);
            expect(result.totalPay).toBe(3.12);
        });

        test('Massive wait time (120 minutes) calculates correctly without overflow', () => {
            const result = calculateDriverPay(5.0, 120, false, 1.0);
            // Wait: 120 * 0.25 = 30.00
            // Dist: 5 * 0.7 = 3.50
            // Base: 3.00
            // Total: 36.50
            expect(result.timePay).toBe(30.00);
            expect(result.totalPay).toBe(36.50);
        });

        test('Multiplier only effects Base and Distance (Fair Wait Logic)', () => {
            // Rule: TrueServe doesn't multiply wait pay. Wait is hourly-equivalent protection.
            // This ensures drivers are paid fairly for their time regardless of demand surges.
            const standard = calculateDriverPay(3.0, 10, false, 1.0);
            const peak = calculateDriverPay(3.0, 10, false, 2.0); // 2x surge
            
            // Wait pay should be EXACTLY same in both ($2.50)
            expect(standard.timePay).toBe(peak.timePay); 
            expect(peak.timePay).toBe(2.50);
            
            // But distance+base should be doubled
            // (3 + 2.10) * 1 = 5.10
            // (3 + 2.10) * 2 = 10.20
            expect(standard.totalPay - standard.timePay).toBe(5.10);
            expect(peak.totalPay - peak.timePay).toBe(10.20);
        });
    });

    describe('4. Floating Point Precision Sanity', () => {
        test('Rounding ensures two decimal places for financial safety', () => {
            // Testing 1/3 dollar scenario which usually breaks floats
            const result = calculateDriverPay(1.33, 0); 
            // 1.33 * 0.70 = 0.931. Should be 0.93.
            expect(result.distancePay.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
        });
    });
});
