/**
 * fix_dhans_email.ts
 *
 * Fixes Dhan's Kitchen being hidden in the admin Users page on production.
 *
 * ROOT CAUSE:
 * The seed script used email `dhanskitchen@trueserve.test`. The production
 * admin-data mock filter pattern /@.*\.(test|invalid)$/i matches `.test` TLDs
 * and hides the record as if it's a mock/seed account.
 *
 * FIX:
 * Update the email to `info@dhanskitchen.trueserve.delivery` which doesn't
 * match any mock pattern and is clearly a real merchant account.
 *
 * HOW TO RUN:
 * npx tsx scripts/fix_dhans_email.ts
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const OLD_EMAIL = 'dhanskitchen@trueserve.test'
const NEW_EMAIL = 'info@dhanskitchen.trueserve.delivery'

async function fixDhansEmail() {
    console.log("🔧 Fixing Dhan's Kitchen email to pass production mock filter...\n")

    // 1. Find the user in the User table by old email
    const { data: userRecord, error: fetchErr } = await supabase
        .from('User')
        .select('id, email, name')
        .eq('email', OLD_EMAIL)
        .single()

    if (fetchErr || !userRecord) {
        console.error('❌ Could not find User record with email:', OLD_EMAIL, fetchErr?.message)
        process.exit(1)
    }

    console.log('✅ Found User record:', userRecord.id, '-', userRecord.name)

    // 2. Update email in User table
    const { error: userUpdateErr } = await supabase
        .from('User')
        .update({ email: NEW_EMAIL, updatedAt: new Date().toISOString() })
        .eq('id', userRecord.id)

    if (userUpdateErr) {
        console.error('❌ Failed to update User table email:', userUpdateErr.message)
        process.exit(1)
    }
    console.log('✅ User table email updated to:', NEW_EMAIL)

    // 3. Update email in Supabase Auth
    const { error: authUpdateErr } = await supabase.auth.admin.updateUserById(userRecord.id, {
        email: NEW_EMAIL,
        email_confirm: true,
    })

    if (authUpdateErr) {
        console.warn('⚠️  Auth email update failed (may not matter if using password login):', authUpdateErr.message)
    } else {
        console.log('✅ Supabase Auth email updated to:', NEW_EMAIL)
    }

    // 4. Verify restaurant is still linked
    const { data: restaurant } = await supabase
        .from('Restaurant')
        .select('id, name, visibility, ownerId')
        .eq('ownerId', userRecord.id)
        .single()

    if (restaurant) {
        console.log(`✅ Restaurant still linked: "${restaurant.name}" (${restaurant.visibility})`)
    } else {
        console.warn('⚠️  Could not find linked restaurant — check ownerId manually.')
    }

    console.log('\n🎉 Done! Dhan\'s Kitchen will now appear in the admin Users page on production.')
    console.log('   New login email:', NEW_EMAIL)
    console.log('   Password unchanged: DhansKitchen2026!')
}

fixDhansEmail()
