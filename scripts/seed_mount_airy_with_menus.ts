
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

dotenv.config()
// Fallback for some environments
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const mountAiryData = [
    {
        name: "13 Bones",
        address: "502 S Andy Griffith Pkwy",
        cuisine: "BBQ / Steak / Seafood",
        lat: 36.4789,
        lng: -80.6171,
        city: "Mount Airy",
        state: "NC",
        zip: "27030",
        phone: "336-786-1313",
        website: "https://eat13bones.com/",
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
        address: "602 Linville Rd",
        cuisine: "American / Greek / Seafood / Breakfast",
        lat: 36.4950,
        lng: -80.6020,
        city: "Mount Airy",
        state: "NC",
        zip: "27030",
        website: "https://olympiafamilyrestaurant.com/",
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
        address: "455 Frederick St",
        cuisine: "BBQ / Southern",
        lat: 36.4957,
        lng: -80.6105,
        city: "Mount Airy",
        state: "NC",
        zip: "27030",
        phone: "336-783-0227",
        website: "https://www.littlerichardsbarbeque.com/",
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
        address: "308 North Main St",
        cuisine: "Winery / American / Upscale Casual",
        lat: 36.5009,
        lng: -80.6086,
        city: "Mount Airy",
        state: "NC",
        zip: "27030",
        phone: "336-789-9463",
        website: "https://oldnorthstatewinery.com/",
        menu: [
            { name: "ONS Board (Charcuterie)", description: "Three NC Cheeses, Prosciutto, Salami, Olives, Toast Points, Jam", price: 22.00, category: "Shares" },
            { name: "ONS Burger", description: "Winery signature burger with house toppings", price: 17.00, category: "Lunch" },
            { name: "Chicken Salad Croissant", description: "Homemade chicken salad on a buttery croissant", price: 14.00, category: "Lunch" },
            { name: "Fish & Chips", description: "Beer-battered fish served with hand-cut fries", price: 18.00, category: "Lunch" }
        ]
    },
    {
        name: "Barney's Cafe",
        address: "206 N Main St",
        cuisine: "Diner / Burgers / Sandwiches",
        lat: 36.5011,
        lng: -80.6080,
        city: "Mount Airy",
        state: "NC",
        zip: "27030",
        menu: [
            { name: "Big Country Breakfast", description: "Eggs, choice of meat, grits/gravy/hashbrowns, and biscuit/toast.", price: 12.00, category: "Breakfast" },
            { name: "Mayberry Club", description: "Triple decker with ham, turkey, and bacon.", price: 10.50, category: "Sandwiches" },
            { name: "Pimento Cheese Burger", description: "Burger topped with housemade pimento cheese.", price: 11.00, category: "Sandwiches" },
            { name: "Chicken Salad Sandwich", description: "Classic southern style chicken salad.", price: 9.50, category: "Sandwiches" }
        ]
    },
    {
        name: "Snappy Lunch",
        address: "125 N Main St",
        cuisine: "Breakfast / Lunch / Diner",
        lat: 36.5028,
        lng: -80.6084,
        city: "Mount Airy",
        state: "NC",
        zip: "27030",
        phone: "336-786-4931",
        website: "https://thesnappylunch.com/",
        menu: [
            { name: "World-Famous Pork Chop Sandwich", description: "The legendary breaded pork chop sandwich that made Snappy Lunch famous.", price: 8.50, category: "Specials" },
            { name: "Breaded Cheeseburger", description: "Classic lunch counter cheeseburger.", price: 6.50, category: "Lunch" },
            { name: "BLT Sandwich", description: "Bacon, lettuce, and tomato on toasted bread.", price: 5.50, category: "Lunch" },
            { name: "Biscuits and Gravy", description: "Made-from-scratch biscuits topped with hearty gravy.", price: 4.50, category: "Breakfast" }
        ]
    }
];

async function seedMountAiry() {
    console.log('🚀 Starting Mount Airy Power Seed...');
    const now = new Date().toISOString();

    // 1. Service Location
    await supabase.from('ServiceLocation').upsert({
        id: uuidv4(),
        city: 'Mount Airy',
        state: 'NC',
        zipPrefixes: ['27030'],
        isActive: true,
        updatedAt: now,
        createdAt: now
    }, { onConflict: 'city' });

    for (const res of mountAiryData) {
        console.log(`Processing: ${res.name}...`);

        const merchantId = uuidv4();
        const safeName = res.name.replace(/[^a-z0-9]/gi, '').toLowerCase();
        const email = `owner_${safeName}@trueserve.test`;
        const tempPassword = `MountAiry2026!`;

        // Create User record
        await supabase.from('User').upsert({
            id: merchantId,
            email: email,
            name: `${res.name} Manager`,
            role: 'MERCHANT',
            updatedAt: now,
            createdAt: now
        }, { onConflict: 'email' });

        const rId = uuidv4();
        // Insert Restaurant
        const { data: rest, error: rError } = await supabase.from('Restaurant').upsert({
            id: rId,
            name: res.name,
            address: res.address,
            city: res.city,
            state: res.state,
            lat: res.lat,
            lng: res.lng,
            description: `A fine ${res.cuisine} establishment in historic Mount Airy.`,
            imageUrl: `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2940&auto=format&fit=crop`,
            ownerId: merchantId,
            updatedAt: now,
            createdAt: now,
            visibility: 'VISIBLE'
        }, { onConflict: 'name' });

        if (rError) {
            console.error(`- Error seeding ${res.name}:`, rError);
            continue;
        }

        // Fetch the restaurant ID (in case of upsert)
        const { data: actualRest } = await supabase.from('Restaurant').select('id').eq('name', res.name).single();
        const finalRId = actualRest?.id || rId;

        // Insert Menu Items
        const menuItems = res.menu.map(item => ({
            id: uuidv4(),
            restaurantId: finalRId,
            name: item.name,
            description: item.description,
            price: item.price,
            status: 'APPROVED',
            category: item.category,
            updatedAt: now,
            createdAt: now
        }));

        const { error: mError } = await supabase.from('MenuItem').insert(menuItems);
        if (mError) console.error(`- Error seeding menu for ${res.name}:`, mError);

        console.log(`- ✅ Seeded ${res.name} with ${menuItems.length} items. Login: ${email}`);
    }

    console.log('✅ MOUNT AIRY SEED COMPLETE.');
}

seedMountAiry();
