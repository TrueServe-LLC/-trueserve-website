
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
if (!process.env.DIRECT_URL) dotenv.config();

async function addPhoneColumn() {
    const client = new Client({
        connectionString: process.env.DIRECT_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database. Adding phone column to User table...');

        // Add phone column if it doesn't exist
        await client.query(`
            ALTER TABLE "User" 
            ADD COLUMN IF NOT EXISTS "phone" TEXT;
        `);

        console.log('✅ Column "phone" successfully added to "User" table.');
    } catch (err: any) {
        console.error('❌ Error updating schema:', err.message);
    } finally {
        await client.end();
    }
}

addPhoneColumn();
