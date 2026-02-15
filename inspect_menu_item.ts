
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

async function inspectSchema() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data, error } = await supabase
        .from('MenuItem')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching menu item:', error);
    } else {
        console.log('MenuItem columns:', Object.keys(data[0] || {}));
    }
}

inspectSchema();
