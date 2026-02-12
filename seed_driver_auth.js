
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { randomUUID } = require('crypto');

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createDriver() {
    const email = 'driver@trueserve.test';
    const password = 'password123';

    console.log(`Creating Driver: ${email} ...`);

    // 1. Check if user exists first to get ID
    let userId;
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error("Failed to list users:", listError);
        return;
    }

    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        userId = existingUser.id;
        console.log("User already exists:", userId);
        // Reset password
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, { password: password });
        if (updateError) console.error("Failed to update password:", updateError);
        else console.log("Password reset to default.");
    } else {
        // Create
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: { name: 'Demo Driver' }
        });

        if (authError) {
            console.error("Failed to create user:", authError);
            return;
        }
        userId = authData.user?.id;
        console.log("Created new auth user:", userId);
    }

    if (!userId) {
        console.error("No User ID obtainable.");
        return;
    }

    // 2. Upsert Public User
    const { error: userError } = await supabase.from('User').upsert({
        id: userId,
        email: email,
        name: 'Demo Driver',
        role: 'DRIVER',
        updatedAt: new Date().toISOString()
    });

    if (userError) {
        console.error("Failed to update public User table:", userError);
    } else {
        console.log("Public User table updated.");
    }

    // 3. Upsert Driver Profile
    const { data: existingDriver } = await supabase.from('Driver').select('id').eq('userId', userId).maybeSingle();

    if (!existingDriver) {
        const { error: driverError } = await supabase.from('Driver').insert({
            id: randomUUID(),
            userId: userId,
            status: 'ONLINE',
            vehicleType: 'CAR',
            currentLat: 35.2271,
            currentLng: -80.8431,
            updatedAt: new Date().toISOString()
        });
        if (driverError) console.error("Failed to create Driver profile:", driverError);
        else console.log("Driver Profile created.");
    } else {
        console.log("Driver Profile already exists.");
    }

    console.log("\n------------------------------------------------");
    console.log("SUCCESS. You can now login with:");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("------------------------------------------------\n");
}

createDriver();
