"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

export type OrderState = {
    message: string;
    success?: boolean;
    error?: boolean;
    orderId?: string;
    posReference?: string;
};

export async function placeOrder(
    restaurantId: string,
    cartItems: { id: string; price: number; quantity: number }[]
): Promise<OrderState> {
    if (cartItems.length === 0) {
        return { message: "Your cart is empty.", error: true };
    }

    try {
        // 1. Calculate Total
        const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // 2. Generate unique POS Reference (LogKey)
        const posReference = `ORD-${uuidv4().substring(0, 8).toUpperCase()}`;

        // 3. Get or Create a demo User (In real app, get from session)
        let user = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: `customer-${Date.now()}@example.com`,
                    name: "Demo Customer",
                    role: "CUSTOMER"
                }
            });
        }

        // 4. Create Order
        const order = await prisma.order.create({
            data: {
                userId: user.id,
                restaurantId: restaurantId,
                total: total,
                status: OrderStatus.PENDING,
                posReference: posReference,
                items: {
                    create: cartItems.map(item => ({
                        menuItemId: item.id,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        });

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

        // Graceful fallback for demo if DB is offline
        if ((e as any).code === 'P1001' || (e as any).message?.includes("Can't reach database")) {
            return {
                message: "Order Simulated! (Database Offline).",
                success: true,
                posReference: `MOCK-${Math.random().toString(36).substring(7).toUpperCase()}`
            };
        }

        return { message: "Failed to place order. Please try again.", error: true };
    }
}
