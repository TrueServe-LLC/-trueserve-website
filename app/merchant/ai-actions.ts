
"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * AI Menu Importer (Production)
 * Parses an image or text and returns a JSON menu using Gemini 1.5 Flash
 */
export async function scanMenuAction(restaurantId: string, imageBase64: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
        return { success: false, error: "Unauthorized. Please log in." };
    }

    try {
        // SECURITY: Verify user owns this restaurant
        const { data: restaurant } = await supabase
            .from('Restaurant')
            .select('id, ownerId')
            .eq('id', restaurantId)
            .eq('ownerId', userId)
            .single();

        if (!restaurant) {
            return { success: false, error: "Access Denied: You do not own this restaurant." };
        }

        console.log(`[AI Importer] Real Scan started for restaurant ${restaurantId}`);

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // Fallback for demo if key is missing, or return error
            console.warn("GEMINI_API_KEY is missing. Falling back to simulated response for demo.");
            await new Promise(resolve => setTimeout(resolve, 2000));
            return {
                success: true,
                items: [
                    { name: "Crispy Calamari", price: 14.00, description: "Lemon aioli, fresh parsley.", category: "Starters" },
                    { name: "Luxury Wagyu Burger", price: 24.99, description: "Truffle aioli, vintage cheddar.", category: "Mains" },
                    { name: "Warm Lava Cake", price: 9.50, description: "Vanilla bean gelato, berry coulis.", category: "Desserts" }
                ],
                message: "Demo Mode: GEMINI_API_KEY not found. Showing sample items."
            };
        }

        // Prepare context for Gemini 1.5 Flash
        // Strip data:image/png;base64, prefix if present
        const base64Data = imageBase64.includes('base64,')
            ? imageBase64.split('base64,')[1]
            : imageBase64;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Extract all food and drink items from this menu. For each item, provide the 'name', 'price' (as a number), 'description', and 'category' (e.g., Starters, Mains, Desserts, Drinks). Return the data ONLY as a valid JSON array of objects. Do not include any other text." },
                        {
                            inlineData: {
                                mimeType: "image/png",
                                data: base64Data
                            }
                        }
                    ]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

        // Clean markdown backticks if AI returns them
        const cleanedText = rawText.replace(/```json|```/g, "").trim();
        const items = JSON.parse(cleanedText);

        // --- SMART SYNC LOGIC ---
        const { data: currentItems } = await supabase
            .from('MenuItem')
            .select('name, price, description')
            .eq('restaurantId', restaurantId);

        const currentMap = new Map(currentItems?.map(i => [i.name.toLowerCase(), i]));

        const processedItems = items.map((item: any) => {
            const existing = currentMap.get(item.name.toLowerCase());

            if (!existing) {
                return { ...item, changeType: 'NEW' };
            }

            const hasChanged = Number(existing.price) !== Number(item.price) ||
                existing.description !== item.description;

            return {
                ...item,
                changeType: hasChanged ? 'UPDATE' : 'MATCH'
            };
        });

        const newCount = processedItems.filter((i: any) => i.changeType === 'NEW').length;
        const updateCount = processedItems.filter((i: any) => i.changeType === 'UPDATE').length;

        return {
            success: true,
            items: processedItems,
            summary: {
                new: newCount,
                updates: updateCount,
                total: processedItems.length
            },
            message: `Smart Sync: Found ${newCount} new items and ${updateCount} updates!`
        };

    } catch (err: any) {
        console.error("[AI Importer] Error:", err);
        return { success: false, error: err.message };
    }
}

/**
 * Bulk insert/update items found by AI (Smart Sync)
 */
export async function confirmAIImport(restaurantId: string, items: any[]) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        // SECURITY: Verify user owns this restaurant
        const { data: restaurant } = await supabase
            .from('Restaurant')
            .select('id')
            .eq('id', restaurantId)
            .eq('ownerId', userId)
            .single();

        if (!restaurant) return { success: false, error: "Unauthorized" };

        // Fetch existing items to resolve IDs for UPSERT
        const { data: currentItems } = await supabase
            .from('MenuItem')
            .select('id, name')
            .eq('restaurantId', restaurantId);

        const idMap = new Map(currentItems?.map(i => [i.name.toLowerCase(), i.id]));

        const itemsToUpsert = items
            .filter(item => item.changeType !== 'MATCH') // Skip identical
            .map(item => {
                const existingId = idMap.get(item.name.toLowerCase());
                return {
                    id: existingId || undefined, // Supabase will insert if undefined
                    restaurantId,
                    name: item.name,
                    price: Number(item.price) || 0,
                    description: item.description,
                    status: 'APPROVED',
                    updatedAt: new Date().toISOString(),
                    createdAt: existingId ? undefined : new Date().toISOString() // Only set created_at on new
                };
            });

        if (itemsToUpsert.length === 0) {
            return { success: true, message: "No changes needed." };
        }

        const { error } = await supabase
            .from('MenuItem')
            .upsert(itemsToUpsert, { onConflict: 'id' });

        if (error) throw error;

        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
