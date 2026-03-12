
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
    const TIME_RATE = 0.75; // Per minute
    const BATCH_FEE = 2.00;

    const basePay = BASE_PAY;

    // Distance pay: $0.70/mi everywhere, plus $0.35/mi for miles after 2
    let distancePay = distanceMiles * DISTANCE_RATE;
    if (distanceMiles > 2) {
        distancePay += (distanceMiles - 2) * LONG_DISTANCE_BONUS;
    }
    // Round distance pay to avoid float precision issues in multiplier
    distancePay = Math.round(distancePay * 100) / 100;

    // Time pay: $0.75/min for every minute
    const timePay = Math.round(waitMinutes * TIME_RATE * 100) / 100;

    // Batch bonus
    const batchBonus = isBatched ? BATCH_FEE : 0;

    // Apply multiplier only to (base + distance) as per logic scenario 1.6
    const multiplierSubtotal = (basePay + distancePay) * peakMultiplier;

    // Final sum includes time pay and batch bonuses (added after multiplier)
    const totalPay = multiplierSubtotal + timePay + batchBonus;

    return {
        basePay,
        distancePay: Math.round(distancePay * 100) / 100,
        timePay: Math.round(timePay * 100) / 100,
        batchBonus,
        peakMultiplier,
        totalPay: Math.round((totalPay + Number.EPSILON) * 100) / 100
    };
}
