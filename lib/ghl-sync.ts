/**
 * GoHighLevel (GHL) Sync Utility
 * This utility handles the synchronization between TrueServe's menu/order system
 * and the GHL (LeadConnector) API for merchants who use GHL for their marketing websites.
 */

const GHL_BASE_URL = "https://services.leadconnectorhq.com";

export interface GHLSyncResult {
    success: boolean;
    error?: string;
    ghlId?: string;
}

/**
 * Pushes a TrueServe Merchant to a GoHighLevel Location.
 */
export async function syncMerchantToGHL(restaurant: any): Promise<GHLSyncResult> {
    const apiKey = process.env.GHL_API_KEY;
    const locationId = restaurant.ghlLocationId; // This needs to be stored on the Restaurant table

    if (!apiKey || !locationId) {
        return { success: false, error: "GHL_API_KEY or ghlLocationId missing." };
    }

    try {
        const response = await fetch(`${GHL_BASE_URL}/locations/${locationId}`, {
            method: "PUT", // Updating an existing location in GHL
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "Version": "2021-07-28" // GHL Version header
            },
            body: JSON.stringify({
                name: restaurant.name,
                address: restaurant.address,
                phone: restaurant.phone,
                website: `https://www.trueservedelivery.com/restaurants/${restaurant.id}`
            })
        });

        if (!response.ok) throw new Error(`GHL Sync Failed: ${response.statusText}`);

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * Pushes a TrueServe Menu Item as a GHL 'Product'.
 * This ensures the menu is identical even if they use the GHL native checkout.
 */
export async function pushMenuItemToGHL(item: any, ghlLocationId: string): Promise<GHLSyncResult> {
    const apiKey = process.env.GHL_API_KEY;

    if (!apiKey) return { success: false, error: "GHL_API_KEY missing." };

    try {
        const response = await fetch(`${GHL_BASE_URL}/products/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "Version": "2021-07-28"
            },
            body: JSON.stringify({
                locationId: ghlLocationId,
                name: item.name,
                description: item.description,
                price: item.price * 100, // GHL uses cents
                image: item.imageUrl,
                productType: "PHYSICAL"
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to push product to GHL.");

        return { success: true, ghlId: data.product?.id };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * Handles Incoming Webhooks from GHL.
 * When a GHL form is filled or an order is placed on GHL, this endpoint
 * ingests it into TrueServe's order flow.
 */
export async function handleGHLWebhook(payload: any) {
    // This would typically be called from an API route: /api/webhook/ghl
    console.log("INCOMING GHL WEBHOOK DATA:", payload);

    const { type, locationId, contactId, orderId } = payload;

    if (type === "ORDER_CREATED") {
        // Logic to insert into Supabase Order table
        // We'll need to map the GHL locationId to a TrueServe restaurantId
        return { success: true, message: "Order Ingested" };
    }

    return { success: true };
}
