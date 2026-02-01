"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import * as fs from 'fs';

export type OrderState = {
    message: string;
    success?: boolean;
    error?: boolean;
    orderId?: string;
    posReference?: string;
};

import { cookies } from "next/headers";

// ...

export async function placeOrder(
    restaurantId: string,
    cartItems: { id: string; price: number; quantity: number }[],
    paymentDetails?: { cardNumber: string; expiry: string; cvc: string }
): Promise<OrderState> {
    console.log(`[PlaceOrder] Received order for restaurant ${restaurantId}`, { count: cartItems.length, payment: paymentDetails ? "Present" : "Missing" });

    if (cartItems.length === 0) {
        return { message: "Your cart is empty.", error: true, success: false };
    }

    if (!paymentDetails || !paymentDetails.cardNumber) {
        return { message: "Payment details are required.", error: true, success: false };
    }

    // SIMULATED PAYMENT PROCESSING
    await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s delay

    // Mock Decline Logic
    if (paymentDetails.cardNumber.endsWith("0000")) {
        return { message: "Payment Declined: Card reported lost or stolen (Mock).", error: true, success: false };
    }

    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        // 1. Calculate Total
        const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // 2. Generate unique POS Reference (LogKey)
        const posReference = `ORD-${uuidv4().substring(0, 8).toUpperCase()}`;

        // 3. Get User
        let user;
        if (userId) {
            const { data } = await supabase.from('User').select('id').eq('id', userId).maybeSingle();
            user = data;
        }

        // Fallback to Public Guest User if not logged in
        if (!user) {
            console.log("[PlaceOrder] No logged in user. Using Public Guest ID.");
            // Hardcoded Public Guest User ID to avoid "Insert User" RLS issues
            user = { id: '20a8a062-6f89-4582-8559-2a8131e0bb39' };
        }

        // 4. Create Order
        console.log(`[PlaceOrder] Creating order for user ${user.id}...`);
        const { data: order, error: orderError } = await supabase
            .from('Order')
            .insert({
                id: uuidv4(),
                userId: user.id,
                restaurantId: restaurantId,
                total: total,
                status: "PENDING",
                posReference: posReference,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .select()
            .single();

        if (orderError || !order) {
            console.error("[PlaceOrder] Order Creation Failed:", orderError);
            try {
                fs.writeFileSync('debug_error.txt', JSON.stringify(orderError, null, 2));
            } catch (fsErr) {
                console.error("Failed to write debug file", fsErr);
            }
            throw new Error(`Failed to create order record: ${orderError?.message || "Unknown error"} - ${orderError?.details || ""}`);
        }

        // 5. Create Order Items
        const orderItemsData = cartItems.map(item => ({
            id: uuidv4(),
            orderId: order.id,
            menuItemId: item.id,
            quantity: item.quantity,
            price: item.price,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        }));

        const { error: itemsError } = await supabase
            .from('OrderItem')
            .insert(orderItemsData);

        if (itemsError) {
            console.error("[PlaceOrder] Order Items Failed:", itemsError);
            // In a real app, delete the order here to rollback
            throw new Error("Failed to add items to order.");
        }

        revalidatePath("/merchant/dashboard");
        revalidatePath("/admin/dashboard");
        revalidatePath("/driver/dashboard");

        console.log(`[PlaceOrder] Success! Order ID: ${order.id}`);

        return {
            message: "Order placed successfully!",
            success: true,
            orderId: order.id,
            posReference: posReference
        };

    } catch (e: any) {
        console.error("[PlaceOrder] Exception:", e);
        return {
            message: e.message || "Failed to place order. Please try again.",
            error: true,
            success: false
        };
    }
}
