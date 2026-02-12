"use server";


import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import * as fs from 'fs';
import { cookies } from "next/headers";
import { stripe } from "@/lib/stripe";

function logToFile(msg: string) {
    try {
        const timestamp = new Date().toISOString();
        fs.appendFileSync('order_debug.log', `[${timestamp}] ${msg}\n`);
    } catch (e) {
        // ignore logging errors
    }
}

export type OrderState = {
    message: string;
    success?: boolean;
    error?: boolean;
    orderId?: string;
    posReference?: string;
};

export async function placeOrder(
    restaurantId: string,
    cartItems: { id: string; price: number; quantity: number }[],
    stripePaymentIntentId: string
): Promise<OrderState> {
    logToFile(`[PlaceOrder] START for Restaurant: ${restaurantId}`);

    // 1. Initialize Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        logToFile("ERROR: Missing Environment Variables");
        return { message: "Server Error: Configuration Missing", error: true };
    }

    const supabase = createSupabaseClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false }
    });

    if (cartItems.length === 0) return { message: "Cart is empty.", error: true };
    if (!stripePaymentIntentId) return { message: "Stripe payment reference missing.", error: true };

    // 2. Verify Payment with Stripe
    try {
        const intent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
        if (intent.status !== 'succeeded') {
            return { message: `Payment not completed. Status: ${intent.status}`, error: true };
        }
    } catch (e: any) {
        return { message: "Failed to verify Stripe payment.", error: true };
    }

    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;
        logToFile(`User ID from Cookie: ${userId}`);

        // 2. Validate Items
        const itemIds = cartItems.map(i => i.id);
        const { data: dbItems, error: itemsError } = await supabase
            .from('MenuItem')
            .select('id, price, name')
            .in('id', itemIds);

        if (itemsError || !dbItems) {
            logToFile(`Item Lookup Failed: ${itemsError?.message}`);
            return { message: "Failed to validate items.", error: true };
        }

        let total = 0;
        const verifiedItems = cartItems.map(item => {
            const dbItem = dbItems.find(d => d.id === item.id);
            if (!dbItem) throw new Error(`Item ${item.id} not found`);
            total += Number(dbItem.price) * item.quantity;
            return { ...item, price: dbItem.price };
        });

        // 3. User Resolution
        let finalUserId = userId;

        // Verify User Exists in Public Table
        if (userId) {
            const { data: userExists } = await supabase.from('User').select('id').eq('id', userId).maybeSingle();
            if (!userExists) {
                logToFile(`User ${userId} not found in DB. Falling back to Guest.`);
                finalUserId = undefined; // Trigger fallback
            }
        }

        if (!finalUserId) {
            // Use Guest
            finalUserId = '20a8a062-6f89-4582-8559-2a8131e0bb39';
            // Verify Guest Exists
            const { data: guestUser } = await supabase.from('User').select('id').eq('id', finalUserId).maybeSingle();
            if (!guestUser) {
                // Auto-create guest if missing (Safety Net)
                logToFile("Creating missing Guest User...");
                await supabase.from('User').insert({
                    id: finalUserId,
                    email: 'guest@trueserve.test',
                    name: 'Guest User',
                    role: 'CUSTOMER',
                    updatedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                });
            }
        }

        logToFile(`Final User ID for Order: ${finalUserId}`);
        const posRef = `ORD-${uuidv4().substring(0, 8).toUpperCase()}`;
        const newOrderId = uuidv4();

        // 4. Insert Order
        const { error: insertError } = await supabase.from('Order').insert({
            id: newOrderId,
            userId: finalUserId,
            restaurantId: restaurantId,
            total,
            status: 'PENDING',
            posReference: posRef,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        });

        if (insertError) {
            logToFile(`Order Insert Error: ${insertError.message} / ${insertError.details}`);
            throw new Error(insertError.message);
        }

        // 5. Insert Items
        const orderItems = verifiedItems.map(i => ({
            id: uuidv4(),
            orderId: newOrderId,
            menuItemId: i.id,
            quantity: i.quantity,
            price: i.price
        }));

        const { error: itemsInsertError } = await supabase.from('OrderItem').insert(orderItems);
        if (itemsInsertError) {
            logToFile(`Items Insert Error: ${itemsInsertError.message}`);
            // In production, delete order here
            throw new Error("Failed to save order items.");
        }

        logToFile(`SUCCESS: Order ${newOrderId} created.`);

        revalidatePath("/driver/dashboard");
        revalidatePath("/merchant/dashboard");

        return { success: true, message: "Order placed!", orderId: newOrderId, posReference: posRef };

    } catch (e: any) {
        logToFile(`EXCEPTION: ${e.message}`);
        return { message: e.message || "Order failed.", error: true };
    }
}

export async function createPaymentIntent(restaurantId: string, cartItems: { id: string; quantity: number }[]) {
    try {
        // 1. Get real prices from DB
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createSupabaseClient(supabaseUrl, serviceKey);

        const { data: items } = await supabase
            .from('MenuItem')
            .select('id, price')
            .in('id', cartItems.map(i => i.id));

        if (!items) throw new Error("Could not find menu items");

        const amount = cartItems.reduce((sum, cartItem) => {
            const dbItem = items.find(i => i.id === cartItem.id);
            return sum + (dbItem ? Number(dbItem.price) * cartItem.quantity : 0);
        }, 0);

        // Stripe amounts are in cents
        const amountInCents = Math.round(amount * 100);

        if (amountInCents < 50) throw new Error("Amount must be at least 50 cents");

        // 2. Create Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            metadata: {
                restaurantId,
                itemCount: cartItems.length.toString()
            }
        });

        return {
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id
        };

    } catch (e: any) {
        console.error("PaymentIntent Error:", e);
        return { error: e.message };
    }
}
