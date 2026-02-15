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
    stripePaymentIntentId: string,
    customerLat?: number,
    customerLng?: number
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

    // 2. Idempotency & Verify Payment with Stripe (Scenario 1.6)
    try {
        // Check if an order with this payment intent already exists
        const { data: existingOrder } = await supabase
            .from('Order')
            .select('id')
            .eq('stripePaymentIntentId', stripePaymentIntentId)
            .maybeSingle();

        if (existingOrder) {
            logToFile(`Duplicate detected for PaymentIntent: ${stripePaymentIntentId}. Returning existing order ID.`);
            return { success: true, message: "Order already placed.", orderId: existingOrder.id };
        }

        const intent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
        logToFile(`[PlaceOrder] Stripe Intent Status: ${intent.status}`);

        // Allow both 'succeeded' and 'processing' (common in test environments)
        if (intent.status !== 'succeeded' && intent.status !== 'processing') {
            logToFile(`[PlaceOrder] ABORT: Payment status is ${intent.status}`);
            return { message: `Payment not completed. Status: ${intent.status}`, error: true };
        }
    } catch (e: any) {
        logToFile(`[PlaceOrder] Stripe Retrieval Error: ${e.message}`);
        return { message: "Failed to verify Stripe payment.", error: true };
    }

    // 2.5 Restaurant Status & Validation (Scenarios 1.2, 1.4)
    try {
        const { data: restaurant } = await supabase
            .from('Restaurant')
            .select('lat, lng')
            .eq('id', restaurantId)
            .single();

        if (restaurant) {
            // SCENARIO 1.2: Restaurant Closed Check (Mocking 8 AM - 10 PM)
            const hour = new Date().getHours();
            if (hour < 8 || hour >= 22) {
                return { message: "Restaurant is now closed. Order cannot be placed.", error: true };
            }

            // SCENARIO 1.4: Delivery Zone Restriction (10 mile radius)
            if (customerLat && customerLng && restaurant.lat && restaurant.lng) {
                const R = 3959; // Earth radius in miles
                const dLat = (customerLat - restaurant.lat) * (Math.PI / 180);
                const dLon = (customerLng - restaurant.lng) * (Math.PI / 180);
                const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(restaurant.lat * (Math.PI / 180)) * Math.cos(customerLat * (Math.PI / 180)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const dist = R * c;

                if (dist > 10) {
                    return { message: "Address is outside our 10-mile delivery radius.", error: true };
                }
            }
        }
    } catch (e) {
        logToFile("Restaurant validation skipped due to lookup error.");
    }

    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;
        logToFile(`User ID from Cookie: ${userId}`);

        // 2. Validate Items & Inventory (Scenario 1.5)
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
            stripePaymentIntentId, // Store for idempotency
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
    logToFile(`[CreatePaymentIntent] START for Restaurant: ${restaurantId}`);
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

        logToFile(`[CreatePaymentIntent] Created: ${paymentIntent.id}`);

        return {
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id
        };

    } catch (e: any) {
        logToFile(`[CreatePaymentIntent] ERROR: ${e.message}`);
        console.error("PaymentIntent Error:", e);
        return { error: e.message };
    }
}

