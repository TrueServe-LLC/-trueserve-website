import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    console.log("Connected to DB, running migration...");
    try {
        await client.query(`
      ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
    `);
        console.log("Successfully added stripeCustomerId to User table");
    } catch (e) {
        console.error("Migration error:", e);
    } finally {
        await client.end();
    }
}
main();
