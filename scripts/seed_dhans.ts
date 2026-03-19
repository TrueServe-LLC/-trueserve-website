
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

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addDhansKitchen() {
    console.log("Adding Dhan's Kitchen to Fayetteville...")
    const now = new Date().toISOString()
    
    // 1. Find or Create Merchant User
    const merchantEmail = 'dhanskitchen@trueserve.test'
    let merchantId = ''
    
    const { data: existingUser } = await supabase
        .from('User')
        .select('id')
        .eq('email', merchantEmail)
        .single()
        
    if (existingUser) {
        merchantId = existingUser.id
        console.log('Using existing merchant account:', merchantId)
    } else {
        merchantId = uuidv4()
        const { error: userError } = await supabase.from('User').insert({
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
            console.error('User creation error:', userError)
            return
        }
        console.log('New merchant account created.')
    }

    // 2. Find or Create Restaurant
    let restaurantId = ''
    const { data: existingRest } = await supabase
        .from('Restaurant')
        .select('id')
        .eq('name', "Dhan's Kitchen")
        .single()
        
    if (existingRest) {
        restaurantId = existingRest.id
        console.log('Updating existing restaurant:', restaurantId)
    } else {
        restaurantId = uuidv4()
    }

    const { error: restError } = await supabase.from('Restaurant').upsert({
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
        console.error('Restaurant upsert error:', restError)
        return
    }
    console.log('Restaurant profile updated with real cover photo.')

    // 3. Menu Items
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
    await supabase.from('MenuItem').delete().eq('restaurantId', restaurantId)

    const fullMenuItems = menuItems.map(item => ({
        id: uuidv4(),
        restaurantId: restaurantId,
        name: item.name,
        price: item.price,
        description: item.description,
        imageUrl: item.imageUrl, // 👈 KEY FIX: Added missing imageUrl mapping
        status: 'APPROVED',
        inventory: 100,
        createdAt: now,
        updatedAt: now
    }))

    const { error: menuError } = await supabase.from('MenuItem').insert(fullMenuItems)
    if (menuError) {
        console.error('Menu items insertion error:', menuError)
    } else {
        console.log('Full menu re-seeded (23 items).')
    }

    console.log('Seed process finished.')
}

addDhansKitchen()
