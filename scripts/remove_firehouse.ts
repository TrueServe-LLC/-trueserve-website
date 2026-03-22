
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
 * QA TEST SCRIPT: remove_firehouse.ts
 * 
 * PURPOSE: 
 * Utility to cleanly delete the "Fayetteville Firehouse BBQ" restaurant 
 * and its menu items. Use this to reset Fayetteville to a clean state 
 * before testing new regional onboarding.
 * 
 * HOW TO RUN:
 * `npx ts-node scripts/remove_firehouse.ts`
 * 
 * VERIFICATION:
 * 1. Confirm script output says "Successfully removed Fayetteville Firehouse BBQ".
 * 2. Verify restaurant no longer appears in the 'Restaurant' table in Supabase.
 */
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanup() {
    console.log("Removing Fayetteville Firehouse BBQ...")
    
    // Find the restaurant first to get its ID
    const { data: restaurant, error: findError } = await supabase
        .from('Restaurant')
        .select('id')
        .ilike('name', '%Fayetteville Firehouse BBQ%')
        .single()

    if (findError || !restaurant) {
        console.log('Restaurant not found or already deleted.')
        return
    }

    const { error: menuError } = await supabase
        .from('MenuItem')
        .delete()
        .eq('restaurantId', restaurant.id)

    if (menuError) {
        console.error('Error deleting menu items:', menuError)
    }

    const { error: restError } = await supabase
        .from('Restaurant')
        .delete()
        .eq('id', restaurant.id)

    if (restError) {
        console.error('Error deleting restaurant:', restError)
    } else {
        console.log('✅ Successfully removed Fayetteville Firehouse BBQ.')
    }
}

cleanup()
