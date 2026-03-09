const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function addCols() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();

    try {
        console.log("Adding columns...");
        await client.query(`
      ALTER TABLE "Driver" 
      ADD COLUMN IF NOT EXISTS "photoUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "aboutMe" TEXT;
    `);
        console.log("Success.");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

addCols();
