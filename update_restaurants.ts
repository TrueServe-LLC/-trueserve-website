
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { resolve } from 'path';

// Load .env from current directory
dotenv.config({ path: resolve(__dirname, '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateRestaurants() {
    console.log("Starting Restaurant Update...");

    // 1. Delete Existing Mocks or Old Data
    // We will delete based on names or a 'mock' tag if we had one.
    // For safety, let's just delete the ones we are about to replace if they exist,
    // or you might want to clear ALL restaurants in these cities.
    // Let's go with clearing specific mock names found in previous files to be clean.
    const namesToDelete = [
        "Carolina BBQ Pit (Mock)",
        "Queen City Burger (Mock)",
        "North Star Diner (Mock)",
        "Pineville Tavern (Mock)",
        "Global Fusion (Mock)",
        "Pineville Tavern",
        "Global Fusion Pineville"
    ];

    console.log(`Deleting MenuItems for related restaurants...`);
    // First find IDs of restaurants to delete
    const { data: restsToDelete } = await supabase.from('Restaurant').select('id').in('name', namesToDelete);
    if (restsToDelete && restsToDelete.length > 0) {
        const ids = restsToDelete.map(r => r.id);
        await supabase.from('MenuItem').delete().in('restaurantId', ids);
    }

    console.log(`Deleting ${namesToDelete.length} mock/old restaurants...`);
    const { error: deleteError } = await supabase
        .from('Restaurant')
        .delete()
        .in('name', namesToDelete);

    if (deleteError) {
        console.error("Error deleting old restaurants:", deleteError);
    } else {
        console.log("Old restaurants deleted.");
    }

    // 2. Define New Real Restaurants
    const newRestaurants = [
        {
            name: "Pineville Tavern",
            address: "123 Main St, Pineville, NC",
            city: "Pineville",
            state: "NC",
            zipCode: "28134",
            lat: 35.0833,
            lng: -80.8872,
            imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
            description: "Historic tavern serving classic American fare and spirits.",
            website: "https://pinevilletavern.com", // Keeping it compatible with schema, usually schema doesn't have website col but we can check
            menu: [
                { name: "Classic Burger", price: 14.00, description: "Juicy beef patty with cheddar and fixins.", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
                { name: "Fish and Chips", price: 16.50, description: "Crispy battered cod with thick cut fries.", imageUrl: "" }
            ]
        },
        {
            name: "Global Fusion Pineville",
            address: "456 Polk St, Pineville, NC",
            city: "Pineville",
            state: "NC",
            zipCode: "28134",
            lat: 35.0850,
            lng: -80.8900,
            imageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
            description: "A culinary journey around the world.",
            website: "https://globalfusion.com",
            menu: [
                { name: "Spicy Tuna Roll", price: 12.00, description: "Fresh tuna with spicy mayo.", imageUrl: "" },
                { name: "Pad Thai", price: 15.00, description: "Rice noodles stir-fried with egg and peanuts.", imageUrl: "" }
            ]
        },
        {
            name: "Midwood Smokehouse",
            address: "1401 Central Ave, Charlotte, NC",
            city: "Charlotte",
            state: "NC",
            zipCode: "28205",
            lat: 35.2205,
            lng: -80.8143,
            imageUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800",
            description: "Best BBQ in Charlotte, serving Texas-style smoked meats.",
            website: "https://midwoodsmokehouse.com",
            menu: [
                { name: "Fatty Brisket Plate", price: 24.00, description: "Slow-smoked prime brisket.", imageUrl: "" },
                { name: "Burnt Ends", price: 19.50, description: "Caramelized Cubes of Brisket goodness.", imageUrl: "" }
            ]
        }
    ];

    // 3. Insert New Restaurants
    console.log(`Inserting ${newRestaurants.length} new restaurants...`);

    // We need a merchant ID to link these to. We'll grab the first merchant we find.
    const { data: merchant } = await supabase.from('User').select('id').eq('role', 'MERCHANT').limit(1).single();
    const merchantId = merchant?.id; // If null, the schema might allow nullable or we fail.

    if (!merchantId) {
        console.warn("No Merchant found! Creating these under a placeholder or failing if strict.");
        // Proceeding might fail if ownerId is required.
    }

    const now = new Date().toISOString();

    let currentMerchantId = merchantId;

    // Generate unique owner for EACH restaurant to avoid unique constraint collisions
    let currentMerchantId = merchantId;
    const newMsgRef = `merchant-mock-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
    const { data: newMerch } = await supabase.from('User').insert({
        id: uuidv4(),
        email: newMsgRef,
        name: `Manager of ${r.name}`,
        role: 'MERCHANT',
        updatedAt: now,
        createdAt: now
    }).select('id').single();
    if (newMerch) currentMerchantId = newMerch.id;

    const { error: rError } = await supabase.from('Restaurant').insert({
        id: rId,
        name: r.name,
        address: r.address,
        city: r.city,
        state: r.state,
        description: `${r.description} | ${r.website}`,
        lat: r.lat,
        lng: r.lng,
        imageUrl: r.imageUrl,
        ownerId: currentMerchantId,
        updatedAt: now,
        createdAt: now
    });

    if (rError) {
        console.error(`Failed to create ${r.name}:`, rError);
        continue;
    }

    // Insert Menu
    if (r.menu) {
        const menuItems = r.menu.map(m => ({
            id: uuidv4(),
            restaurantId: rId,
            name: m.name,
            description: m.description,
            price: m.price,
            status: 'APPROVED',
            imageUrl: m.imageUrl || null,
            updatedAt: now,
            createdAt: now
        }));

        const { error: mError } = await supabase.from('MenuItem').insert(menuItems);
        if (mError) {
            console.error(`Failed to add menu for ${r.name}:`, mError);
        }
    }
}

console.log("Update Complete!");
}

updateRestaurants();
