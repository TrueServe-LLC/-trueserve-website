import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";
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
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <main className="container max-w-5xl py-20">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <Link href="/" className="text-slate-500 hover:text-white transition-colors text-sm mb-2 block">&larr; Back to Home</Link>
                        <h1 className="text-4xl font-bold tracking-tighter">Tracking Order #{order.id.slice(-6).toUpperCase()}</h1>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                        {order.status === 'PENDING' ? 'PREPARING' : order.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <OrderTrackingClient order={order} />
                    </div>

                    <div className="space-y-8">
                        <ChatWindow orderId={order.id} />

                        <div className="card p-7 pb-9 border-primary/20 bg-primary/5 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                            <div className="flex items-center gap-3 mb-5">
                                <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">💎</span>
                                <h3 className="font-black text-[11px] uppercase tracking-[0.25em] text-primary">TrueServe+ Benefit</h3>
                            </div>
                            <p className="text-base text-slate-300 font-medium leading-[1.6] mb-8">Enjoy $0 delivery fees and exclusive perks on every order.</p>
                            <Link href="/benefits" className="w-full btn btn-primary text-black font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl shadow-lg shadow-primary/20">Join Membership</Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
