"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export type AddItemState = {
    message: string;
    success?: boolean;
    error?: boolean;
};

export async function addMenuItem(prevState: any, formData: FormData): Promise<AddItemState> {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const imageUrl = formData.get("imageUrl") as string;

    if (!name || !price) {
        return { message: "Name and Price are required.", error: true };
    }

    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) {
            return { message: "You must be logged in.", error: true };
        }

        // 1. Get the restaurant owned by the current user
        const { data: restaurant, error: rError } = await supabase
            .from('Restaurant')
            .select('id')
            .eq('ownerId', userId)
            .maybeSingle(); // Use maybeSingle to avoid 406 if none found

        if (rError) {
            console.error("Error fetching restaurant:", rError);
            throw new Error("Database error checking restaurant ownership.");
        }

        if (!restaurant) {
            // Check if they are maybe a 'system' merchant or fallback (for demo purposes)
            // But strict 'live data' request implies we should require ownership.
            return { message: "You do not own a restaurant. Please contact support.", error: true };
        }

        // 2. Create the item
        const { error } = await supabase.from('MenuItem').insert({
            id: require('uuid').v4(),
            name,
            description: description || "",
            price,
            imageUrl: imageUrl || "/restaurant1.jpg",
            restaurantId: restaurant.id,
            // status: "PENDING", // Removing 'status' if it doesn't exist in schema (my previous scrape didn't need it)
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        if (error) {
            console.error("Error adding menu item:", error);
            throw error;
        }

        revalidatePath("/merchant/dashboard");
        return { message: "Item added successfully!", success: true };

    } catch (e: any) {
        console.error("Failed to add item:", e);
        return { message: e.message || "Failed to add item.", error: true };
    }
}

export async function updateOrderStatus(orderId: string, status: string) {
    try {
        const { error } = await supabase
            .from('Order')
            .update({ status })
            .eq('id', orderId);

        if (error) {
            throw error;
        }

        revalidatePath("/merchant/dashboard");
        return { success: true };
    } catch (e) {
        console.error("Failed to update status", e);
        return { success: false, error: e };
    }
}
export async function refundOrder(orderId: string) {
    try {
        const { error } = await supabase
            .from('Order')
            .update({
                isRefunded: true,
                status: 'CANCELLED'
            })
            .eq('id', orderId);

        if (error) {
            throw error;
        }

        revalidatePath("/merchant/dashboard");
        return { success: true };
    } catch (e) {
        console.error("Failed to refund order", e);
        return { success: false, error: e };
    }
}