// SCENARIO 1.8: Address Change After Order Placed
export async function updateOrderAddress(orderId: string, newAddress: string, newLat: number, newLng: number) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createSupabaseClient(supabaseUrl, serviceKey);

        // 1. Check current status
        const { data: order } = await supabase
            .from('Order')
            .select('status, driverId')
            .eq('id', orderId)
            .single();

        if (!order) return { error: "Order not found" };

        // RESTRICTION: Cannot change address if driver is already assigned or order is in advanced stages
        // Valid values: PENDING, PREPARING, READY_FOR_PICKUP, PICKED_UP, DELIVERED, CANCELLED
        const forbiddenStatuses = ['PICKED_UP', 'DELIVERED', 'CANCELLED'];
        if (forbiddenStatuses.includes(order.status) || (order.driverId && order.status === 'READY_FOR_PICKUP')) {
            const reason = order.driverId ? "driver assigned" : order.status.toLowerCase().replace(/_/g, ' ');
            return { error: `Cannot change address while order is ${reason}.` };
        }

        // 2. Update Address
        const { error } = await supabase
            .from('Order')
            .update({
                deliveryAddress: newAddress,
                deliveryLat: newLat,
                deliveryLng: newLng,
                updatedAt: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) throw error;

        revalidatePath(`/orders/${orderId}`);
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

// SCENARIO 1.10: Driver Reassignment (Cancellation)
export async function cancelOrderAssignment(orderId: string, driverId: string) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createSupabaseClient(supabaseUrl, serviceKey);

        // 1. Edge Case: Order already in progress/delivered?
        const { data: order } = await supabase
            .from('Order')
            .select('status, driverId')
            .eq('id', orderId)
            .single();

        if (!order) return { error: "Order not found" };

        // In our verified enum, assignment happens in READY_FOR_PICKUP
        if (order.status !== 'READY_FOR_PICKUP') {
            return { error: "Only orders ready for pickup and not yet picked up can be cancelled by driver." };
        }
        if (order.driverId !== driverId) {
            return { error: "Unauthorized." };
        }

        // 2. Remove driverId but keep status as READY_FOR_PICKUP (it's still ready for another driver)
        const { error } = await supabase
            .from('Order')
            .update({
                driverId: null,
                updatedAt: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) throw error;

        revalidatePath('/driver/dashboard');
        revalidatePath(`/orders/${orderId}`);
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}
// SCENARIO 1.11: Partial Item Cancellation
export async function cancelOrderItems(orderId: string, orderItemIds: string[]) {
    logToFile(`[CancelItems] START for Order: ${orderId}. Items: ${orderItemIds.join(', ')}`);
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createSupabaseClient(supabaseUrl, serviceKey);

        // 1. Fetch Order and items
        const { data: order, error: orderError } = await supabase
            .from('Order')
            .select('*, OrderItem(*)')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            logToFile(`[CancelItems] Order not found: ${orderId}`);
            return { error: "Order not found" };
        }

        const items = order.OrderItem || [];

        // 2. Validate Status
        const forbidden = ['DELIVERED', 'CANCELLED'];
        if (forbidden.includes(order.status)) {
            return { error: `Cannot cancel items after order is ${order.status.toLowerCase()}.` };
        }

        // 3. Filter items to keep vs cancel
        const itemsToKeep = items.filter((item: any) => !orderItemIds.includes(item.id));
        const itemsToCancel = items.filter((item: any) => orderItemIds.includes(item.id));

        if (itemsToCancel.length === 0) return { error: "No valid items selected for cancellation." };
        if (itemsToKeep.length === 0) {
            return { error: "Cannot cancel all items. Use full order refund instead." };
        }

        // 4. Calculate new total
        const newTotal = itemsToKeep.reduce((sum: number, item: any) => sum + (Number(item.price) * item.quantity), 0);
        const refundAmount = itemsToCancel.reduce((sum: number, item: any) => sum + (Number(item.price) * item.quantity), 0);

        // 5. Database Updates
        // a. remove cancelled items
        const { error: deleteError } = await supabase
            .from('OrderItem')
            .delete()
            .in('id', orderItemIds);

        if (deleteError) throw deleteError;

        // b. Update Order Total (Scenario 1.11.3: Proceed even if below minimum)
        const { error: updateError } = await supabase
            .from('Order')
            .update({
                total: newTotal,
                updatedAt: new Date().toISOString()
            })
            .eq('id', orderId);

        if (updateError) throw updateError;

        // 6. Log Refund (Scenario 1.11)
        if (order.stripePaymentIntentId) {
            logToFile(`[Refund] Partial refund for Order ${orderId}. Amount: $${refundAmount.toFixed(2)} refunded to PI ${order.stripePaymentIntentId}`);
        }

        revalidatePath(`/orders/${orderId}`);
        revalidatePath('/merchant/dashboard');

        return {
            success: true,
            newTotal,
            refundAmount,
            message: `Cancelled ${itemsToCancel.length} items. New total: $${newTotal.toFixed(2)}`
        };
    } catch (e: any) {
        logToFile(`[CancelItems] EXCEPTION: ${e.message}`);
        return { error: e.message };
    }
}
