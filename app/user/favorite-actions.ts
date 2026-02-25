"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function toggleFavorite(restaurantId: string) {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
        return { error: "You must be logged in to save stores." };
    }

    try {
        // Check if already favorited
        const { data: existing } = await supabase
            .from('Favorite')
            .select('id')
            .match({ userId, restaurantId })
            .maybeSingle();

        if (existing) {
            // Remove it
            const { error } = await supabase
                .from('Favorite')
                .delete()
                .eq('id', existing.id);

            if (error) throw error;
            revalidatePath('/restaurants');
            return { success: true, favorited: false };
        } else {
            // Add it
            const { error } = await supabase
                .from('Favorite')
                .insert({
                    userId,
                    restaurantId
                });

            if (error) throw error;
            revalidatePath('/restaurants');
            return { success: true, favorited: true };
        }
    } catch (e: any) {
        console.error("Favorite toggle error:", e);
        return { error: "Failed to update favorites." };
    }
}

export async function getFavorites() {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) return [];

    const { data, error } = await supabase
        .from('Favorite')
        .select('restaurantId');

    if (error) {
        console.error("Get favorites error:", error);
        return [];
    }

    return data.map(f => f.restaurantId);
}
