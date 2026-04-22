"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { syncDriverStoredRating } from "@/lib/driver-metrics";
import { revalidatePath } from "next/cache";

export async function submitReviewWithPhoto(formData: FormData) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("You must be logged in to submit a review.");
        }

        const orderId = formData.get("orderId") as string;
        const driverId = formData.get("driverId") as string;
        const rating = parseInt(formData.get("rating") as string);
        const comment = formData.get("comment") as string;
        const photo = formData.get("photo") as File | null;

        if (!orderId || !driverId || isNaN(rating)) {
            throw new Error("Missing required review data.");
        }

        let photoUrl = null;

        // 1. Handle Photo Upload
        if (photo && photo.size > 0) {
            const fileExt = photo.name.split('.').pop() || 'jpg';
            const fileName = `review_${orderId}_${Date.now()}.${fileExt}`;
            
            const arrayBuffer = await photo.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);

            // Ensure bucket exists
            await supabaseAdmin.storage.createBucket('review_photos', { public: true }).catch(() => {});

            const { error: uploadError } = await supabaseAdmin.storage
                .from('review_photos')
                .upload(fileName, buffer, {
                    contentType: photo.type || 'image/jpeg',
                    upsert: false
                });

            if (uploadError) {
                console.error("Review photo upload failed:", uploadError);
            } else {
                const { data: publicData } = supabaseAdmin.storage.from('review_photos').getPublicUrl(fileName);
                photoUrl = publicData.publicUrl;
            }
        }

        // 2. Insert Review
        const { error: reviewError } = await supabase
            .from('Review')
            .insert({
                orderId,
                driverId,
                customerId: user.id,
                rating,
                comment,
                photoUrl,
                createdAt: new Date().toISOString()
            });

        if (reviewError) {
            console.error("Database error (insert review):", reviewError);
            throw new Error("Failed to save review to database.");
        }

        try {
            await syncDriverStoredRating(driverId);
        } catch (ratingSyncError) {
            console.error("Driver rating sync failed after review insert:", ratingSyncError);
        }

        revalidatePath(`/orders/${orderId}`);
        revalidatePath("/driver/dashboard");
        revalidatePath("/driver/dashboard/ratings");
        return { success: true };
    } catch (e: any) {
        console.error("Submit Review Error:", e);
        return { error: e.message };
    }
}
