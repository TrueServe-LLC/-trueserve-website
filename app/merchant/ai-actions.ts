
"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * AI Menu Importer (Method #4)
 * Parses an image or text and returns a JSON menu
 */
export async function scanMenuAction(restaurantId: string, imageBase64: string) {
    try {
        console.log(`[AI Importer] Scanning menu for restaurant ${restaurantId}`);

        // In a real production app, you would send this to Gemini Pro Vision:
        /*
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=' + process.env.GEMINI_API_KEY, {
            method: 'POST',
            body: JSON.stringify({ ... })
        });
        */

        // MOCK AI RESPONSE (for demonstration)
        // Simulate a 2-second AI processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        const mockExtractedItems = [
            { name: "Luxury Wagyu Burger", price: 24.99, description: "Truffle aioli, vintage cheddar, brioche bun.", category: "Mains" },
            { name: "Hand-Cut Truffle Fries", price: 8.50, description: "Parmesan reggiano and fresh herbs.", category: "Sides" },
            { name: "Signature Bourbon Shake", price: 12.00, description: "Aged bourbon, vanilla bean, smoked caramel.", category: "Drinks" }
        ];

        return {
            success: true,
            items: mockExtractedItems,
            message: "AI Scan Success: We found 3 items on your menu!"
        };

    } catch (err: any) {
        console.error("[AI Importer] Error:", err);
        return { success: false, error: err.message };
    }
}

/**
 * Bulk insert items found by AI
 */
export async function confirmAIImport(restaurantId: string, items: any[]) {
    try {
        const { error } = await supabase.from('MenuItem').insert(
            items.map(item => ({
                restaurantId,
                name: item.name,
                price: item.price,
                description: item.description,
                status: 'APPROVED',
                updatedAt: new Date().toISOString(),
                createdAt: new Date().toISOString()
            }))
        );

        if (error) throw error;

        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
