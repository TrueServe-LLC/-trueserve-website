require('dotenv').config({ path: '.env.local' });
console.log("SECRET KEY LENGTH: " + (process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0));
