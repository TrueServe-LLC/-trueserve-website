const val = 5.45 * 1.5;
console.log('Value:', val);
console.log('Value * 100:', val * 100);
console.log('Math.round(val * 100):', Math.round(val * 100));
console.log('Math.round((val + Number.EPSILON) * 100):', Math.round((val + Number.EPSILON) * 100));
console.log('Math.round(val * 100) / 100:', Math.round(val * 100) / 100);
