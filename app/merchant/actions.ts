
"use server";

import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { getStripe } from "@/lib/stripe";
import { sendSMS } from "@/lib/sms";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createNotification } from "@/lib/notifications";

export type MerchantActionState = {
    message: string;
    success?: boolean;
    error?: boolean;
};

export async function addMenuItem(prevState: MerchantActionState, formData: FormData): Promise<MerchantActionState> {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return { error: true, message: "Unauthorized" };

    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;
    const image = formData.get("image") as File;

    if (!name || isNaN(price)) {
        return { error: true, message: "Invalid input" };
    }

    try {
        // Get Restaurant ID for this user
        const { data: restaurant } = await supabase
            .from('Restaurant')
            .select('id')
            .eq('ownerId', userId)
            .single();

        if (!restaurant) throw new Error("Restaurant not found");

        let imageUrl = null;

        // Auto-create bucket just in case (will fail silently if it already exists)
        await supabaseAdmin.storage.createBucket('menu-images', { public: true }).catch(() => { });

        if (image && image.size > 0) {
            const fileExt = image.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const arrayBuffer = await image.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);

            const { error: uploadError } = await supabaseAdmin.storage
                .from('menu-images')
                .upload(fileName, buffer, {
                    contentType: image.type,
                    upsert: false
                });

            if (uploadError) {
                console.error("Image upload failed:", uploadError);
                throw new Error("Failed to upload image.");
            }

            const { data: publicUrlData } = supabaseAdmin.storage
                .from('menu-images')
                .getPublicUrl(fileName);

            imageUrl = publicUrlData.publicUrl;
        }

        const { error } = await supabase
            .from('MenuItem')
            .insert({
                id: uuidv4(),
                restaurantId: restaurant.id,
                name,
                price,
                description,
                imageUrl, // New photo field
                status: 'APPROVED',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

        if (error) throw error;

        revalidatePath('/merchant/dashboard');
        return { success: true, message: "Item added successfully" };
    } catch (e: any) {
        console.error("Add Item Error:", e);
        return { error: true, message: e.message || "Failed to add item" };
    }
}

export async function updateStoreBanner(prevState: MerchantActionState, formData: FormData): Promise<MerchantActionState> {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return { error: true, message: "Unauthorized" };

    const image = formData.get("image") as File;
    if (!image || image.size === 0) return { error: true, message: "No image provided" };

    try {
        const { data: restaurant } = await supabase
            .from('Restaurant')
            .select('id')
            .eq('ownerId', userId)
            .single();

        if (!restaurant) throw new Error("Restaurant not found");

        await supabaseAdmin.storage.createBucket('restaurant-banners', { public: true }).catch(() => { });

        const fileExt = image.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const arrayBuffer = await image.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const { error: uploadError } = await supabaseAdmin.storage
            .from('restaurant-banners')
            .upload(fileName, buffer, { contentType: image.type, upsert: false });

        if (uploadError) throw new Error("Failed to upload image.");

        const { data: publicUrlData } = supabaseAdmin.storage
            .from('restaurant-banners')
            .getPublicUrl(fileName);

        const { error } = await supabase
            .from('Restaurant')
            .update({ imageUrl: publicUrlData.publicUrl, updatedAt: new Date().toISOString() })
            .eq('id', restaurant.id);

        if (error) throw error;

        revalidatePath('/merchant/dashboard');
        return { success: true, message: "Store banner updated successfully. Give it a minute or refresh to see changes live." };
    } catch (e: any) {
        console.error("Banner Upload Error:", e);
        return { error: true, message: "Failed to update banner." };
    }
}

export async function updateOrderStatus(orderId: string, nextStatus: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return { error: "Unauthorized" };

    // Valid OrderStatus values verified from DB: PENDING, PREPARING, READY_FOR_PICKUP, PICKED_UP, DELIVERED, CANCELLED
    try {
        // 1. Get current status to validate transition (Scenario 1.9)
        const { data: order } = await supabase
            .from('Order')
            .select('status')
            .eq('id', orderId)
            .single();

        if (!order) return { error: "Order not found" };

        const transitions: Record<string, string[]> = {
            'PENDING': ['PREPARING', 'CANCELLED'],
            'PREPARING': ['READY_FOR_PICKUP', 'CANCELLED'],
            'READY_FOR_PICKUP': ['PICKED_UP', 'CANCELLED'],
            'PICKED_UP': ['DELIVERED', 'CANCELLED'],
            'DELIVERED': [],
            'CANCELLED': []
        };

        if (!transitions[order.status]?.includes(nextStatus)) {
            return { error: `Invalid transition from ${order.status} to ${nextStatus}` };
        }

        const { error } = await supabase
            .from('Order')
            .update({ status: nextStatus, updatedAt: new Date().toISOString() })
            .eq('id', orderId);

        if (error) throw error;

        // --- NEW: Notify Customer ---
        try {
            const { data: orderData } = await supabaseAdmin
                .from('Order')
                .select('userId, restaurant:Restaurant(name)')
                .eq('id', orderId)
                .single();

            if (orderData) {
                const restaurantName = (orderData.restaurant as any)?.name || "Restaurant";
                let title = "Order Update";
                let message = `Your order from ${restaurantName} is now ${nextStatus.toLowerCase().replace('_', ' ')}.`;

                if (nextStatus === 'PREPARING') {
                    title = "Kitchen is cooking! 👨‍🍳";
                    message = `${restaurantName} has started preparing your order.`;
                } else if (nextStatus === 'READY_FOR_PICKUP') {
                    title = "Order Ready! 🍕";
                    message = `Your order is ready. A driver will pick it up shortly.`;
                } else if (nextStatus === 'CANCELLED') {
                    title = "Order Cancelled";
                    message = `We're sorry, your order from ${restaurantName} was cancelled.`;
                }

                await createNotification({
                    userId: orderData.userId,
                    orderId: orderId,
                    title,
                    message
                });
            }
        } catch (notifErr) {
            console.error("[Customer Notification Error]:", notifErr);
        }

        // --- NEW: Trigger SMS Alert to Driver if ready ---
        if (nextStatus === 'READY_FOR_PICKUP') {
            try {
                // Fetch driver phone and restaurant info for the SMS
                const { data: fullOrder } = await supabaseAdmin
                    .from('Order')
                    .select('*, restaurant:Restaurant(name), driver:Driver(userId)')
                    .eq('id', orderId)
                    .single();

                if (fullOrder?.driver && !Array.isArray(fullOrder.driver)) {
                    const driverObj = fullOrder.driver as unknown as { userId: string };
                    if (driverObj.userId) {
                        const { data: authData } = await supabaseAdmin.auth.admin.getUserById(driverObj.userId);
                        const phone = authData?.user?.phone || authData?.user?.user_metadata?.phone;

                        if (phone) {
                            const message = `TrueServe: ${fullOrder.restaurant.name} order is READY! Please head to the counter for pickup.`;
                            await sendSMS(phone, message);
                        }
                    }
                }
            } catch (smsErr) {
                console.error("[SMS Notification Error]:", smsErr);
            }
        }


        revalidatePath('/merchant/dashboard');
        revalidatePath(`/orders/${orderId}`);
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function refundOrder(orderId: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return { error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from('Order')
            .update({ isRefunded: true, status: 'CANCELLED' })
            .eq('id', orderId);

        if (error) throw error;
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function submitMerchantInquiry(prevState: any, formData: FormData): Promise<MerchantActionState> {
    const restaurantName = formData.get("restaurantName") as string;
    const contactName = formData.get("contactName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zip = formData.get("zip") as string;
    const plan = formData.get("plan") as string;

    if (!restaurantName || !contactName || !email || !password || !address || !city || !state) {
        return { message: "Please fill in all required fields.", error: true };
    }

    try {
        // 0. Check if User record already exists in Public table
        const { data: existingPublicUser } = await supabaseAdmin
            .from('User')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (existingPublicUser) {
            return { message: "This email is already registered. Please log in instead.", error: true };
        }

        // 1. Create a Supabase Auth User (IAM) - Use Admin API to bypass "Sign up disabled" settings
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                displayName: contactName,
                role: 'MERCHANT'
            }
        });

        if (authError) {
            console.error("Auth Signup Error:", authError);
            if (authError.message.includes("already exists")) {
                return { message: "An account with this email already exists. Please log in.", error: true };
            }
            return { message: "Signup Failed: " + authError.message, error: true };
        }

        if (!authData.user) {
            return { message: "Something went wrong. Please try again.", error: true };
        }

        const userId = authData.user.id;

        // 2. Create Public User Record - Use ADMIN to bypass RLS
        const { data: existingUser } = await supabaseAdmin.from('User').select('id').eq('id', userId).maybeSingle();

        if (!existingUser) {
            const { error: userError } = await supabaseAdmin.from('User').insert({
                id: userId,
                email,
                name: contactName,
                role: 'MERCHANT',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            if (userError) throw userError;
        }

        // 2b. Google Maps Geocoding API lookup
        let lat = 35.2271; // Default fallback (Charlotte)
        let lng = -80.8431;

        try {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (apiKey) {
                const fullAddress = `${address}, ${city}, ${state} ${zip}`;
                const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`;
                const geoRes = await fetch(geoUrl);
                const geoData = await geoRes.json();

                if (geoData.status === 'OK' && geoData.results && geoData.results.length > 0) {
                    lat = geoData.results[0].geometry.location.lat;
                    lng = geoData.results[0].geometry.location.lng;
                } else {
                    console.warn(`Geocoding API responded with status: ${geoData.status}`);
                }
            } else {
                console.warn("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set. Using default coordinates.");
            }
        } catch (geoErr) {
            console.error("Geocoding fetch failed, falling back to default coordinates:", geoErr);
        }

        // 3. Create the Restaurant Shell WITH Location Data - Use ADMIN to bypass RLS
        const restaurantId = uuidv4();
        const { error: restError } = await supabaseAdmin.from('Restaurant').insert({
            id: restaurantId,
            ownerId: userId,
            name: restaurantName,
            address: `${address}, ${zip}`,
            city: city,
            state: state,
            lat: lat,
            lng: lng,
            imageUrl: '/restaurant1.jpg',
            plan: plan || 'Flex Options', // Track the chosen plan
            avgPrepTime: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        if (restError) throw restError;

        // 4. Send Confirmation Email
        await sendEmail(
            email,
            "Welcome to TrueServe Partner Network",
            `Hi ${contactName},\n\nThank you for choosing TrueServe! We've received your request to join as a ${plan || 'Partner'} merchant.\n\nYour restaurant "${restaurantName}" has been registered in our system.\n\nBest,\nThe TrueServe Team`
        );

        // 5. Auto-Login Cookie
        const cookieStore = await cookies();
        cookieStore.set("userId", userId, { secure: true, httpOnly: true });

        // 6. STRIPE REDIRECTION LOGIC
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        if (plan === 'Pro Subscription') {
            console.log("[Merchant Signup] Creating Stripe Checkout for Pro Plan...");

            // Create a checkout session for $199/mo (using on-the-fly price if no ID)
            const session = await getStripe().checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'TrueServe Pro Scale Plan',
                            description: '0% Split, VIP Dispatch, Advanced Analytics'
                        },
                        unit_amount: 19900, // $199.00
                        recurring: { interval: 'month' }
                    },
                    quantity: 1,
                }],
                mode: 'subscription',
                success_url: `${baseUrl}/merchant/onboarding-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/merchant/onboarding-failed`,
                metadata: {
                    restaurantId,
                    userId,
                    plan: 'PRO'
                }
            });

            if (session.url) redirect(session.url);
        }

        // Default: Flex / Standard Onboarding
        // Auto-create Stripe account and redirect to onboarding
        await createStripeAccount(userId);

        // This line is technically unreachable due to redirect inside createStripeAccount
        redirect('/merchant/dashboard');

    } catch (e: any) {
        if (e.message?.includes('NEXT_REDIRECT')) throw e; // Let Next.js handle redirects
        console.error("Merchant Signup Error:", e);
        return { message: "An error occurred: " + (e.message || "Unknown error"), error: true };
    }
}

