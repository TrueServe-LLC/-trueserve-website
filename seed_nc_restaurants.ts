
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// List of base names to generate realistic restaurants
const baseNames = [
    "The Garrison", "The Flame", "Waldhorn Restaurant", "Metro Diner", "El Veracruz", "Alley 51",
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
        { id: uuidv4(), city: 'Pineville', state: 'NC', zipPrefixes: ['28134'], isActive: true, updatedAt: now, createdAt: now }
    ], { onConflict: 'city' }); // Assuming city is unique or just adding duplicates isn't fatal for now

    let createdCount = 0;

    for (let i = 0; i < 83; i++) {
        const name = i < baseNames.length ? baseNames[i] : `TrueServe Kitchen #${i - baseNames.length + 1}`;
        const cuisine = cuisines[i % cuisines.length];
        const lat = 35.2271 + (Math.random() - 0.5) * 0.2; // Random spread around Charlotte
        const lng = -80.8431 + (Math.random() - 0.5) * 0.2;

        console.log(`Creating [${i + 1}/83]: ${name}...`);

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
            city: i % 5 === 0 ? "Pineville" : "Charlotte",
            state: "NC",
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

    console.log(`Seeding Complete. Successfully created ${createdCount} restaurants.`);
}

seedRealRestaurants();
