
"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const CATEGORY_NORMALIZATION: Record<string, string> = {
    appetizer: "Starters",
    appetizers: "Starters",
    starter: "Starters",
    starters: "Starters",
    entree: "Mains",
    entrees: "Mains",
    main: "Mains",
    mains: "Mains",
    burger: "Mains",
    burgers: "Mains",
    sandwich: "Sandwiches",
    sandwiches: "Sandwiches",
    dessert: "Desserts",
    desserts: "Desserts",
    drink: "Drinks",
    drinks: "Drinks",
    beverage: "Drinks",
    beverages: "Drinks",
    side: "Sides",
    sides: "Sides",
    salad: "Salads",
    salads: "Salads",
};

function normalizeCategory(category: unknown): string {
    if (typeof category !== "string" || !category.trim()) return "Uncategorized";
    const cleaned = category.trim().toLowerCase().replace(/[^\w\s]/g, "");
    return CATEGORY_NORMALIZATION[cleaned] || category.trim();
}

function normalizePrice(price: unknown): number | null {
    if (typeof price === "number" && Number.isFinite(price)) return Number(price.toFixed(2));
    if (typeof price !== "string") return null;
    const parsed = Number(price.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(parsed)) return null;
    return Number(parsed.toFixed(2));
}

function sanitizeScannedItems(rawItems: unknown[]): any[] {
    return rawItems
        .map((item: any) => {
            const name = typeof item?.name === "string" ? item.name.trim() : "";
            const price = normalizePrice(item?.price);
            if (!name || price === null) return null;

            return {
                name,
                price,
                description: typeof item?.description === "string" ? item.description.trim() : "",
                category: normalizeCategory(item?.category),
            };
        })
        .filter(Boolean);
}

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

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            console.warn("ANTHROPIC_API_KEY is missing. Falling back to simulated response for demo.");
            await new Promise(resolve => setTimeout(resolve, 2000));
            return {
                success: true,
                items: [
                    { name: "Crispy Calamari", price: 14.00, description: "Lemon aioli, fresh parsley.", category: "Starters" },
                    { name: "Luxury Wagyu Burger", price: 24.99, description: "Truffle aioli, vintage cheddar.", category: "Mains" },
                    { name: "Warm Lava Cake", price: 9.50, description: "Vanilla bean gelato, berry coulis.", category: "Desserts" }
                ],
                message: "Demo Mode: ANTHROPIC_API_KEY not found. Showing sample items."
            };
        }

        // Prepare context for Claude 3.5 Sonnet
        const base64Data = imageBase64.includes('base64,')
            ? imageBase64.split('base64,')[1]
            : imageBase64;
            
        // Infer mime type from data URI or default to png
        let mimeType = "image/png";
        if (imageBase64.includes('data:')) {
            mimeType = imageBase64.split(';')[0].split(':')[1];
        }

        const { default: Anthropic } = await import('@anthropic-ai/sdk');
        const anthropic = new Anthropic({ apiKey });

        const prompt = "Extract all food and drink items from this menu. For each item, provide the 'name', 'price' (as a number), 'description', and 'category' (e.g., Starters, Mains, Desserts, Drinks). Return the data ONLY as a valid JSON array of objects. Do not include any other text or markdown.";

        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-latest",
            max_tokens: 4096,
            temperature: 0.1,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: mimeType as any,
                                data: base64Data
                            }
                        }
                    ]
                }
            ]
        });

        const rawText = response.content[0].type === 'text' ? response.content[0].text : "[]";

        // Clean markdown backticks if AI returns them
        let cleanedText = rawText.replace(/```json/i, "").replace(/```/i, "").trim();
        const start = cleanedText.indexOf('[');
        const end = cleanedText.lastIndexOf(']');
        if (start !== -1 && end !== -1) {
            cleanedText = cleanedText.substring(start, end + 1);
        }
        
        const parsedItems = JSON.parse(cleanedText);
        if (!Array.isArray(parsedItems)) {
            return { success: false, error: "AI response format invalid. Please retry with a clearer menu image." };
        }

        const items = sanitizeScannedItems(parsedItems);
        if (items.length === 0) {
            return { success: false, error: "No valid menu items were detected. Try a higher quality image or PDF." };
        }

        // --- SMART SYNC LOGIC ---
        let { data: currentItems } = await supabase
            .from('MenuItem')
            .select('name, price, description, category')
            .eq('restaurantId', restaurantId);

        if (!currentItems) {
            const fallback = await supabase
                .from('MenuItem')
                .select('name, price, description')
                .eq('restaurantId', restaurantId);
            currentItems = fallback.data || [];
        }

        const currentMap = new Map(currentItems?.map(i => [i.name.toLowerCase(), i]));

        const processedItems = items.map((item: any) => {
            const existing = currentMap.get(item.name.toLowerCase());

            if (!existing) {
                return { ...item, changeType: 'NEW' };
            }

            const hasChanged = Number(existing.price) !== Number(item.price) ||
                existing.description !== item.description ||
                normalizeCategory((existing as any).category) !== item.category;

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
                    category: normalizeCategory(item.category),
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

        if (error && error.message?.toLowerCase().includes("category")) {
            const withoutCategory = itemsToUpsert.map(({ category, ...rest }) => rest);
            const fallbackRes = await supabase
                .from('MenuItem')
                .upsert(withoutCategory, { onConflict: 'id' });
            if (fallbackRes.error) throw fallbackRes.error;
        } else if (error) {
            throw error;
        }

        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
