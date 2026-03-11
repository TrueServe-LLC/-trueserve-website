import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error("No DATABASE_URL found");
        return;
    }
    
    // Add ?sslmode=require if needed
    let connectionString = dbUrl;
    if (!connectionString.includes('sslmode=')) {
        connectionString += '&sslmode=require';
    }

    const client = new Client({ connectionString });
    await client.connect();

    try {
        await client.query(`
            ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "proofOfDeliveryUrl" TEXT;
        `);
        console.log("Successfully added column proofOfDeliveryUrl to Order table.");
    } catch (e) {
        console.error("Failed to add column:", e);
    } finally {
        await client.end();
    }
}
main();
