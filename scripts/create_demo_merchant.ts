import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function create() {
    const userId = "merchant-demo-2026";
    const email = "demo-merchant@trueserve.com";
    const name = "The TrueServe Kitchen (Demo)";

    // 1. Create User
    await supabase.from('User').upsert({
        id: userId,
        email,
        name,
        role: 'MERCHANT',
        updatedAt: new Date().toISOString()
    });

    // 2. Create Restaurant
    const restId = uuidv4();
    await supabase.from('Restaurant').upsert({
        id: restId,
        ownerId: userId,
        name,
        address: "700 S Tryon St, Charlotte, NC 28202",
        city: "Charlotte",
        state: "NC",
        lat: 35.2271,
        lng: -80.8431,
        imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200',
        plan: 'Pro Subscription',
        ghlSyncEnabled: true,
        ghlLocationId: "demo-ghl-123",
        websiteUrl: "https://gohighlevel.com",
        updatedAt: new Date().toISOString()
    });

    // 3. Create some dummy menu items
    await supabase.from('MenuItem').insert([
        { id: uuidv4(), restaurantId: restId, name: "Elite Smash Burger", price: 15.99, status: "APPROVED", imageUrl: "/hero-burger.png" },
        { id: uuidv4(), restaurantId: restId, name: "Truffle Parm Fries", price: 8.50, status: "APPROVED", imageUrl: "/hero-pizza.png" }
    ]);

    // 4. Create a test order
    await supabase.from('Order').insert({
        id: uuidv4(),
        restaurantId: restId,
        userId: userId, // Self-order for demo
        status: 'PENDING',
        total: 24.49,
        createdAt: new Date().toISOString()
    });

    console.log("Demo Merchant Created!");
    console.log("ID:", userId);
}

create();
