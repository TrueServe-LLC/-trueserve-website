
import pkg from 'pg';
const { Client } = pkg;

async function addPhoneColumn() {
    const passwords = ['TrUst71H#rLx', 'TTrUst71H#rLx'];

    for (const pwd of passwords) {
        const client = new Client({
            user: 'postgres',
            host: 'db.fwkfddsiiybznvdrmack.supabase.co',
            database: 'postgres',
            password: pwd,
            port: 5432,
            ssl: { rejectUnauthorized: false }
        });

        try {
            console.log(`Trying password: ${pwd.substring(0, 3)}...`);
            await client.connect();
            console.log('Connected! Adding phone column...');
            await client.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;');
            console.log('✅ Column added.');
            await client.end();
            return;
        } catch (err: any) {
            console.error(`❌ Failed with ${pwd.substring(0, 3)}...: ${err.message}`);
            await client.end().catch(() => { });
        }
    }
}

addPhoneColumn();
