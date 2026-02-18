
import pkg from 'pg';
const { Client } = pkg;

async function addPhoneColumn() {
    const client = new Client({
        user: 'postgres',
        host: 'db.fwkfddsiiybznvdrmack.supabase.co',
        database: 'postgres',
        password: 'TrUst71H#rLx',
        port: 5432,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('Connected! Adding phone column...');
        await client.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;');
        console.log('✅ Column added.');
    } catch (err: any) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

addPhoneColumn();
