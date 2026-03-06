
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const mountAiryRestaurants = [
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
        menu: "https://eat13bones.com/13-bones-menu"
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
        menu: "https://thesnappylunch.com/"
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
        menu: "https://olympiafamilyrestaurant-mtairy.com/menu"
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
        menu: "https://www.littlerichardsbarbeque.com/menu"
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
        menu: "https://oldnorthstatewinery.com/pages/dining"
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
        menu: "https://places.singleplatform.com/barneys-cafe/menu"
    }
];

async function seedMountAiry() {
    console.log('Seeding Mount Airy Restaurants...');
    const now = new Date().toISOString();

    // 1. Ensure Service Location exists
    console.log('Checking Service Location...');
    await supabase.from('ServiceLocation').upsert({
        id: uuidv4(),
        city: 'Mount Airy',
        state: 'NC',
        zipPrefixes: ['27030'],
        isActive: true,
        updatedAt: now,
        createdAt: now
    }, { onConflict: 'city' });

    let createdCount = 0;

    for (const res of mountAiryRestaurants) {
        console.log(`Processing: ${res.name}...`);

        // Check if exists
        const { data: existing } = await supabase.from('Restaurant')
            .select('id')
            .eq('name', res.name)
            .maybeSingle();

        if (existing) {
            console.log(`- ${res.name} already exists. Skipping.`);
            continue;
        }

        const merchantId = uuidv4();
        const safeName = res.name.replace(/[^a-z0-9]/gi, '').toLowerCase();
        const email = `owner_${safeName}@trueserve.test`;
        const tempPassword = `MountAiry2026!`;

        // Create User (Auth requires Admin, but User table is separate)
        // We'll insert into User table first. 
        // In production we'd use supabase.auth.admin.createUser
        const { error: uError } = await supabase.from('User').insert({
            id: merchantId,
            email: email,
            name: `${res.name} Manager`,
            role: 'MERCHANT',
            updatedAt: now,
            createdAt: now
        });

        if (uError) {
            console.error(`- Failed to create user for ${res.name}:`, uError);
            continue;
        }

        const rId = uuidv4();
        const { error: rError } = await supabase.from('Restaurant').insert({
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
            createdAt: now
        });

        if (rError) {
            console.error(`- Failed to create restaurant ${res.name}:`, rError);
            continue;
        }

        console.log(`- Successfully created ${res.name}. Login: ${email} / Password: ${tempPassword}`);
        createdCount++;
    }

    console.log(`Seed complete. Created ${createdCount} restaurants.`);
}

seedMountAiry();
