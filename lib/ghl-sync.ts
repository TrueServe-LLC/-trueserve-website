/**
 * GoHighLevel (GHL) Sync Utility
 * This utility handles the synchronization between TrueServe's menu/order system
 * and the GHL (LeadConnector) API for merchants who use GHL for their marketing websites.
 */

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";

export interface GHLSyncResult {
    success: boolean;
    error?: string;
    ghlId?: string;
}

export type GHLLeadType = "DRIVER" | "MERCHANT" | "CUSTOMER";

export type GHLLeadInput = {
    type: GHLLeadType;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    companyName?: string | null;
    source?: string | null;
    tags?: string[];
};

function getGHLToken() {
    return process.env.GHL_PRIVATE_INTEGRATION_TOKEN || process.env.GHL_API_KEY || "";
}

function getGHLLocationId(locationId?: string | null) {
    return locationId || process.env.GHL_LOCATION_ID || "";
}

function getWorkflowId(type: GHLLeadType) {
    if (type === "DRIVER") return process.env.GHL_DRIVER_WORKFLOW_ID || "";
    if (type === "MERCHANT") return process.env.GHL_MERCHANT_WORKFLOW_ID || "";
    return process.env.GHL_CUSTOMER_WORKFLOW_ID || "";
}

function getDefaultTags(type: GHLLeadType) {
    if (type === "DRIVER") return ["TrueServe", "Driver Lead"];
    if (type === "MERCHANT") return ["TrueServe", "Restaurant Lead"];
    return ["TrueServe", "Customer Lead"];
}

function splitName(name?: string | null) {
    const cleaned = (name || "").trim();
    if (!cleaned) return { firstName: "", lastName: "" };
    const parts = cleaned.split(/\s+/);
    return {
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" "),
    };
}

async function addContactToWorkflow(contactId: string, workflowId: string, token: string) {
    const response = await fetch(`${GHL_BASE_URL}/contacts/${contactId}/workflow/${workflowId}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Version": GHL_API_VERSION,
        },
    });

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`GHL workflow sync failed (${response.status}): ${text || response.statusText}`);
    }
}

export async function syncSignupLeadToGHL(input: GHLLeadInput): Promise<GHLSyncResult> {
    const token = getGHLToken();
    const locationId = getGHLLocationId();

    if (!token || !locationId) {
        return { success: false, error: "GHL_PRIVATE_INTEGRATION_TOKEN/GHL_API_KEY or GHL_LOCATION_ID missing." };
    }

    if (!input.email && !input.phone) {
        return { success: false, error: "Lead sync requires at least email or phone." };
    }

    const { firstName, lastName } = splitName(input.name);
    const tags = Array.from(new Set([...getDefaultTags(input.type), ...(input.tags || [])]));

    try {
        const response = await fetch(`${GHL_BASE_URL}/contacts/upsert`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Version": GHL_API_VERSION,
            },
            body: JSON.stringify({
                locationId,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                name: input.name || undefined,
                email: input.email || undefined,
                phone: input.phone || undefined,
                address1: input.address || undefined,
                city: input.city || undefined,
                state: input.state || undefined,
                postalCode: input.postalCode || undefined,
                companyName: input.companyName || undefined,
                source: input.source || "TrueServe Website",
                tags,
            }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.message || data.error || `GHL contact sync failed (${response.status})`);
        }

        const contactId = data.contact?.id || data.id || data.contactId;
        const workflowId = getWorkflowId(input.type);

        if (contactId && workflowId) {
            try {
                await addContactToWorkflow(contactId, workflowId, token);
            } catch (workflowError: any) {
                console.error("[GHL Workflow Sync Error]:", workflowError?.message || workflowError);
            }
        }

        return { success: true, ghlId: contactId };
    } catch (e: any) {
        return { success: false, error: e.message || "GHL lead sync failed." };
    }
}

/**
 * Pushes a TrueServe Merchant to a GoHighLevel Location.
 */
export async function syncMerchantToGHL(restaurant: any): Promise<GHLSyncResult> {
    const apiKey = getGHLToken();
    const locationId = getGHLLocationId(restaurant.ghlLocationId);

    if (!apiKey || !locationId) {
        return { success: false, error: "GHL_PRIVATE_INTEGRATION_TOKEN/GHL_API_KEY or GHL_LOCATION_ID/ghlLocationId missing." };
    }

    try {
        const response = await fetch(`${GHL_BASE_URL}/locations/${locationId}`, {
            method: "PUT", // Updating an existing location in GHL
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "Version": GHL_API_VERSION
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
    const apiKey = getGHLToken();
    const locationId = getGHLLocationId(ghlLocationId);

    if (!apiKey || !locationId) return { success: false, error: "GHL_PRIVATE_INTEGRATION_TOKEN/GHL_API_KEY or GHL_LOCATION_ID/ghlLocationId missing." };

    try {
        const response = await fetch(`${GHL_BASE_URL}/products/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "Version": GHL_API_VERSION
            },
            body: JSON.stringify({
                locationId,
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
