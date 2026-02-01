
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

async function seedRealRestaurants() {
    console.log('Starting Real Restaurant Seed...')
    const now = new Date().toISOString();

    // 0. Cleanup
    console.log('Cleaning up old data...')
    await supabase.from('OrderItem').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    await supabase.from('Order').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('MenuItem').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('Restaurant').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // We keep Users and Drivers to avoid complexity, or checking if merchant exists.



    const restaurants = [
        {
            name: "The Garrison",
            address: "314 Main St",
            city: "Pineville",
            state: "NC",
            lat: 35.0833,
            lng: -80.8926,
            description: "A cocktail bar & restaurant located in the heart of historic Pineville.",
            imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16549766b?auto=format&fit=crop&q=80&w=1000",
            menu: [
                { name: "Garrison Burger", price: 16.00, description: "Double patty, sharp cheddar, bacon jam." },
                { name: "Fish & Chips", price: 18.00, description: "Beer battered cod, house tartar sauce." },
                { name: "Truffle Fries", price: 9.00, description: "Parmesan, truffle oil, parsley." }
            ]
        },
        {
            name: "The Flame",
            address: "8200 Providence Rd Ste 100",
            city: "Charlotte",
            state: "NC",
            lat: 35.0970,
            lng: -80.7810,
            description: "Premier dining destination offering steaks and seafood.",
            imageUrl: "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=1000",
            menu: [
                { name: "Ribeye Steak", price: 34.00, description: "12oz USDA Prime, garlic butter." },
                { name: "Seared Salmon", price: 26.00, description: "Lemon beurre blanc, asparagus." },
                { name: "Lobster Bisque", price: 12.00, description: "Rich creamy soup with lobster chunks." }
            ]
        },
        {
            name: "Waldhorn Restaurant",
            address: "12101 Lancaster Hwy",
            city: "Pineville",
            state: "NC",
            lat: 35.0710,
            lng: -80.8870,
            description: "Authentic German cuisine and beer garden.",
            imageUrl: "https://images.unsplash.com/photo-1574672280200-e840d21e8e54?auto=format&fit=crop&q=80&w=1000",
            menu: [
                { name: "Wiener Schnitzel", price: 22.00, description: "Breaded veal cutlet, lemon, potato salad." },
                { name: "Bratwurst Platter", price: 18.00, description: "Grilled sausages, sauerkraut, mashed potatoes." },
                { name: "Pretzel & Cheese", price: 10.00, description: "Giant bavarian pretzel with beer cheese." }
            ]
        },
        {
            name: "Metro Diner",
            address: "8334 Pineville-Matthews Rd #110",
            city: "Charlotte",
            state: "NC",
            lat: 35.0930,
            lng: -80.8650,
            description: "Comfort food with flair. Breakfast all day.",
            imageUrl: "https://images.unsplash.com/photo-1551024601-562963525c54?auto=format&fit=crop&q=80&w=1000",
            menu: [
                { name: "Fried Chicken & Waffle", price: 17.00, description: "Half chicken, strawberry butter." },
                { name: "Meatloaf Plate", price: 15.00, description: "Mash, gravy, green beans." },
                { name: "Charleston Shrimp & Grits", price: 18.00, description: "Andouille sausage, creamy grits." }
            ]
        },
        {
            name: "El Veracruz Mexican Restaurant",
            address: "315 S Polk St",
            city: "Pineville",
            state: "NC",
            lat: 35.0860,
            lng: -80.8900,
            description: "Traditional Mexican dishes and margaritas.",
            imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=1000",
            menu: [
                { name: "Carne Asada", price: 19.00, description: "Grilled steak, rice, beans, tortillas." },
                { name: "Street Tacos", price: 12.00, description: "Three tacos (steak, pastor, or chicken)." },
                { name: "Churros", price: 6.00, description: "Cinnamon sugar, caramel dipping sauce." }
            ]
        },
        {
            name: "Alley 51",
            address: "314 Main St",
            city: "Pineville",
            state: "NC",
            lat: 35.0833,
            lng: -80.8926,
            description: "Local favorite spot for quick bites and drinks.",
            imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=1000",
            menu: [
                { name: "Pulled Pork Sandwich", price: 11.00, description: "BBQ sauce, slaw, brioche bun." },
                { name: "Chili Cheese Fries", price: 8.00, description: "House chili, cheddar melt." },
                { name: "Wings (10)", price: 14.00, description: "Buffalo, BBQ, or Lemon Pepper." }
            ]
        }
    ];

    for (const r of restaurants) {
        console.log(`Creating ${r.name}...`);

        // Create unique merchant for this restaurant
        const merchantId = uuidv4();
        await supabase.from('User').insert({
            id: merchantId,
            email: `merchant_${uuidv4().substring(0, 8)}@test.com`,
            name: `${r.name} Owner`,
            role: 'MERCHANT',
            updatedAt: now,
            createdAt: now
        });

        const rId = uuidv4();

        // Insert Restaurant
        const { error: rError } = await supabase.from('Restaurant').insert({
            id: rId,
            name: r.name,
            address: r.address,
            city: r.city,
            state: r.state,
            lat: r.lat,
            lng: r.lng,
            description: r.description,
            imageUrl: r.imageUrl,
            ownerId: merchantId,
            updatedAt: now,
            createdAt: now
        });

        if (rError) {
            console.error(`Failed to create ${r.name}:`, rError);
            continue;
        }

        // Insert Menu Items
        if (r.menu) {
            const menuItems = r.menu.map(m => ({
                id: uuidv4(),
                restaurantId: rId,
                name: m.name,
                description: m.description,
                price: m.price,
                status: 'APPROVED',
                imageUrl: null, // Skipping specific images for menu items for now
                updatedAt: now,
                createdAt: now
            }));
            const { error: mError } = await supabase.from('MenuItem').insert(menuItems);
            if (mError) console.error(`Failed to add menu for ${r.name}:`, mError);
        }
    }

    console.log("Real restaurants seeded successfully!");
}

seedRealRestaurants();
