import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Logo from "@/components/Logo";
import OrderTrackingClient from "./OrderTrackingClient";
import SupportWidget from "@/components/SupportWidget";


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

    return (
        <div className="food-app-shell">
            <nav className="food-app-nav">
                <Logo size="sm" />
            </nav>
            <div className="food-app-main">
                <OrderTrackingClient order={order} />
            </div>
            <SupportWidget role="CUSTOMER" />
        </div>
    );
}
