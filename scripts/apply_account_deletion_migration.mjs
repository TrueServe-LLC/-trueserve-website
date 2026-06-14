import { readFileSync } from "node:fs";
import pg from "pg";

if (process.env.VERCEL_ENV !== "production" && process.env.FORCE_ACCOUNT_DELETION_MIGRATION !== "true") {
    console.log("Skipping account deletion migration outside production.");
    process.exit(0);
}

const connectionString =
    process.env.POSTGRES_URL_NON_POOLING
    || process.env.DATABASE_URL
    || process.env.POSTGRES_URL;

if (!connectionString || connectionString.includes("REDACTED")) {
    throw new Error("A production PostgreSQL connection is required for the account deletion migration.");
}

const databaseUrl = new URL(connectionString);
databaseUrl.searchParams.delete("sslmode");
databaseUrl.searchParams.delete("uselibpqcompat");

const client = new pg.Client({
    connectionString: databaseUrl.toString(),
    ssl: { rejectUnauthorized: false },
});

try {
    await client.connect();
    await client.query("BEGIN");
    await client.query(readFileSync("db/account_deletion_requests.sql", "utf8"));
    await client.query("COMMIT");
    console.log("AccountDeletionRequest migration applied.");
} catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
} finally {
    await client.end().catch(() => undefined);
}
