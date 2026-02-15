import { calculateDriverPay } from '@/lib/payEngine';

describe('Driver Pay Engine - Business Logic Validation', () => {

    test('1.1 Standard Order - Under 2 miles, No wait', () => {
        // Distance: 1.5 miles, no wait, no peak, single order
        // Base $3, Distance: 1.5 * $0.70 = $1.05. Total = $4.05
        const result = calculateDriverPay(1.5, 0, false, 1.0);
        expect(result.totalPay).toBe(4.05);
        expect(result.distancePay).toBe(1.05);
    });

    test('1.2 Standard Order - Over 2 Miles', () => {
        // Distance: 5 miles, no wait, no peak, single order
        // Base: $3
        // first 2 miles: 2 * $0.70 = $1.40
        // remaining 3 miles: 3 * ($0.70 + $0.35) = 3 * $1.05 = $3.15
        // Distance Total: $1.40 + $3.15 = $4.55
        // Total: $3 + $4.55 = $7.55
        const result = calculateDriverPay(5, 0, false, 1.0);
        expect(result.distancePay).toBe(4.55);
        expect(result.totalPay).toBe(7.55);
    });

    test('1.3 Wait Time Calculation', () => {
        // Distance: 3 miles, wait time: 18 minutes, no peak
        // Wait: 18 - 10 = 8 minutes eligible
        // Wait Pay: 8 * $0.25 = $2.00
        // Distance: (2 * $0.70) + (1 * $1.05) = $1.40 + $1.05 = $2.45
        // Total: $3 (Base) + $2.45 (Dist) + $2.00 (Wait) = $7.45
        const result = calculateDriverPay(3, 18, false, 1.0);
        expect(result.timePay).toBe(2.00);
        expect(result.distancePay).toBe(2.45);
        expect(result.totalPay).toBe(7.45);
    });

    test('1.4 Batched Order Logic', () => {
        // 2 orders (isBatched = true), 4 miles total
        // Base: $3
        // Distance: (2 * $0.70) + (2 * $1.05) = $1.40 + $2.10 = $3.50
        // Batch Bonus: $2.00
        // Total: $3 + $3.50 + $2 = $8.50
        const result = calculateDriverPay(4, 0, true, 1.0);
        expect(result.batchBonus).toBe(2.00);
        expect(result.distancePay).toBe(3.50);
        expect(result.totalPay).toBe(8.50);
    });

    test('1.5 Peak Boost Multiplier', () => {
        // Distance: 3 miles, peak: 1.5x, no wait
        // Base: $3, Distance: $2.45
        // Subtotal before multiplier: $5.45
        // Total: $5.45 * 1.5 = $8.175 (Rounded to $8.18)
        const result = calculateDriverPay(3, 0, false, 1.5);
        expect(result.totalPay).toBe(8.18);
    });

    test('1.6 Combined Real-World Scenario', () => {
        // 6 miles, 15 minutes wait, 2 orders (batched), 1.3x peak boost
        // Distance: (2 * $0.70) + (4 * $1.05) = $1.40 + $4.20 = $5.60
        // Base: $3
        // Wait: (15 - 10) * $0.25 = $1.25
        // Batch: $2.00
        // Calculation: ((3 + 5.60) * 1.3) + 1.25 + 2.00
        // (8.60 * 1.3) = 11.18
        // 11.18 + 1.25 + 2.00 = $14.43
        const result = calculateDriverPay(6, 15, true, 1.3);
        expect(result.distancePay).toBe(5.60);
        expect(result.timePay).toBe(1.25);
        expect(result.batchBonus).toBe(2.00);
        expect(result.totalPay).toBe(14.43);
    });

});
