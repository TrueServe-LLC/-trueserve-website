
"use server";

import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import { sendEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

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

export async function updateOrderStatus(orderId: string, status: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return { error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from('Order')
            .update({ status })
            .eq('id', orderId);

        if (error) throw error;
        revalidatePath('/merchant/dashboard');
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
    const plan = formData.get("plan") as string;

    if (!restaurantName || !contactName || !email || !password) {
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

        // 2. Create Public User Record (if not created by trigger, which we assume it isn't)
        // Check first to avoid duplicates if trigger exists
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

        // 3. Create the Restaurant Shell
        const restaurantId = uuidv4();
        const { error: restError } = await supabase.from('Restaurant').insert({
            id: restaurantId,
            ownerId: userId,
            name: restaurantName,
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
