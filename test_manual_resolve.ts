
import { Pool } from 'pg';
import { config } from 'dotenv';
import dns from 'dns';
import util from 'util';

const lookup = util.promisify(dns.lookup);

config();

async function main() {
    try {
        const url = new URL(process.env.DATABASE_URL!);
        console.log("Resolving host:", url.hostname);

        // Force IPv4 lookup
        const { address } = await lookup(url.hostname, { family: 4 });
        console.log("Resolved IPv4:", address);

        // Replace hostname with IP in connection string
        const ipUrl = process.env.DATABASE_URL!.replace(url.hostname, address);

        const pool = new Pool({
            connectionString: ipUrl,
            connectionTimeoutMillis: 10000,
            ssl: { rejectUnauthorized: false } // Required for IP connection
        });

        const client = await pool.connect();
        console.log("Connected to pool (Manual IP).");
        const res = await client.query('SELECT NOW()');
        console.log("Query result:", res.rows[0]);
        client.release();
        await pool.end();
    } catch (e) {
        console.error("Query failed:", e);
    }
}

main();
