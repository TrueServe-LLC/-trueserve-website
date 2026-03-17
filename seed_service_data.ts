
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

// List of base names to generate realistic restaurants
const baseNames = [
    "The Garrison", "The Flame", "Metro Diner", "El Veracruz", "Alley 51",
    "Mama Ricotta's", "Midwood Smokehouse", "Haberdish", "Kindred", "Beef 'N Bottle", "Lang Van",
    "Copper", "O-Ku", "Futo Buta", "Seoul Food Meat Co.", "Let's Meat", "Hawkers", "Optimist Hall",
    "Midnight Diner", "Amélie's French Bakery", "Suffolk Punch", "Legion Brewing", "Wooden Robot",
    "Sycamore Brewing", "Olde Mecklenburg Brewery", "Protagonist", "Salud Cerveceria", "Divine Barrel",
    "Heist Brewery", "Birdsong Brewing", "NoDa Brewing", "Triple C", "YAMA", "Ru San's",
    "Cowfish", "Bad Daddy's Burger Bar", "Viva Chicken", "Sabor Latin Street Grill", "Yafo Kitchen",
    "Cava", "Chopt", "Flower Child", "North Italia", "Stagioni", "Barrington's", "Good Food",
    "300 East", "Fern", "Living Kitchen", "Bean Vegan Cuisine", "Sanctuary Bistro", "Oh My Soul",
    "Romeo's Vegan Burgers", "Pure Pizza", "Inizio Pizza", "Antico Italian", "Portofino's",
    "Mama's Pizza", "Fuel Pizza", "Brixx", "Mellow Mushroom", "Hawthorne's", "Luisa's",
    "Intermezzo", "Cajun Queen", "Dressler's", "Dogwood", "Fin & Fino", "Peppervine",
    "The Crunkleton", "Customshop", "Halcyon", "Mimosa Grill", "Sea Level", "The King's Kitchen",
    "Rooster's", "Noble Smoke", "The Waterman", "Hello, Sailor", "Bojangles", "Cook Out",
    "Zaxby's", "Biscuitville", "Tudors Biscuit World", "Showmars", "Smithfield's", "S&S Cafeteria"
];

const cuisines = ["American", "Italian", "Mexican", "Asian Fusion", "BBQ", "Burgers", "Vegan", "Pizza", "Seafood", "Steakhouse"];

const specificRestaurants = [
    {
        name: "Costa Del Sol",
        address: "10215 Park Rd",
        city: "Charlotte",
        state: "NC",
        lat: 35.097,
        lng: -80.859,
        cuisine: "Mexican",
        image: "https://images.squarespace-cdn.com/content/v1/65b858c7baf8b0029d04970b/1770229040424-64H9DWZX259ZRF8VQ9Y1/image-asset.jpeg",
        items: [
            { name: "Pollo Guisado", description: "Tender stewed chicken with potatoes and carrots, served with rice.", price: 14, image: "https://images.squarespace-cdn.com/content/v1/65b858c7baf8b0029d04970b/1770059966868-HOU04YLM0N8DSH7PK7KM/image-asset.jpeg" },
            { name: "Alitas Touchdown", description: "Crispy chicken wings with your choice of house sauce.", price: 12, image: "https://source.unsplash.com/400x300/?chicken,wings" },
            { name: "MVP Burger", description: "Juicy beef patty topped with cheese, lettuce, tomato, and secret sauce.", price: 15, image: "https://source.unsplash.com/400x300/?burger" },
            { name: "Piña Colada", description: "Fresh pineapple drive, coconut cream, and rum.", price: 10, image: "https://images.squarespace-cdn.com/content/v1/65b858c7baf8b0029d04970b/1770048845071-LYORNLFIETICWTF34WO5/image-asset.jpeg" }
        ]
    },
    {
        name: "Waldhorn Restaurant",
        address: "12101 Lancaster Hwy",
        city: "Pineville",
        state: "NC",
        lat: 35.076,
        lng: -80.887,
        cuisine: "German",
        image: "https://images.unsplash.com/photo-1599458252573-56ae36120de1?q=80&w=2940&auto=format&fit=crop", // Representative German exterior
        items: [
            { name: "Jägerschnitzel", description: "Breaded pork schnitzel topped with homemade mushroom gravy.", price: 24, image: "https://source.unsplash.com/400x300/?schnitzel" },
            { name: "Riesen Bretzel", description: "Giant Bavarian pretzel served with beer cheese and mustard.", price: 12, image: "https://source.unsplash.com/400x300/?pretzel" },
            { name: "Bratwurst Platter", description: "Two grilled bratwursts served with sauerkraut and potato salad.", price: 18, image: "https://source.unsplash.com/400x300/?bratwurst" },
            { name: "Apfelstrudel", description: "Warm apple strudel served with vanilla sauce.", price: 9, image: "https://source.unsplash.com/400x300/?strudel" }
        ]
    },
    {
        name: "Hoppin'",
        address: "110 Southern St",
        city: "Rock Hill",
        state: "SC",
        lat: 34.928,
        lng: -81.026,
        cuisine: "American",
        image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2874&auto=format&fit=crop", // Modern Taproom Vibe
        items: [
            { name: "Double Smash Burger", description: "Two patties, American cheese, pickles, and house sauce (from Fresh Press).", price: 16, image: "https://source.unsplash.com/400x300/?smashburger" },
            { name: "Turkey & Havarti Panini", description: "Roasted turkey, havarti cheese, and pesto mayo on ciabatta.", price: 14, image: "https://source.unsplash.com/400x300/?panini" },
            { name: "The Cuban", description: "Slow-roasted pork, ham, swiss, pickles, and mustard.", price: 15, image: "https://source.unsplash.com/400x300/?cuban,sandwich" },
            { name: "Loaded Reuben Fries", description: "Crispy fries topped with corned beef, swiss, sauerkraut, and dressing.", price: 13, image: "https://source.unsplash.com/400x300/?fries,cheese" }
        ]
    }
];

