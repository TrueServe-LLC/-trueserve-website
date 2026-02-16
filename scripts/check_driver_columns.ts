
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkColumns() {
    const { data, error } = await supabase
        .from('Driver')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error selecting from Driver:', error);
    } else {
        console.log('Columns in Driver table:', Object.keys(data[0] || {}));
    }
}

checkColumns();
