const basePay = 3.00;
const DISTANCE_RATE = 0.70;
const LONG_DISTANCE_BONUS = 0.35;
const distanceMiles = 3;
const peakMultiplier = 1.5;

let distancePay = distanceMiles * DISTANCE_RATE;
if (distanceMiles > 2) {
    distancePay += (distanceMiles - 2) * LONG_DISTANCE_BONUS;
}

const multiplierSubtotal = (basePay + distancePay) * peakMultiplier;
console.log('distancePay:', distancePay);
console.log('multiplierSubtotal:', multiplierSubtotal);
console.log('Math.round(multiplierSubtotal * 100) / 100:', Math.round(multiplierSubtotal * 100) / 100);
