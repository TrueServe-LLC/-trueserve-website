"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

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
        // 1. Get the restaurant (Assuming single merchant for now or first one)
        const { data: restaurant, error: rError } = await supabase
            .from('Restaurant')
            .select('id')
            .limit(1)
            .single();

        if (rError || !restaurant) {
            throw new Error("No restaurant found to add item to.");
        }

        // 2. Create the item
        const { error } = await supabase.from('MenuItem').insert({
            name,
            description,
            price,
            imageUrl: imageUrl || "/restaurant1.jpg",
            restaurantId: restaurant.id,
            status: "PENDING"
        });

        if (error) {
            throw error;
        }

        revalidatePath("/merchant/dashboard");
        return { message: "Item added successfully!", success: true };

    } catch (e) {
        console.error("Failed to add item:", e);
        return { message: "Failed to add item. Check database connection.", error: true };
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
