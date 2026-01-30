
import { Pool } from 'pg';
import { config } from 'dotenv';
import dns from 'dns';

// Force IPv4
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

config();
console.log("DB URL:", process.env.DATABASE_URL);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    ssl: {
        rejectUnauthorized: false
    }
});

async function main() {
    try {
        const client = await pool.connect();
        console.log("Connected to pool (IPv4, Loose SSL).");
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
