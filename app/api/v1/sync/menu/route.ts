
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { logger } from "@/lib/logger";
import * as Sentry from '@sentry/nextjs';

// Initialize Supabase with Service Role Key for administrative actions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * POS Sync API (Method #1 & #2)
 * Allows external systems to sync menus with TrueServe
 */
export async function POST(req: Request) {
    try {
        const apiKey = req.headers.get("x-api-key");
        if (!apiKey) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
        }

        const body = await req.json();
        const { items } = body; // Array of { name, price, description, posId, imageUrl }

        if (!Array.isArray(items)) {
            return NextResponse.json({ error: "Invalid payload: 'items' must be an array" }, { status: 400 });
        }

        // 1. Resolve Restaurant by API Key
        const { data: restaurant, error: resError } = await supabase
            .from('Restaurant')
            .select('id, name')
            .eq('apiKey', apiKey)
            .single();

        if (resError || !restaurant) {
            return NextResponse.json({ error: "Invalid API Key or Restaurant not found" }, { status: 401 });
        }

        logger.info({ restaurantId: restaurant.id, restaurantName: restaurant.name, itemsCount: items.length }, '[POS Sync] Starting sync');

        const syncResults = {
            updated: 0,
            created: 0,
            errors: 0
        };

        // 2. Process Items (Upsert logic based on posId)
        for (const item of items) {
            try {
                // If the POS system provided a posId, we check if it already exists
                const { data: existingItem } = await supabase
                    .from('MenuItem')
                    .select('id')
                    .eq('restaurantId', restaurant.id)
                    .eq('posId', item.posId)
                    .maybeSingle();

                if (existingItem) {
                    // Update
                    const { error: updateError } = await supabase
                        .from('MenuItem')
                        .update({
                            name: item.name,
                            price: item.price,
                            description: item.description,
                            imageUrl: item.imageUrl,
                            updatedAt: new Date().toISOString()
                        })
                        .eq('id', existingItem.id);

                    if (updateError) throw updateError;
                    syncResults.updated++;
                } else {
                    // Create
                    const { error: insertError } = await supabase
                        .from('MenuItem')
                        .insert({
                            restaurantId: restaurant.id,
                            name: item.name,
                            price: item.price,
                            description: item.description,
                            imageUrl: item.imageUrl,
                            posId: item.posId,
                            status: 'APPROVED',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        });

                    if (insertError) throw insertError;
                    syncResults.created++;
                }
            } catch (itemErr: any) {
                logger.error({ err: itemErr, itemName: item.name }, '[POS Sync] Error processing item');
                Sentry.captureException(itemErr, { extra: { itemName: item.name, restaurantId: restaurant.id } });
                syncResults.errors++;
            }
        }

        return NextResponse.json({
            success: true,
            summary: `Sync complete: ${syncResults.created} created, ${syncResults.updated} updated, ${syncResults.errors} errors.`,
            details: syncResults
        });

    } catch (err: any) {
        logger.error({ err }, "[POS Sync] Global Error");
        Sentry.captureException(err, { tags: { service: 'POS Sync Webhook' } });
        return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
    }
}
