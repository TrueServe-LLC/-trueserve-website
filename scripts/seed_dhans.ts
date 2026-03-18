
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
        imageUrl: 'https://images.squarespace-cdn.com/content/v1/65b858c7baf8b0029d04970b/1770229040424-64H9DWZX259ZRF8VQ9Y1/image-asset.jpeg',
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
    console.log('Restaurant profile updated.')

    // 3. Menu Items
    const menuItems = [
        // Combo Meals
        { name: "Veggie Combo", price: 13.99, description: "All combos served with Rice & Beans, White Rice, or Roti. Includes two sides." },
        { name: "Curry Chicken Combo", price: 15.99, description: "Authentic curry chicken with your choice of sides." },
        { name: "Brown Stew Chicken Combo", price: 15.99, description: "Slow-cooked stew chicken in a rich brown gravy." },
        { name: "Jerk Chicken Combo", price: 15.99, description: "Spicy grilled jerk chicken with island spices." },
        { name: "Jerk Ribs Combo", price: 18.99, description: "Tender pork ribs with smoky jerk seasoning." },
        { name: "Curry Shrimp Combo", price: 18.99, description: "Savory shrimp in a rich curry sauce." },
        { name: "Stewed Oxtails Combo", price: 19.99, description: "Rich, fall-off-the-bone stewed oxtails." },
        { name: "Curry Goat Combo", price: 21.99, description: "Tender goat meat slow-cooked in traditional curry." },
        { name: "Mrs. Griffin 'All veggie' Sampler", price: 22.99, description: "A massive sampler of all our vegan and veggie favorites." },
        { name: "Mr. Griffin 'All meats' Sampler", price: 26.99, description: "The ultimate carnivore sampler." },

        // Non-Vegan Items
        { name: "Doubles with Chicken", price: 4.99, description: "Trinidadian doubles topped with curried chicken." },
        { name: "Bake & Saltfish", price: 10.99, description: "Fried dough topped with savory saltfish." },
        { name: "Macaroni Pie", price: 4.50, description: "Baked cheesy macaroni, a Caribbean staple." },

        // Vegan Items
        { name: "Doubles (Vegan)", price: 3.50, description: "Traditional curried chickpeas between two fried flatbreads." },
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
