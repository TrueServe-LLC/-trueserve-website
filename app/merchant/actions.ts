"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

export type AddItemState = {
    message: string;
    success?: boolean;
    error?: boolean;
};

export async function addMenuItem(prevState: any, formData: FormData): Promise<AddItemState> {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const imageUrl = formData.get("imageUrl") as string;

    if (!name || !price) {
        return { message: "Name and Price are required.", error: true };
    }

    try {
        // 1. Get the restaurant (Assuming single merchant for now or first one)
        // In real app: get userId from session -> find restaurant
        const restaurant = await prisma.restaurant.findFirst();

        if (!restaurant) {
            throw new Error("No restaurant found to add item to.");
        }

        // 2. Create the item
        await prisma.menuItem.create({
            data: {
                name,
                description,
                price,
                imageUrl: imageUrl || "/restaurant1.jpg", // Default placeholder
                restaurantId: restaurant.id,
            },
        });

        revalidatePath("/merchant/dashboard");
        return { message: "Item added successfully!", success: true };

    } catch (e) {
        console.error("Failed to add item:", e);
        // Graceful fallback for demo
        if ((e as any).code === 'P1001' || (e as any).message?.includes("Can't reach database")) {
            return {
                message: "Item simulated! (Database is offline). Refresh to see change (mocked).",
                success: true
            };
        }
        return { message: "Failed to add item. Check database connection.", error: true };
    }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus | string) {
    try {
        await prisma.order.update({
            where: { id: orderId },
            data: { status: status as OrderStatus }
        });
        revalidatePath("/merchant/dashboard");
        return { success: true };
    } catch (e) {
        console.error("Failed to update status", e);
        return { success: false, error: e };
    }
}
export async function refundOrder(orderId: string) {
    try {
        await prisma.order.update({
            where: { id: orderId },
            data: {
                isRefunded: true,
                status: 'CANCELLED'
            } as any
        });
        revalidatePath("/merchant/dashboard");
        return { success: true };
    } catch (e) {
        console.error("Failed to refund order", e);
        return { success: false, error: e };
    }
}
