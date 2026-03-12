
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.from('MenuItem').select('status').limit(10);
    if (error) {
        console.error(error);
        return;
    }
    const distinctStatuses = [...new Set(data.map(d => d.status))];
    console.log('Unique MenuItem statuses in DB:', distinctStatuses);
}

check();
