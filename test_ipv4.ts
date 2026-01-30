
import { Pool } from 'pg';
import { config } from 'dotenv';
import dns from 'dns';

// Force IPv4
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

config();

console.log("DB URL:", process.env.DATABASE_URL);

// Construct connection config manually if string fails, but let's try string first
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 20000,
});

async function main() {
    try {
        const client = await pool.connect();
        console.log("Connected to pool (IPv4).");
        const res = await client.query('SELECT NOW()');
        console.log("Query result:", res.rows[0]);
        client.release();
    } catch (e) {
        console.error("Query failed:", e);
    } finally {
        await pool.end();
    }
}

main();