async function seedRealRestaurants() {
    console.log('Starting Real Restaurant Seed (Target: 83)...')
    const now = new Date().toISOString();

    // 0. Cleanup
    console.log('Cleaning up old data...')
    await supabase.from('OrderItem').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('Order').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('MenuItem').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('Restaurant').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // Note: Not deleting ServiceLocation or User to avoid breaking existing valid users/locations if possible, 
    // but for a clean seed usually we want fresh state. 
    // If we delete Users we break the link to auth.users which we can't delete via Client.
    // So we'll just add new ones.

    // 0.1 Seed Service Locations (Ensure they exist)
    console.log('Seeding Service Locations...');
    await supabase.from('ServiceLocation').upsert([
        { id: uuidv4(), city: 'Charlotte', state: 'NC', zipPrefixes: ['282', '280', '281'], isActive: true, updatedAt: now, createdAt: now },
        { id: uuidv4(), city: 'Pineville', state: 'NC', zipPrefixes: ['28134'], isActive: true, updatedAt: now, createdAt: now },
        { id: uuidv4(), city: 'Rock Hill', state: 'SC', zipPrefixes: ['29730', '29732'], isActive: true, updatedAt: now, createdAt: now },
        { id: uuidv4(), city: 'Greenville', state: 'SC', zipPrefixes: ['29601', '29605', '29607', '29609', '29611', '29617'], isActive: true, updatedAt: now, createdAt: now },
        { id: uuidv4(), city: 'Simpsonville', state: 'SC', zipPrefixes: ['29680', '29681'], isActive: true, updatedAt: now, createdAt: now },
        { id: uuidv4(), city: 'Spartanburg', state: 'SC', zipPrefixes: ['29301', '29302', '29303', '29306', '29307'], isActive: true, updatedAt: now, createdAt: now },
        { id: uuidv4(), city: 'Clemson', state: 'SC', zipPrefixes: ['29631', '29634'], isActive: true, updatedAt: now, createdAt: now },
        { id: uuidv4(), city: 'Greer', state: 'SC', zipPrefixes: ['29650', '29651'], isActive: true, updatedAt: now, createdAt: now },
        { id: uuidv4(), city: 'Athens', state: 'GA', zipPrefixes: ['30601', '30605', '30606', '30607'], isActive: true, updatedAt: now, createdAt: now },
        { id: uuidv4(), city: 'Marietta', state: 'GA', zipPrefixes: ['30008', '30060', '30062', '30064', '30066', '30067', '30068'], isActive: true, updatedAt: now, createdAt: now },
        { id: uuidv4(), city: 'Evans', state: 'GA', zipPrefixes: ['30809'], isActive: true, updatedAt: now, createdAt: now },
        { id: uuidv4(), city: 'Davidson', state: 'NC', zipPrefixes: ['28035', '28036'], isActive: true, updatedAt: now, createdAt: now },
        { id: uuidv4(), city: 'Brevard', state: 'NC', zipPrefixes: ['28712'], isActive: true, updatedAt: now, createdAt: now }
    ], { onConflict: 'city' });

    let createdCount = 0;

    // 1. Seed Specific Restaurants first
    for (const spec of specificRestaurants) {
        console.log(`Creating Specific: ${spec.name}...`);

        const merchantId = uuidv4();
        const email = `owner_${spec.name.replace(/\s/g, '').toLowerCase()}_${Date.now()}@trueserve.test`;

        await supabase.from('User').insert({
            id: merchantId,
            email: email,
            name: `${spec.name} Manager`,
            role: 'MERCHANT',
            updatedAt: now,
            createdAt: now
        });

        const rId = uuidv4();
        const { error: rError } = await supabase.from('Restaurant').insert({
            id: rId,
            name: spec.name,
            address: spec.address,
            city: spec.city,
            state: spec.state,
            lat: spec.lat,
            lng: spec.lng,
            description: `Authentic ${spec.cuisine} experience.`,
            imageUrl: spec.image,
            ownerId: merchantId,
            updatedAt: now,
            createdAt: now
        });

        if (rError) {
            console.error(`Failed to create ${spec.name}:`, rError);
            continue;
        }

        // Add Menu Items
        const menuItems = spec.items.map(item => ({
            id: uuidv4(),
            restaurantId: rId,
            name: item.name,
            description: item.description,
            price: item.price,
            status: 'APPROVED',
            imageUrl: item.image,
            updatedAt: now,
            createdAt: now
        }));

        await supabase.from('MenuItem').insert(menuItems);
        createdCount++;
    }

    // 2. Fill the rest with random data (Target 80 more)
    // REMOVED at user request to only show the 3 specific restaurants.
    /* 
    for (let i = 0; i < 80; i++) {
        const name = i < baseNames.length ? baseNames[i] : `TrueServe Kitchen #${i - baseNames.length + 1}`;
        const cuisine = cuisines[i % cuisines.length];

        // Distribute across locations (33% each roughly)
        let city = "Charlotte";
        let state = "NC";
        let lat = 35.2271;
        let lng = -80.8431;

        if (i % 3 === 1) {
            city = "Pineville";
            state = "NC";
            lat = 35.0833;
            lng = -80.8872;
        } else if (i % 3 === 2) {
            city = "Rock Hill";
            state = "SC";
            lat = 34.9249;
            lng = -81.0251;
        }

        // Add random jitter safely
        lat = lat + (Math.random() - 0.5) * 0.1;
        lng = lng + (Math.random() - 0.5) * 0.1;

        console.log(`Creating [${i + 1}/80]: ${name}...`);

        // Create Merchant User
        const merchantId = uuidv4();
        // Use a fake email that's unique
        const email = `owner_${i}_${Date.now()}@trueserve.test`;

        await supabase.from('User').insert({
            id: merchantId,
            email: email,
            name: `${name} Manager`,
            role: 'MERCHANT',
            updatedAt: now,
            createdAt: now
        });

        const rId = uuidv4();

        // Insert Restaurant
        const { error: rError } = await supabase.from('Restaurant').insert({
            id: rId,
            name: name,
            address: `${Math.floor(Math.random() * 9000) + 100} Main St`, // Mock address
            city: city,
            state: state,
            lat: lat,
            lng: lng,
            description: `Authentic ${cuisine} experience in the heart of the city.`,
            imageUrl: `https://source.unsplash.com/800x600/?restaurant,food,${cuisine.toLowerCase()}`, // Unsplash random
            ownerId: merchantId,
            updatedAt: now,
            createdAt: now
        });

        if (rError) {
            console.error(`Failed to create ${name}:`, rError);
            continue;
        }

        // Insert Menu Items (3-5 random items)
        const numItems = Math.floor(Math.random() * 3) + 3;
        const menuItems = [];
        for (let j = 0; j < numItems; j++) {
            menuItems.push({
                id: uuidv4(),
                restaurantId: rId,
                name: `${cuisine} Special ${j + 1}`,
                description: "Freshly prepared with local ingredients.",
                price: Math.floor(Math.random() * 20) + 10,
                status: 'APPROVED',
                imageUrl: `https://source.unsplash.com/400x300/?food,${cuisine.toLowerCase()}`,
                updatedAt: now,
                createdAt: now
            });
        }

        const { error: mError } = await supabase.from('MenuItem').insert(menuItems);
        if (mError) console.error(`Failed to add menu for ${name}:`, mError);

        createdCount++;
    }
    */

    console.log(`Seeding Complete. Successfully created ${createdCount} restaurants.`);
}

seedRealRestaurants();
