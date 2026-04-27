"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function updateRestaurantPhoto(restaurantId: string, formData: FormData) {
    const file = formData.get("photo") as File | null;
    const urlInput = (formData.get("url") as string || "").trim();

    let imageUrl: string | null = null;

    if (file && file.size > 0) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `restaurants/${restaurantId}/cover.${ext}`;
        const bytes = await file.arrayBuffer();

        const { error: uploadError } = await supabaseAdmin.storage
            .from("banners")
            .upload(path, bytes, { contentType: file.type, upsert: true });

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        const { data: urlData } = supabaseAdmin.storage
            .from("banners")
            .getPublicUrl(path);

        imageUrl = urlData.publicUrl;
    } else if (urlInput) {
        imageUrl = urlInput;
    } else {
        throw new Error("Provide a file or a URL.");
    }

    const { error } = await supabaseAdmin
        .from("Restaurant")
        .update({ imageUrl })
        .eq("id", restaurantId);

    if (error) throw new Error(`DB update failed: ${error.message}`);

    revalidatePath("/restaurants");
    revalidatePath(`/restaurants/${restaurantId}`);
    revalidatePath("/admin/restaurants");
}

export async function updateRestaurantMeta(restaurantId: string, cuisineType: string) {
    const { error } = await supabaseAdmin
        .from("Restaurant")
        .update({ cuisineType: cuisineType.trim() || null })
        .eq("id", restaurantId);

    if (error) throw new Error(`DB update failed: ${error.message}`);

    revalidatePath("/restaurants");
    revalidatePath(`/restaurants/${restaurantId}`);
    revalidatePath("/admin/restaurants");
}
