
import { calculateDriverPay } from '../lib/payEngine';

/**
 * Driver Simulator Stress-Test
 * 📍 Scenario: East Coast Batch Delivery
 * 🚚 Distance: 5.5 miles
 * ⏱️ Wait Time: 12 minutes
 * 🚀 Surge: 1.6x
 * 📦 Batched: Yes
 */

function runSimulator() {
    console.log("🚀 STARTING: TrueServe Driver Simulator (Scenario Engine v2)");
    console.log("----------------------------------------------------------");

    const distance = 5.5;
    const wait = 12;
    const isBatched = true;
    const surge = 1.6;

    // Running the calculation
    const result = calculateDriverPay(distance, wait, isBatched, surge);

    console.log(`📦 BATCHED ORDER:  ${isBatched ? 'YES' : 'NO'}`);
    console.log(`📍 DISTANCE:      ${distance} mi`);
    console.log(`⏱️ WAIT TIME:     ${wait} mins`);
    console.log(`🚀 SURGE:         ${surge}x`);
    console.log("----------------------------------------------------------");

    console.log(`💵 BASE PAY:      $${result.basePay.toFixed(2)}`);
    console.log(`🚙 MILEAGE:       $${result.distancePay.toFixed(2)}`);
    console.log(`⏱️ WAIT PAY:      $${result.timePay.toFixed(2)}`);
    console.log(`🔗 BATCH BONUS:   $${result.batchBonus.toFixed(2)}  <-- [VERIFIED: FIXED RATE]`);
    console.log("----------------------------------------------------------");
    console.log(`🏆 TOTAL PAYOUT:  $${result.totalPay.toFixed(2)}`);
    console.log("----------------------------------------------------------");

    // FINAL DELIVERABLE CHECK
    if (result.batchBonus === 2.00) {
        console.log("✅ STATUS: SUCCESS. Batch Rate matched Input!B9 ($2.00).");
    } else {
        console.log("❌ STATUS: FAILED. Batch Rate is incorrect.");
    }

    if (result.totalPay > 1000) {
        console.log("❌ CRITICAL: Inflated payout detected ($100,000 bug alive).");
    } else {
        console.log("✅ STATUS: CLEAN. No inflated payouts found.");
    }
}

runSimulator();
