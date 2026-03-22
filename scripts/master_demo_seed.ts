
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('ERROR: Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment or .env.local.');
    process.exit(1)
}

/**
 * QA TEST SCRIPT: master_demo_seed.ts
 * 
 * PURPOSE: 
 * The main "Big Bang" seed script for the pilot. It creates a complete 
 * service location (Mount Airy, NC) with multiple verified restaurants, 
 * menu items, and owner accounts. 
 * 
 * HOW TO RUN:
 * `npx ts-node scripts/master_demo_seed.ts`
 * 
 * VERIFICATION:
 * 1. Visit the customer app: confirm restaurants like "13 Bones" and "Snappy Lunch" appear.
 * 2. Verify menu items and prices match the data in the script.
 * 3. Log in as any of the generated owners (info is logged to console).
 */
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
})

const mountAiryData = [
    {
        name: "13 Bones",
        email: "owner_13bones@trueserve.test",
        address: "502 S Andy Griffith Pkwy",
        cuisine: "BBQ / Steak / Seafood",
        lat: 36.4789, lng: -80.6171,
        city: "Mount Airy", state: "NC", zip: "27030",
        menu: [
            { name: "Buffalo Shrimp", description: "Lightly breaded and fried served with ranch or bleu cheese", price: 10.00, category: "Starters" },
            { name: "Fried Mushrooms", description: "Lightly breaded and fried served with ranch or horseradish sauce.", price: 8.00, category: "Starters" },
            { name: "13 Bones Burger", description: "10oz hamburger topped with crispy bacon, cheddar cheese, lettuce, tomato, onion and mayonnaise", price: 14.00, category: "Sandwiches" },
            { name: "Baby Back Ribs (Full Slab)", description: "Our signature ribs basted in KC or Vinegar sauce", price: 26.00, category: "Entrees" },
            { name: "10oz Sirloin", description: "Seasoned and grilled to perfection", price: 17.00, category: "Entrees" }
        ]
    },
    {
        name: "Olympia Family Restaurant",
        email: "owner_olympia@trueserve.test",
        address: "602 Linville Rd",
        cuisine: "American / Greek / Seafood / Breakfast",
        lat: 36.4950, lng: -80.6020,
        city: "Mount Airy", state: "NC", zip: "27030",
        menu: [
            { name: "Eggs Any Style", description: "Two eggs, served with toast or biscuit. Choice of sides.", price: 6.89, category: "Breakfast" },
            { name: "Western Omelet", description: "Ham, onions, peppers, and cheese", price: 9.49, category: "Breakfast" },
            { name: "Rib-eye Steak Sub", description: "Grilled rib-eye with lettuce, tomato, and mayo", price: 11.99, category: "Dinner" },
            { name: "Marinated Chicken Dinner", description: "Two chicken breasts marinated and grilled", price: 11.99, category: "Dinner" },
            { name: "Banana Pudding", description: "Homemade classic banana pudding", price: 3.65, category: "Dessert" }
        ]
    },
    {
        name: "Little Richard's BBQ",
        email: "owner_littlerichards@trueserve.test",
        address: "455 Frederick St",
        cuisine: "BBQ / Southern",
        lat: 36.4957, lng: -80.6105,
        city: "Mount Airy", state: "NC", zip: "27030",
        menu: [
            { name: "LRB Jumbo Smoked Wings (10)", description: "Slow-smoked wings with choice of sauce", price: 17.00, category: "Wings" },
            { name: "Cowgirl Sandwich", description: "Slow-smoked chicken, cole slaw, pickles and Hickory BBQ sauce.", price: 11.50, category: "Sandwiches" },
            { name: "Pimento Cheese Fries", description: "Waffle fries topped with pimento cheese and bacon.", price: 10.00, category: "Starters" },
            { name: "Chopped BBQ Plate", description: "Served with two sides and hushpuppies.", price: 15.00, category: "Plates" },
            { name: "Sliced Brisket Plate", description: "Served with two sides and hushpuppies.", price: 19.00, category: "Plates" }
        ]
    },
    {
        name: "Old North State Winery",
        email: "owner_oldnorthstate@trueserve.test",
        address: "308 North Main St",
        cuisine: "Winery / American / Upscale Casual",
        lat: 36.5009, lng: -80.6086,
        city: "Mount Airy", state: "NC", zip: "27030",
        menu: [
            { name: "ONS Board (Charcuterie)", description: "Three NC Cheeses, Prosciutto, Salami, Olives, Toast Points, Jam", price: 22.00, category: "Shares" },
            { name: "ONS Burger", description: "Winery signature burger with house toppings", price: 17.00, category: "Lunch" },
            { name: "Chicken Salad Croissant", description: "Homemade chicken salad on a buttery croissant", price: 14.00, category: "Lunch" },
            { name: "Fish & Chips", description: "Beer-battered fish served with hand-cut fries", price: 18.00, category: "Lunch" }
        ]
    },
    {
        name: "Barney's Cafe",
        email: "owner_barneys@trueserve.test",
        address: "206 N Main St",
        cuisine: "Diner / Burgers / Sandwiches",
        lat: 36.5011, lng: -80.6080,
        city: "Mount Airy", state: "NC", zip: "27030",
        menu: [
            { name: "Big Country Breakfast", description: "Eggs, choice of meat, grits/gravy/hashbrowns, and biscuit/toast.", price: 12.00, category: "Breakfast" },
            { name: "Mayberry Club", description: "Triple decker with ham, turkey, and bacon.", price: 10.50, category: "Sandwiches" },
            { name: "Pimento Cheese Burger", description: "Burger topped with housemade pimento cheese.", price: 11.00, category: "Sandwiches" },
            { name: "Chicken Salad Sandwich", description: "Classic southern style chicken salad.", price: 9.50, category: "Sandwiches" }
        ]
    },
    {
        name: "Snappy Lunch",
        email: "owner_snappylunch@trueserve.test",
        address: "125 N Main St",
        cuisine: "Breakfast / Lunch / Diner",
        lat: 36.5028, lng: -80.6084,
        city: "Mount Airy", state: "NC", zip: "27030",
        menu: [
            { name: "World-Famous Pork Chop Sandwich", description: "The legendary breaded pork chop sandwich that made Snappy Lunch famous.", price: 8.50, category: "Specials" },
            { name: "Breaded Cheeseburger", description: "Classic lunch counter cheeseburger.", price: 6.50, category: "Lunch" },
            { name: "BLT Sandwich", description: "Bacon, lettuce, and tomato on toasted bread.", price: 5.50, category: "Lunch" },
            { name: "Biscuits and Gravy", description: "Made-from-scratch biscuits topped with hearty gravy.", price: 4.50, category: "Breakfast" }
        ]
    }
];

