
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
    peakMultiplier: number = 1.0,
    overrides?: {
        basePay?: number;
        mileageRate?: number;
        timeRate?: number;
        batchFee?: number;
    }
): PayCalculation {
    const basePay = overrides?.basePay ?? 3.00;
    const distanceRate = overrides?.mileageRate ?? 0.70;
    const timeRate = overrides?.timeRate ?? 0.25; // Per minute
    const batchFee = overrides?.batchFee ?? 2.00;

    // Distance pay: Flat $0.70/mi
    const distancePay = Math.round(distanceMiles * distanceRate * 100) / 100;

    // Time pay: $0.25/min for every minute
    const timePay = Math.round(waitMinutes * timeRate * 100) / 100;

    // Batch bonus
    const batchBonus = isBatched ? batchFee : 0;

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
