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
        // Distance: 5 * $0.70 = $3.50
        // Total: $3 + $3.50 = $6.50
        const result = calculateDriverPay(5, 0, false, 1.0);
        expect(result.distancePay).toBe(3.50);
        expect(result.totalPay).toBe(6.50);
    });

    test('1.3 Wait Time Calculation', () => {
        // Distance: 3 miles, wait time: 18 minutes, no peak
        // Wait Pay: 18 * $0.25 = $4.50
        // Distance: 3 * $0.70 = $2.10
        // Total: $3 (Base) + $2.10 (Dist) + $4.50 (Wait) = $9.60
        const result = calculateDriverPay(3, 18, false, 1.0);
        expect(result.timePay).toBe(4.50);
        expect(result.distancePay).toBe(2.10);
        expect(result.totalPay).toBe(9.60);
    });

    test('1.4 Batched Order Logic', () => {
        // 2 orders (isBatched = true), 4 miles total
        // Base: $3
        // Distance: 4 * $0.70 = $2.80
        // Batch Bonus: $2.00
        // Total: $3 + $2.80 + $2 = $7.80
        const result = calculateDriverPay(4, 0, true, 1.0);
        expect(result.batchBonus).toBe(2.00);
        expect(result.distancePay).toBe(2.80);
        expect(result.totalPay).toBe(7.80);
    });

    test('1.5 Peak Boost Multiplier', () => {
        // Distance: 3 miles, peak: 1.5x, no wait
        // Base: $3, Distance: $2.10
        // Subtotal before multiplier: $5.10
        // Total: $5.10 * 1.5 = $7.65
        const result = calculateDriverPay(3, 0, false, 1.5);
        expect(result.totalPay).toBe(7.65);
    });

    test('1.6 Combined Real-World Scenario', () => {
        // 6 miles, 15 minutes wait, 2 orders (batched), 1.3x peak boost
        // Distance: 6 * $0.70 = $4.20
        // Base: $3
        // Wait: 15 * $0.25 = $3.75
        // Batch: $2.00
        // Calculation: ((3 + 4.20) * 1.3) + 3.75 + 2.00
        // (7.20 * 1.3) = 9.36
        // 9.36 + 3.75 + 2.00 = $15.11
        const result = calculateDriverPay(6, 15, true, 1.3);
        expect(result.distancePay).toBe(4.20);
        expect(result.timePay).toBe(3.75);
        expect(result.batchBonus).toBe(2.00);
        expect(result.totalPay).toBe(15.11);
    });

});
