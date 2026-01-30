
import { Pool } from 'pg';
import { config } from 'dotenv';
import dns from 'dns';

// Force IPv4
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

// Manually construct Direct URL
const password = `TrUst71H${String.fromCharCode(37)}23rLx`;
const connectionString = `postgresql://postgres:${password}@db.fwkfddsiiybznvdrmack.supabase.co:5432/postgres`;

console.log("Testing Direct Connection (IPv4)...");
// console.log(connectionString); // Don't log credentials if possible

const pool = new Pool({
    connectionString: connectionString,
    connectionTimeoutMillis: 5000,
    ssl: true
});

async function main() {
    try {
        const client = await pool.connect();
        console.log("Connected to pool (Direct IPv4).");
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
