require('dotenv').config({ path: '.env.local' });
console.log("SECRET KEY USED: " + process.env.STRIPE_SECRET_KEY);
