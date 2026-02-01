"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

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
    if (cartItems.length === 0) {
        return { message: "Your cart is empty.", error: true };
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

        // Fallback to Demo User if not logged in
        if (!user) {
            const { data: newUser, error: createError } = await supabase
                .from('User')
                .insert({
                    id: uuidv4(),
                    email: `customer-${Date.now()}@example.com`,
                    name: "Demo Customer",
                    role: "CUSTOMER",
                    updatedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                })
                .select()
                .single();

            if (createError) throw createError;
            user = newUser;
            // Optionally set cookie here for future? Maybe better not to auto-login guest checkout.
        }

        // 4. Create Order
        const { data: order, error: orderError } = await supabase
            .from('Order')
            .insert({
                userId: user?.id,
                restaurantId: restaurantId,
                total: total,
                status: "PENDING",
                posReference: posReference,
            })
            .select()
            .single();

        if (orderError || !order) {
            throw orderError || new Error("Failed to create order");
        }

        // 5. Create Order Items
        const orderItemsData = cartItems.map(item => ({
            orderId: order.id,
            menuItemId: item.id,
            quantity: item.quantity,
            price: item.price
        }));

        const { error: itemsError } = await supabase
            .from('OrderItem')
            .insert(orderItemsData);

        if (itemsError) {
            console.error("Failed to create order items:", itemsError);
            // In a real app, we might want to rollback the order here
            throw itemsError;
        }

        revalidatePath("/merchant/dashboard");
        revalidatePath("/admin/dashboard");

        return {
            message: "Order placed successfully!",
            success: true,
            orderId: order.id,
            posReference: posReference
        };

    } catch (e) {
        console.error("Failed to place order:", e);
        return { message: "Failed to place order. Please try again.", error: true };
    }
}
