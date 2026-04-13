
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

/**
 * QA TEST SCRIPT: seed_dhans.ts
 *
 * PURPOSE:
 * Seeds the authentic Fayetteville Caribbean merchant "Dhan's Kitchen".
 * This includes high-res menu images and specific Trinidadian
 * categories (Vegan, Doubles, Curry Platters).
 * Creates a real Supabase Auth account for login.
 *
 * HOW TO RUN:
 * `npx ts-node scripts/seed_dhans.ts`
 *
 * LOGIN CREDENTIALS:
 * Email: dhanskitchen@trueserve.test
 * Password: DhansKitchen2026!
 *
 * VERIFICATION:
 * 1. Go to /merchant/login and sign in with above credentials
 * 2. Navigate to the merchant dashboard and storefront
 * 3. Search for "Dhan's Kitchen" in the customer app
 * 4. Verify all 23 items appear with their high-res images (e.g. Doubles, Jerk Chicken).
 */
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function addDhansKitchen() {
    console.log("Adding Dhan's Kitchen to Fayetteville...")
    const now = new Date().toISOString()
    const merchantEmail = 'dhanskitchen@trueserve.test'
    const merchantPassword = 'DhansKitchen2026!'

    // 1. Create or Update Supabase Auth Account
    let merchantId = ''
    const { data: { users: existingAuthUsers } } = await supabaseAdmin.auth.admin.listUsers()
    const existingAuthUser = existingAuthUsers.find(u => u.email?.toLowerCase() === merchantEmail.toLowerCase())

    if (existingAuthUser) {
        merchantId = existingAuthUser.id
        console.log('✅ Auth account exists for:', merchantEmail)
        // Update password in case it changed
        await supabaseAdmin.auth.admin.updateUserById(existingAuthUser.id, {
            password: merchantPassword,
            email_confirm: true,
            user_metadata: {
                displayName: 'Dhan Griffin',
                role: 'MERCHANT'
            }
        })
        console.log('   Password updated.')
    } else {
        // Create new auth account
        const { data: { user: newAuthUser }, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: merchantEmail,
            password: merchantPassword,
            email_confirm: true,
            user_metadata: {
                displayName: 'Dhan Griffin',
                role: 'MERCHANT'
            }
        })
        if (authError) {
            console.error('❌ Auth creation error:', authError)
            return
        }
        merchantId = newAuthUser!.id
        console.log('✅ Auth account created:', merchantEmail)
    }

    // 2. Create or Update User Table Record
    const { data: existingUser } = await supabaseAdmin
        .from('User')
        .select('id')
        .eq('id', merchantId)
        .single()

    if (existingUser) {
        console.log('✅ User record exists:', merchantId)
    } else {
        const { error: userError } = await supabaseAdmin.from('User').insert({
            id: merchantId,
            name: 'Dhan Griffin',
            email: merchantEmail,
            phone: '+19102638591',
            role: 'MERCHANT',
            address: '432 Chatham St, Fayetteville, NC 28301',
            createdAt: now,
            updatedAt: now
        })
        if (userError) {
            console.error('❌ User table creation error:', userError)
            return
        }
        console.log('✅ User record created.')
    }

    // 3. Find or Create Restaurant
    let restaurantId = ''
    const { data: existingRest } = await supabaseAdmin
        .from('Restaurant')
        .select('id')
        .eq('name', "Dhan's Kitchen")
        .single()

    if (existingRest) {
        restaurantId = existingRest.id
        console.log('✅ Updating existing restaurant:', restaurantId)
    } else {
        restaurantId = uuidv4()
    }

    const { error: restError } = await supabaseAdmin.from('Restaurant').upsert({
        id: restaurantId,
        name: "Dhan's Kitchen",
        address: '432 Chatham St',
        city: 'Fayetteville',
        state: 'NC',
        lat: 35.0503,
        lng: -78.8781,
        description: 'Authentic Caribbean Flavor from the Islands. Specialize in Trinidadian street food, doubles, and hearty curry platters.',
        imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/oLPcuUuBPIjZ4ry4f88rjg/o.jpg', // High-res Jerk Chicken as cover
        ownerId: merchantId,
        visibility: 'VISIBLE',
        isMock: false,
        openTime: '11:00:00',
        closeTime: '20:00:00',
        updatedAt: now
    })

    if (restError) {
        console.error('❌ Restaurant upsert error:', restError)
        return
    }
    console.log('✅ Restaurant profile set.')

    // 4. Menu Items
    const menuItems = [
        // Combo Meals
        { name: "Veggie Combo", price: 13.99, description: "All combos served with Rice & Beans, White Rice, or Roti. Includes two sides.", imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/d_rlrAXrGbFE6xS_3n2fYA/o.jpg' },
        { name: "Curry Chicken Combo", price: 15.99, description: "Authentic curry chicken with your choice of sides.", imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/AVsIbsfpQb0ulnLRSSGDlQ/o.jpg' },
        { name: "Brown Stew Chicken Combo", price: 15.99, description: "Slow-cooked stew chicken in a rich brown gravy.", imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/oLPcuUuBPIjZ4ry4f88rjg/o.jpg' },
        { name: "Jerk Chicken Combo", price: 15.99, description: "Spicy grilled jerk chicken with island spices.", imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/oLPcuUuBPIjZ4ry4f88rjg/o.jpg' },
        { name: "Jerk Ribs Combo", price: 18.99, description: "Tender pork ribs with smoky jerk seasoning.", imageUrl: null },
        { name: "Curry Shrimp Combo", price: 18.99, description: "Savory shrimp in a rich curry sauce.", imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/pQoLPcuUuBPIjZ4ry4f88rjg/o.jpg' },
        { name: "Stewed Oxtails Combo", price: 19.99, description: "Rich, fall-off-the-bone stewed oxtails.", imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/AVsIbsfpQb0ulnLRSSGDlQ/o.jpg' },
        { name: "Curry Goat Combo", price: 21.99, description: "Tender goat meat slow-cooked in traditional curry.", imageUrl: null },
        { name: "Mrs. Griffin 'All veggie' Sampler", price: 22.99, description: "A massive sampler of all our vegan and veggie favorites.", imageUrl: null },
        { name: "Mr. Griffin 'All meats' Sampler", price: 26.99, description: "The ultimate carnivore sampler.", imageUrl: null },

        // Non-Vegan Items
        { name: "Doubles with Chicken", price: 4.99, description: "Trinidadian doubles topped with curried chicken.", imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/gSNbwEK1MOiRTPz1EmuhoQ/o.jpg' },
        { name: "Bake & Saltfish", price: 10.99, description: "Fried dough topped with savory saltfish.", imageUrl: null },
        { name: "Macaroni Pie", price: 4.50, description: "Baked cheesy macaroni, a Caribbean staple.", imageUrl: null },

        // Vegan Items
        { name: "Doubles (Vegan)", price: 3.50, description: "Traditional curried chickpeas between two fried flatbreads.", imageUrl: 'https://s3-media0.fl.yelpcdn.com/bphoto/gSNbwEK1MOiRTPz1EmuhoQ/o.jpg' },
        { name: "Dhalpuri Roti (1)", price: 5.00, description: "Single dhalpuri roti skin." },
        { name: "Buss-Up-Shot Roti (1)", price: 5.00, description: "Single paratha roti skin." },
        { name: "Fried Sweet Plantains", price: 3.99, description: "Perfectly ripened, sweet fried plantains." },
        { name: "Curry Mango", price: 5.99, description: "Spicy and sweet curried green mango." },

        // Sweets
        { name: "Currants Roll", price: 3.99, description: "Sweet pastry filled with currants." },
        { name: "Cassava Pone", price: 4.50, description: "Dense, sweet cassava cake." },

        // Beverages
        { name: "Sorrel", price: 4.50, description: "Traditional hibiscus-based beverage." },
        { name: "Peanut Punch", price: 4.50, description: "Creamy, nutty Caribbean punch." },
        { name: "Shandy Carib", price: 3.99, description: "Light beer shandy in various flavors." }
    ]

    // Clear existing menu items first for clean re-seed
    await supabaseAdmin.from('MenuItem').delete().eq('restaurantId', restaurantId)

    const fullMenuItems = menuItems.map(item => ({
        id: uuidv4(),
        restaurantId: restaurantId,
        name: item.name,
        price: item.price,
        description: item.description,
        imageUrl: item.imageUrl,
        status: 'APPROVED',
        inventory: 100,
        createdAt: now,
        updatedAt: now
    }))

    const { error: menuError } = await supabaseAdmin.from('MenuItem').insert(fullMenuItems)
    if (menuError) {
        console.error('❌ Menu items insertion error:', menuError)
    } else {
        console.log('✅ Full menu seeded (23 items).')
    }

    console.log('\n🎉 Dhan\'s Kitchen is ready to login!')
    console.log('   Email: dhanskitchen@trueserve.test')
    console.log('   Password: DhansKitchen2026!')
    console.log('   URL: http://localhost:3000/merchant/login')
}

addDhansKitchen()
