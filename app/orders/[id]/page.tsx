import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";
import OrderTrackingClient from "./OrderTrackingClient";

async function getOrder(id: string) {
    try {
        const { data: order, error } = await supabase
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
        // Mocking for demo if DB entry missing
        const mockOrder = {
            id: id || "MOCK-123",
            status: "PREPARING",
            createdAt: new Date().toISOString(),
            restaurant: {
                name: "Bella Italia (Demo)",
                lat: 40.7128,
                lng: -74.0060,
                coords: [40.7128, -74.0060]
            },
            driver: {
                user: { name: "Alex (Demo)" },
                currentLat: 40.7128 + 0.01,
                currentLng: -74.0060 + 0.01
            },
            items: []
        };

        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
                <main className="container max-w-5xl py-20">
                    <h1 className="text-3xl font-bold mb-8">Tracking Order #{id.slice(-6).toUpperCase()} (Demo)</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <OrderTrackingClient order={mockOrder} />
                        </div>
                        <div className="space-y-6">
                            <div className="card bg-white/5 border-white/10 p-6">
                                <h3 className="font-bold mb-4">Order Summary</h3>
                                <p className="text-slate-400 text-sm">Demo Mode Active.</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
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

                        <div className="card p-6 border-primary/20 bg-primary/5">
                            <h3 className="font-bold mb-4">TrueServe+ Benefits</h3>
                            <p className="text-sm text-slate-400 mb-6">Enjoy $0 delivery fees and exclusive perks on every order.</p>
                            <button className="w-full btn btn-primary">Join Membership</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
