
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

/**
 * QA TEST SCRIPT: verify_support_tables.ts
 * 
 * PURPOSE: 
 * Sanity check for the customer/merchant support system. Verifies 
 * that 'SupportTicket' and 'TicketMessage' tables exist and are accessible.
 * 
 * HOW TO RUN:
 * `npx ts-node scripts/verify_support_tables.ts`
 * 
 * VERIFICATION:
 * 1. Output must show "EXISTS ✅" for both SupportTicket and TicketMessage tables.
 */
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifySupportTables() {
    console.log("Verifying SupportTicket and TicketMessage tables...")
    const { data: ticketData, error: ticketError } = await supabase.from('SupportTicket').select('*').limit(1);
    if (ticketError) {
        console.error("SupportTicket Error:", ticketError.message);
    } else {
        console.log("SupportTicket Table: EXISTS ✅");
        console.log("Columns:", Object.keys(ticketData?.[0] || {}));
    }

    const { data: messageData, error: messageError } = await supabase.from('TicketMessage').select('*').limit(1);
    if (messageError) {
        console.error("TicketMessage Error:", messageError.message);
    } else {
        console.log("TicketMessage Table: EXISTS ✅");
        console.log("Columns:", Object.keys(messageData?.[0] || {}));
    }
}

verifySupportTables()
