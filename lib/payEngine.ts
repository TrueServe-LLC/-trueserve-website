
/**
 * Transparent Pay Engine
 * Calculates driver pay based on distance, time, and active boosts.
 */

export interface PayCalculation {
    basePay: number;
    distancePay: number;
    timePay: number;
    batchBonus: number;
    peakMultiplier: number;
    totalPay: number;
}

export function calculateDriverPay(
    distanceMiles: number,
    waitMinutes: number = 0,
    isBatched: boolean = false,
    peakMultiplier: number = 1.0
): PayCalculation {
    const BASE_PAY = 3.00;
    const DISTANCE_RATE = 0.70;
    const LONG_DISTANCE_BONUS = 0.35; // added after 2 miles
    const TIME_RATE = 0.25; // after 10 min
    const BATCH_FEE = 2.00;

    const basePay = BASE_PAY;

    // Distance pay: $0.70/mi everywhere, plus $0.35/mi for miles after 2
    let distancePay = distanceMiles * DISTANCE_RATE;
    if (distanceMiles > 2) {
        distancePay += (distanceMiles - 2) * LONG_DISTANCE_BONUS;
    }

    // Time pay: $0.25/min after 10 min wait
    const timePay = Math.max(0, waitMinutes - 10) * TIME_RATE;

    // Batch bonus
    const batchBonus = isBatched ? BATCH_FEE : 0;

    // Apply multiplier to subtotal (usually applied to base + distance)
    const subtotal = (basePay + distancePay + timePay + batchBonus) * peakMultiplier;

    // Floor guarantee: $20/hr active (not fully calculated here without total active time, but we use the formula result)

    return {
        basePay,
        distancePay: Math.round(distancePay * 100) / 100,
        timePay: Math.round(timePay * 100) / 100,
        batchBonus,
        peakMultiplier,
        totalPay: Math.round(subtotal * 100) / 100
    };
}
