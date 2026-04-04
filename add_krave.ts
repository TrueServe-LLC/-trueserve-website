
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

const kraveData = {
    name: "Krave 489",
    address: "489 S Herlong Ave",
    city: "Rock Hill",
    state: "SC",
    zip: "29732",
    lat: 34.9454,
    lng: -81.0543,
    phone: "803-558-4100",
    cuisine: "American / Seafood",
    logo: "https://krave489.com/wp-content/uploads/2026/02/logo-krave.png",
    hero: "https://krave489.com/wp-content/uploads/2026/02/A8-2048x1365.jpg",
    email: "manager@krave489.com",
    menu: {
        "Small Plates": [
            { "name": "Seasonal Hummus", "price": 12, "description": "House made hummus served in Breadsmith Bialy" },
            { "name": "Street Corn Ribs", "price": 10, "description": "Chipotle Crema, Cotija cheese, cilantro" },
            { "name": "Burrata", "price": 16, "description": "Frissee lettuce, Roasted Strawberry, Strawberry Lemon Vinaigrette, grilled Sourdough" },
            { "name": "Antipasti Skewers", "price": 14, "description": "Salami, Finocchiona, Capicola mozzarella balls, peperoncini, balsamic glaze" },
            { "name": "Whipped Feta Dip", "price": 12, "description": "cream cheese, feta, garlic, olive oil, lemon juice, roasted tomato, grilled Sourdough" },
            { "name": "Tuna Nacho", "price": 18, "description": "Pan seared tuna, pineapple and tomatillo salsa, avocado mousse, pickled onions, cilantro" },
            { "name": "Wagyu Beef Meatballs", "price": 15, "description": "House made Wagyu beef meatballs, house made red sauce, Lemon Herb Ricotta" },
            { "name": "Scallops", "price": 22, "description": "onion soubise, green apple foam, pistachio brittle" }
        ],
        "Salads": [
            { "name": "Watermelon and feta Salad", "price": 14, "description": "Fresh cut watermelon, marinated Feta, mixed greens, Lemon Poppy Seed Vinaigrette" },
            { "name": "Southern Caesar Salad", "price": 14, "description": "Romaine, house-made Cornbread Croutons, Bacon, Parmesan" },
            { "name": "The Gardenia", "price": 32, "description": "Fresh Mixed Greens, fresh tomatoes, house made croutons, cheddar cheese, shredded carrots, red onions, cucumber" },
            { "name": "Krave Cobb", "price": 18, "description": "Fresh Mixed Greens, Grilled Chicken, Sliced avocado, Fresh tomatoes, Hard Boiled Egg, Blue cheese Crumbles, and your choice of dressing" }
        ],
        "Entrees": [
            { "name": "Pan roasted Chicken", "price": 22, "description": "Pan roasted Chicken, wild mushroom pilaf, Grilled Asparagus, Pan Jus" },
            { "name": "Honey Garlic Salmon", "price": 28, "description": "Blackened salmon, Honey Garlic Glaze, Crispy Brussel sprouts, Charleston Crab Rice" },
            { "name": "House Pork chop", "price": 26, "description": "12 oz pork chop, Smoked Gouda Mac and cheese, Brussels sprouts" },
            { "name": "Lamb Burger", "price": 18, "description": "Whipped Feta, Roasted red pepper, 6 oz Lamb patty, Arugula" },
            { "name": "Steak Fritte", "price": 42, "description": "8oz Filet Mignon, Golden Mash Potato, Peppercorn Cream, Grilled Asparagus" },
            { "name": "Cajun Shrimp Alfredo", "price": 24, "description": "Blackened shrimp, red bell peppers, asparagus garlic, onions, shallots, Cajun Alfredo" },
            { "name": "“Marry Me” Chicken Gnocchi", "price": 22, "description": "Pan roasted chicken, sun-dried tomato pesto cream sauce, spinach, gnocchi" },
            { "name": "Pecan Crusted Catfish", "price": 21, "description": "Panko and Pecan crusted catfish, Twice baked sweet potatoes, sauteed spinach" },
            { "name": "KFC -Krave Fried Chicken", "price": 16, "description": "House breaded chicken, Korean BBQ sauce, house made lime slaw" },
            { "name": "Shrimp Po-Boy", "price": 18, "description": "Calabash Shrimp, Fresh Lettuce, Fresh Tomatoes, Zesty Remoulade" },
            { "name": "Tempura Lobster Roll", "price": 34, "description": "Tempura Battered Lobster, Ginger Miso Aioli, Spicy Mayo" },
            { "name": "Shrimp and Grits", "price": 22, "description": "Grilled Shrimp, Peppers, onions, Bacon, Andouille sausage, stone ground Gouda grits" },
            { "name": "Butternut Squash Risotto", "price": 16, "description": "Butternut Squash, Parmesan Cheese, Sage and Rosemary" },
            { "name": "Lamb Chops", "price": 32, "description": "Pistachio Crusted Lamb, Gremolata, Tzatziki, Grilled Asparagus, Golden mash Potato" }
        ],
        "Seafood Boil": [
            { "name": "Krave Shrimp Boil", "price": 39, "description": "1 lb of Shrimp, Your choice of sausage, corn and potato" },
            { "name": "Krave Snow Crab", "price": 59, "description": "1 lb of Snow Crab, Your Choice of sausage, corn, and potato" },
            { "name": "Krave Lobster Boil", "price": 69, "description": "1 Lobster Tail, ½ lb of shrimp, your choice of sausage, corn and potato" },
            { "name": "Krave Katch", "price": 99, "description": "1 Lobster Tail, ½ lb of shrimp, ½ lb of crab, your choice of sausage, corn, and potato" }
        ],
        "Sides": [
            { "name": "Twice baked sweet potatoes", "price": 8 },
            { "name": "Rosemary Parmesan fries", "price": 6 },
            { "name": "Lime slaw", "price": 3 },
            { "name": "Brussel sprouts", "price": 5 },
            { "name": "Mushroom pilaf", "price": 6 },
            { "name": "Mashed potatoes", "price": 6 },
            { "name": "Asparagus", "price": 5 },
            { "name": "Roasted Vegetable Medley", "price": 5 },
            { "name": "Mac and Cheese", "price": 8 }
        ],
        "Desserts": [
            { "name": "German Chocolate Pecan Pie", "price": 8 },
            { "name": "Seasonal Cobbler", "price": 10 },
            { "name": "Local Bakery Cake", "price": 12 }, // Placeholder for 'Varies'
            { "name": "Bread Pudding", "price": 8 }
        ]
    }
}