async function masterSeed() {
    console.log('🚀 INITIALIZING MOUNT AIRY MASTER DEMO SEED...');
    const now = new Date().toISOString();
    const tempPassword = "MountAiry2026!";

    // 1. Service Location
    await supabase.from('ServiceLocation').upsert({
        city: 'Mount Airy', state: 'NC', zipPrefixes: ['27030'],
        isActive: true, updatedAt: now, createdAt: now
    }, { onConflict: 'city' });

    // 2. Demo Customer
    console.log('Creating Demo Customer...');
    const { data: { user: customerUser } } = await supabase.auth.admin.createUser({
        email: "customer@demo.test", password: "password123", email_confirm: true,
        user_metadata: { role: 'CUSTOMER', name: 'Andy Griffith (Demo)' }
    }).catch(() => ({ data: { user: null } }));

    if (customerUser) {
        await supabase.from('User').upsert({
            id: customerUser.id, email: "customer@demo.test", name: 'Andy Griffith (Demo)', role: 'CUSTOMER',
            updatedAt: now, createdAt: now
        });
    }

    // 3. Restaurants & Merchants
    for (const res of mountAiryData) {
        console.log(`\n📦 Processing: ${res.name}...`);

        // A. Auth User
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: res.email, password: tempPassword, email_confirm: true,
            user_metadata: { role: 'MERCHANT', name: `${res.name} Manager` }
        }).catch(() => ({ data: null, error: { code: 'email_exists' } }));

        let userId = (authUser as any)?.user?.id;
        if (!userId) {
            const { data: { users } } = await supabase.auth.admin.listUsers();
            userId = users.find(u => u.email === res.email)?.id;
        }

        if (userId) {
            // B. Public User Table
            await supabase.from('User').upsert({
                id: userId, email: res.email, name: `${res.name} Manager`, role: 'MERCHANT',
                updatedAt: now, createdAt: now
            });

            // C. Restaurant Table
            const { error: rError } = await supabase.from('Restaurant').upsert({
                name: res.name, address: res.address, city: res.city, state: res.state,
                lat: res.lat, lng: res.lng, ownerId: userId, visibility: 'VISIBLE',
                description: `A fine ${res.cuisine} establishment in historic Mount Airy.`,
                imageUrl: `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2940&auto=format&fit=crop`,
                updatedAt: now, createdAt: now
            }, { onConflict: 'name' });

            if (rError) console.error(`- Restaurant Error:`, rError.message);

            // D. Menu Items
            const { data: restaurant } = await supabase.from('Restaurant').select('id').eq('name', res.name).single();
            if (restaurant) {
                // Clear old items to avoid duplicates in demo
                await supabase.from('MenuItem').delete().eq('restaurantId', restaurant.id);

                const menuItems = res.menu.map(item => ({
                    id: uuidv4(), restaurantId: restaurant.id, name: item.name,
                    description: item.description, price: item.price, category: item.category,
                    status: 'APPROVED', updatedAt: now, createdAt: now
                }));
                await supabase.from('MenuItem').insert(menuItems);
                console.log(`- ✅ Seeded ${res.name} (${menuItems.length} items)`);
                console.log(`  Login: ${res.email} / ${tempPassword}`);
            }
        }
    }

    console.log('\n✅ MASTER SEED COMPLETE. SYSTEM READY FOR DEMO.');
    process.exit(0);
}

masterSeed();
