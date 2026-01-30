
import { Pool } from 'pg';
import { config } from 'dotenv';
config();

console.log("DB URL:", process.env.DATABASE_URL);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    try {
        const client = await pool.connect();
        console.log("Connected to pool.");
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
