import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
    const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: users, error } = await s.from('User').select('id, email, name, role').order('createdAt', { ascending: false }).limit(5);
    if (error) {
        console.error(error);
        return;
    }
    console.log('Recent Users:', users);
}
run();