async function addKrave() {
    console.log('Adding Krave 489 to production database...')
    const now = new Date().toISOString()

    // 1. Create Merchant User in Auth and public.User
    let merchantId = ''
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: kraveData.email,
        password: 'KraveProductionPassword2026!', // Secure temp password
        email_confirm: true,
        user_metadata: { role: 'MERCHANT' }
    })

    if (authError) {
        console.warn('Auth user might already exist:', authError.message)
        // Try getting existing user
        const { data: existingUser } = await supabase.from('User').select('id').eq('email', kraveData.email).single()
        if (existingUser) merchantId = existingUser.id
    } else if (authUser?.user) {
        merchantId = authUser.user.id
        // Create public record if not sync'd by trigger
        await supabase.from('User').upsert({
            id: merchantId,
            email: kraveData.email,
            name: "Krave 489 Management",
            role: 'MERCHANT',
            updatedAt: now,
            createdAt: now
        })
        console.log('Created auth merchant user:', kraveData.email)
    }

    if (!merchantId) {
        console.error('Could not determine merchant ID')
        return
    }

    // 2. Insert/Update Restaurant
    const { data: existingRest } = await supabase.from('Restaurant').select('id').eq('ownerId', merchantId).single()
    const rId = existingRest?.id || uuidv4()
    
    const { error: rError } = await supabase.from('Restaurant').upsert({
        id: rId,
        name: kraveData.name,
        address: kraveData.address,
        city: kraveData.city,
        state: kraveData.state,
        lat: kraveData.lat,
        lng: kraveData.lng,
        description: `Experience the finest ${kraveData.cuisine} in Rock Hill. Phone: ${kraveData.phone}`,
        imageUrl: kraveData.hero,
        ownerId: merchantId,
        updatedAt: now,
        createdAt: now
    })

    if (rError) {
        console.error('Error creating restaurant:', rError)
        return
    }
    console.log('Created restaurant:', kraveData.name)

    // 3. Insert Menu Items
    const menuItems: any[] = []
    for (const [category, items] of Object.entries(kraveData.menu)) {
        for (const item of items) {
            menuItems.push({
                id: uuidv4(),
                restaurantId: rId,
                name: (item as any).name,
                description: (item as any).description || '',
                price: (item as any).price || 0,
                status: 'APPROVED',
                updatedAt: now,
                createdAt: now
            })
        }
    }

    const { error: mError } = await supabase.from('MenuItem').insert(menuItems)
    if (mError) {
        console.error('Error creating menu items:', mError)
    } else {
        console.log(`Added ${menuItems.length} menu items.`)
    }

    console.log('Krave 489 setup complete.')
}

addKrave()
