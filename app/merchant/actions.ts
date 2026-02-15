
"use server";

import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";

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

        const { error } = await supabase
            .from('MenuItem')
            .insert({
                id: uuidv4(),
                restaurantId: restaurant.id,
                name,
                price,
                description,
                status: 'APPROVED', // Assuming MenuItem HAS status based on original seed file
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
        // 1. Create a Supabase Auth User (IAM)
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    displayName: contactName,
                    role: 'MERCHANT'
                }
            }
        });

        if (authError) {
            console.error("Auth Signup Error:", authError);
            return { message: "Signup Failed: " + authError.message, error: true };
        }

        if (!authData.user) {
            return { message: "Something went wrong. Please try again.", error: true };
        }

        const userId = authData.user.id;

        // 2. Create Public User Record
        const { data: existingUser } = await supabase.from('User').select('id').eq('id', userId).maybeSingle();

        if (!existingUser) {
            const { error: userError } = await supabase.from('User').insert({
                id: userId,
                email,
                name: contactName,
                role: 'MERCHANT',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            if (userError) throw userError;
        }

        // Helper: Simple Geocode Lookup for Pilot Cities
        let lat = 35.2271;
        let lng = -80.8431;

        const cityLower = city.trim().toLowerCase();
        if (cityLower.includes('charlotte')) { lat = 35.2271; lng = -80.8431; }
        else if (cityLower.includes('pineville')) { lat = 35.0833; lng = -80.8872; }
        else if (cityLower.includes('rock hill')) { lat = 34.9249; lng = -81.0251; }
        else if (cityLower.includes('ramsey')) { lat = 45.2611; lng = -93.4566; }

        // 3. Create the Restaurant Shell WITH Location Data
        const restaurantId = uuidv4();
        const { error: restError } = await supabase.from('Restaurant').insert({
            id: restaurantId,
            ownerId: userId,
            name: restaurantName,
            address: `${address}, ${zip}`,
            city: city,
            state: state,
            lat: lat,
            lng: lng,
            imageUrl: '/restaurant1.jpg',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        if (restError) throw restError;

        // 4. Send Confirmation Email
        await sendEmail(
            email,
            "Welcome to TrueServe Partner Network",
            `Hi ${contactName},\n\nThank you for choosing TrueServe! We've received your request to join as a ${plan || 'Partner'} merchant.\n\nYour restaurant "${restaurantName}" has been registered in our system.\n\nYou can now log in to your dashboard to complete your profile and start uploading your menu: [Link to Dashboard]\n\nOur onboarding team will review your menu within 24 hours.\n\nBest,\nThe TrueServe Team`
        );

        // 5. Auto-Login Cookie
        const cookieStore = await cookies();
        cookieStore.set("userId", userId, { secure: true, httpOnly: true });

        // revalidatePath('/merchant/dashboard'); // Ensure dashboard is fresh
        return { message: "Account created! Redirecting...", success: true };

    } catch (e: any) {
        console.error("Merchant Signup Error:", e);
        return { message: "An error occurred: " + (e.message || "Unknown error"), error: true };
    }
}

export async function createStripeAccount() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) {
        redirect("/login?role=merchant");
    }

    try {
        // 1. Get Restaurant
        const { data: restaurant } = await supabase
            .from('Restaurant')
            .select('*')
            .eq('ownerId', userId)
            .single();

        if (!restaurant) throw new Error("Restaurant not found");

        let stripeAccountId = restaurant.stripeAccountId;

        // 2. Create Stripe Account if missing
        if (!stripeAccountId) {
            const userRes = await supabase.from('User').select('email').eq('id', userId).single();
            const account = await stripe.accounts.create({
                type: 'express',
                country: 'US',
                email: userRes.data?.email || undefined,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: {
                    restaurantId: restaurant.id,
                    ownerId: userId
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
        const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/merchant/dashboard?stripe=refresh`,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/merchant/onboarding-success`,
            type: 'account_onboarding',
        });

        redirect(accountLink.url);

    } catch (e: any) {
        console.error("Stripe Connect Error:", e);
        // Throw or handle error without returning an object to satisfy form action types
        throw new Error(e.message);
    }
}