export async function createStripeAccount(providedId?: string | FormData) {
    const cookieStore = await cookies();
    let userId: string | undefined;

    if (typeof providedId === 'string') {
        userId = providedId;
    } else {
        userId = cookieStore.get("userId")?.value;
    }

    if (!userId) {
        if (providedId && typeof providedId === 'string') {
            throw new Error("No User ID for Stripe Account");
        }
        redirect("/login?role=merchant");
    }

    let url = "";
    try {
        // 1. Get Restaurant
        const { data: restaurant } = await supabase
            .from('Restaurant')
            .select('*')
            .eq('ownerId', userId)
            .single();

        if (!restaurant) throw new Error("Restaurant not found");

        let stripeAccountId = restaurant.stripeAccountId;

        // Base URL handling for Vercel/Local
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL
            ? process.env.NEXT_PUBLIC_APP_URL
            : process.env.NEXT_PUBLIC_VERCEL_URL
                ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
                : "http://localhost:3000";

        // 2. Create Stripe Account if missing
        if (!stripeAccountId) {
            const userRes = await supabase.from('User').select('email').eq('id', userId).single();
            const account = await getStripe().accounts.create({
                type: 'express',
                country: 'US',
                email: userRes.data?.email || undefined,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: {
                    restaurantId: restaurant.id,
                    ownerId: userId,
                    role: 'merchant'
                }
            });

            stripeAccountId = account.id;

            // Save to DB
            const { error: updateError } = await supabase
                .from('Restaurant')
                .update({ stripeAccountId })
                .eq('id', restaurant.id);

            if (updateError) throw updateError;
        }

        // 3. Create Account Link
        const accountLink = await getStripe().accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${baseUrl}/merchant/dashboard?stripe=refresh`,
            return_url: `${baseUrl}/merchant/onboarding-success`,
            type: 'account_onboarding',
        });

        url = accountLink.url;

    } catch (e: any) {
        console.error("Merchant Stripe Connect Error:", e);
        throw new Error(`Stripe Generation Failed: ${e.message}`);
    }

    if (url) redirect(url);
}

export async function generateApiKey() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return { error: "Unauthorized" };

    try {
        // Generate a secure random key
        const newKey = `ts_${uuidv4().replace(/-/g, '')}`;

        // Get Restaurant
        const { data: restaurant } = await supabase
            .from('Restaurant')
            .select('id')
            .eq('ownerId', userId)
            .single();

        if (!restaurant) throw new Error("Restaurant not found");

        const { error } = await supabase
            .from('Restaurant')
            .update({
                apiKey: newKey,
                updatedAt: new Date().toISOString()
            })
            .eq('id', restaurant.id);

        if (error) throw error;

        revalidatePath('/merchant/dashboard');
        return { success: true, apiKey: newKey };
    } catch (e: any) {
        console.error("API Key Gen Error:", e);
        return { error: e.message };
    }
}
