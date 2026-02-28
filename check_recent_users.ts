import { createClient } from '@supabase/supabase-js';
import { logger } from './lib/logger';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
    const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: users, error } = await s.from('User').select('id, email, name, role').order('createdAt', { ascending: false }).limit(5);
    if (error) {
        logger.error({ err: error }, 'Error fetching recent users');
        return;
    }
    logger.info({ count: users?.length, users }, 'Recent Users');
}
run();
