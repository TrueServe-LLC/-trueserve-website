import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";
import Logo from "@/components/Logo";
import OrderTrackingClient from "./OrderTrackingClient";


import { createClient } from '@supabase/supabase-js';

async function getOrder(id: string) {
    // USE ADMIN CLIENT to bypass RLS for Order Tracking
    const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const { data: order, error } = await adminSupabase
            .from('Order')
            .select(`
                *,
                restaurant:Restaurant(*),
                driver:Driver(
                    *,
                    user:User(*)
                ),
                items:OrderItem(
                    *,
                    menuItem:MenuItem(*)
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error("Supabase Error (getOrder):", error);
            return null;
        }
        return order;
    } catch (e) {
        return null;
    }
}

export default async function OrderTracking({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = await getOrder(id);

    if (!order) {
        return notFound();
    }

    const driverName = order.driver?.user.name || "Michael T.";
    const driverLocation = order.driver?.currentLocation || order.restaurant.coords || [35.2271, -80.8431];

    // Dynamic Center: Driver -> Restaurant -> Default Charlotte
    const mapCenter = order.driver?.currentLat && order.driver?.currentLng
        ? [order.driver.currentLat, order.driver.currentLng] as [number, number]
        : (order.restaurant?.lat && order.restaurant?.lng
            ? [order.restaurant.lat, order.restaurant.lng] as [number, number]
            : [35.2271, -80.8431] as [number, number]);

    return (
        <div className="min-h-screen bg-[#0c0e13] text-white">
            <nav>
                <Logo size="sm" />
            </nav>
            <OrderTrackingClient order={order} />
        </div>
    );
}
