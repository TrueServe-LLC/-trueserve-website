"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-slate-800 animate-pulse rounded-xl" />
});

interface OrderTrackingClientProps {
    order: any;
}

export default function OrderTrackingClient({ order }: OrderTrackingClientProps) {
    const [currentOrder, setCurrentOrder] = useState(order);
    const [driverPos, setDriverPos] = useState<[number, number]>(
        order.driver?.currentLat
            ? [order.driver.currentLat, order.driver.currentLng]
            : [order.restaurant.lat || 35.2271, order.restaurant.lng || -80.8431]
    );

    // Mock Customer Location (relative to restaurant for demo)
    // In real app, we'd geocode the delivery address
    const [customerPos] = useState<[number, number]>([
        (order.restaurant.lat || 35.2271) + 0.02,
        (order.restaurant.lng || -80.8431) + 0.02
    ]);

    useEffect(() => {
        // Subscribe to Order updates (Realtime)
        const channel = supabase
            .channel(`order-${order.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Order', filter: `id=eq.${order.id}` }, (payload) => {
                setCurrentOrder((prev: any) => ({ ...prev, ...payload.new }));
            })
            .subscribe();

        // Simulate Driver Movement Loop
        const interval = setInterval(() => {
            if (currentOrder.status === 'OUT_FOR_DELIVERY') {
                // Move driver 1% closer to customer every tick
                setDriverPos(prev => {
                    const [lat, lng] = prev;
                    const [destLat, destLng] = customerPos;

                    const dLat = destLat - lat;
                    const dLng = destLng - lng;

                    if (Math.abs(dLat) < 0.0001 && Math.abs(dLng) < 0.0001) return prev; // Arrived

                    return [lat + dLat * 0.05, lng + dLng * 0.05];
                });
            } else if (currentOrder.status === 'PREPARING') {
                // Driver stays at restaurant
                setDriverPos([order.restaurant.lat || 35.2271, order.restaurant.lng || -80.8431]);
            }
        }, 1000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, [order.id, currentOrder.status, customerPos, order.restaurant.lat, order.restaurant.lng]);

    // Calculate progress for timeline
    const getProgressStep = (status: string) => {
        if (status === 'PENDING') return 1;
        if (status === 'PREPARING') return 2;
        if (status === 'READY_FOR_PICKUP') return 3;
        if (status === 'OUT_FOR_DELIVERY') return 4;
        if (status === 'DELIVERED') return 5;
        return 1;
    };

    const currentStep = getProgressStep(currentOrder.status);

    return (
        <div className="space-y-8">
            {/* Map Section */}
            <div className="card p-0 overflow-hidden relative group border border-white/10 shadow-2xl rounded-2xl">
                <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Estimated Arrival</p>
                    <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        {currentStep >= 5 ? "Arrived" : "15-20 min"}
                    </p>
                </div>

                <div className="h-[400px] w-full relative z-0">
                    <LeafletMap
                        center={driverPos}
                        zoom={14}
                        restaurants={[{
                            id: "driver",
                            name: "Driver",
                            coords: driverPos,
                        }, {
                            id: "restaurant",
                            name: order.restaurant.name,
                            coords: [order.restaurant.lat, order.restaurant.lng]
                        }]}
                    />
                </div>

                <div className="p-6 bg-slate-900/50 flex gap-6 md:gap-12 items-center backdrop-blur-md border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                            🏪
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Restaurant</p>
                            <p className="font-bold text-sm">{order.restaurant?.name || "Restaurant"}</p>
                        </div>
                    </div>

                    {/* Progress Bar Line */}
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden relative">
                        <div
                            className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-linear"
                            style={{ width: `${(currentStep / 5) * 100}%` }}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center font-bold text-sm shadow-lg shadow-primary/20">
                            {/* Driver Initials */}
                            {currentOrder.driver?.user?.name?.charAt(0) || "D"}
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Driver</p>
                            <p className="font-bold text-sm">{currentOrder.driver?.user?.name || "Finding driver..."}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline Section */}
            <div className="card p-8 border border-white/10 bg-slate-900/50 backdrop-blur-sm">
                <h3 className="font-bold text-xl mb-8 flex items-center gap-2">
                    <span>📍</span> Order Status
                </h3>
                <div className="space-y-8 relative before:absolute before:inset-0 before:left-[19px] before:w-0.5 before:bg-white/10">

                    {/* Step 1 */}
                    <div className="flex gap-6 relative">
                        <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center border-4 border-slate-900 z-10 transition-colors ${currentStep >= 1 ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
                            ✓
                        </div>
                        <div className={currentStep >= 1 ? 'opacity-100' : 'opacity-40'}>
                            <p className="font-bold text-lg">Order Received</p>
                            <p className="text-sm text-slate-400">{new Date(currentOrder.createdAt).toLocaleTimeString()} - We've sent your order to the kitchen.</p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-6 relative">
                        <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center border-4 border-slate-900 z-10 transition-colors ${currentStep >= 2 ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
                            🔥
                        </div>
                        <div className={currentStep >= 2 ? 'opacity-100' : 'opacity-40'}>
                            <p className="font-bold text-lg">Preparing Food</p>
                            <p className="text-sm text-slate-400">The kitchen is cooking up your meal.</p>
                        </div>
                    </div>

                    {/* Step 4 (Skip 3 usually) */}
                    <div className="flex gap-6 relative">
                        <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center border-4 border-slate-900 z-10 transition-colors ${currentStep >= 4 ? 'bg-primary text-black' : 'bg-slate-800 text-slate-500'}`}>
                            🛵
                        </div>
                        <div className={currentStep >= 4 ? 'opacity-100' : 'opacity-40'}>
                            <p className="font-bold text-lg">Out for Delivery</p>
                            <p className="text-sm text-slate-400">Driver located and heading your way.</p>
                        </div>
                    </div>

                    {/* Step 5 */}
                    <div className="flex gap-6 relative">
                        <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center border-4 border-slate-900 z-10 transition-colors ${currentStep >= 5 ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
                            🏠
                        </div>
                        <div className={currentStep >= 5 ? 'opacity-100' : 'opacity-40'}>
                            <p className="font-bold text-lg">Delivered</p>
                            <p className="text-sm text-slate-400">Enjoy your meal!</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
