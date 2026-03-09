import pkg from 'pg';
const { Client } = pkg;

async function addDriverProfileFields() {
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
        console.log('Connected! Adding profile fields...');
        await client.query(`
            ALTER TABLE "Driver" 
            ADD COLUMN IF NOT EXISTS "photoUrl" TEXT,
            ADD COLUMN IF NOT EXISTS "aboutMe" TEXT;
        `);
        console.log('✅ Columns added.');
    } catch (err: any) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

addDriverProfileFields();
