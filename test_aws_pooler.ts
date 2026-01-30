
import { Pool } from 'pg';

// Construct AWS Pooler URL
// User: postgres.fwkfddsiiybznvdrmack
// Pass: TrUst71H%23rLx (Encoded)
// Host: aws-0-us-east-1.pooler.supabase.com
// Port: 6543
// DB: postgres

const percent = String.fromCharCode(37);
const password = `TrUst71H${percent}23rLx`;
const connectionString = `postgresql://postgres.fwkfddsiiybznvdrmack:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`;

console.log("Testing AWS Pooler...");

const pool = new Pool({
    connectionString: connectionString,
    connectionTimeoutMillis: 10000,
});

async function main() {
    try {
        const client = await pool.connect();
        console.log("Connected to AWS Pooler!");
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
