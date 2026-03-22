
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
 * QA TEST SCRIPT: verify_pricing_rule.ts
 * 
 * PURPOSE: 
 * Validates the 'PricingRule' schema in Supabase. Ensures the dynamic 
 * driver payout engine has the required columns (priority, isActive, etc.) 
 * to function.
 * 
 * HOW TO RUN:
 * `npx ts-node scripts/verify_pricing_rule.ts`
 * 
 * VERIFICATION:
 * 1. Log should print "PricingRule Columns: [id, basePay, mileageRate, ...]"
 * 2. Ensure NO errors are thrown (missing tables/wrong keys).
 */
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkPricingRuleTable() {
    console.log("Checking PricingRule table columns...")
    const { data, error } = await supabase.from('PricingRule').select('*').limit(1);
    if (error) {
        console.error("Error fetching PricingRule:", error.message);
        return;
    }
    console.log("PricingRule Columns:", Object.keys(data?.[0] || {}));
}

checkPricingRuleTable()
