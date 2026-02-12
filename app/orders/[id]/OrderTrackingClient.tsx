"use client";

import { calculateDistance } from "@/lib/utils";

import { useState, useEffect } from "react";

import { supabase } from "@/lib/supabase";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import ChatWindow from "@/components/ChatWindow";


// Google Maps Import
import GoogleMapsMap from "@/components/GoogleMapsMap";
import MapWithDirections from "@/components/MapWithDirections";



interface OrderTrackingClientProps {
    order: any;
}

export default function OrderTrackingClient({ order }: OrderTrackingClientProps) {

    const [currentOrder, setCurrentOrder] = useState(order);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Initial positions
    const restaurantPos: [number, number] = [order.restaurant.lat || 35.2271, order.restaurant.lng || -80.8431];
    const initialDriverPos: [number, number] = order.driver?.currentLocation || restaurantPos;

    // Mock Customer Location (nearby for demo)
    const [customerPos] = useState<[number, number]>([
        restaurantPos[0] + 0.015,
        restaurantPos[1] + 0.015
    ]);

    const [driverPos, setDriverPos] = useState<[number, number]>(initialDriverPos);
    const [driverBearing, setDriverBearing] = useState(0);

    // Helper to calculate bearing between two points
    function calculateBearing(startLat: number, startLng: number, destLat: number, destLng: number) {
        const startLatRad = (startLat * Math.PI) / 180;
        const startLngRad = (startLng * Math.PI) / 180;
        const destLatRad = (destLat * Math.PI) / 180;
        const destLngRad = (destLng * Math.PI) / 180;

        const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
        const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
            Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
        const brng = (Math.atan2(y, x) * 180) / Math.PI;
        return (brng + 360) % 360;
    }

    useEffect(() => {
        // Subscribe to Order updates (Realtime)
        const channel = supabase
            .channel(`order-${order.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Order', filter: `id=eq.${order.id}` }, (payload) => {
                setCurrentOrder((prev: any) => ({ ...prev, ...payload.new }));
            })
            .subscribe();

        // Simulation Loop
        const interval = setInterval(() => {
            setDriverPos(prev => {
                const [lat, lng] = prev;
                let target: [number, number] = restaurantPos;

                if (currentOrder.status === 'OUT_FOR_DELIVERY') {
                    target = customerPos;
                } else {
                    // Stay at restaurant if preparing
                    // For demo visual, we can just snap to restaurant if not delivering
                    if (Math.abs(lat - restaurantPos[0]) < 0.0001) return restaurantPos;
                    target = restaurantPos;
                }

                const [destLat, destLng] = target;
                const dLat = destLat - lat;
                const dLng = destLng - lng;
                const dist = Math.sqrt(dLat * dLat + dLng * dLng);

                if (dist < 0.0001) {
                    return prev; // Arrived
                }

                // Update Bearing
                const bearing = calculateBearing(lat, lng, destLat, destLng);
                setDriverBearing(bearing);

                // Move speed (adjust for demo pacing)
                // 0.02 step size is roughly "fast" demo speed
                // Using a smaller fraction of the distance for smooth approach
                const step = 0.02;

                return [lat + dLat * step, lng + dLng * step];
            });
        }, 100); // 10fps update for smoothness

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, [order.id, currentOrder.status, customerPos]);

    // Calculate progress for timeline
    const getProgressStep = (status: string) => {
        if (status === 'PENDING') return 1;
        if (status === 'PREPARING') return 2;
        if (status === 'READY_FOR_PICKUP') return 3;
        if (status === 'OUT_FOR_DELIVERY') return 4;
        if (status === 'DELIVERED') return 5;
        return 1;
    };

    const distanceMiles = calculateDistance(driverPos[0], driverPos[1], customerPos[0], customerPos[1]);
    const restaurantDistance = calculateDistance(restaurantPos[0], restaurantPos[1], customerPos[0], customerPos[1]);




    const currentStep = getProgressStep(currentOrder.status);


    const handleDownloadReceipt = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text("Order Receipt", 14, 22);

        doc.setFontSize(10);
        doc.text(`Order ID: ${currentOrder.id}`, 14, 32);
        doc.text(`Date: ${new Date(currentOrder.createdAt).toLocaleDateString()}`, 14, 38);
        doc.text(`Restaurant: ${currentOrder.restaurant.name}`, 14, 44);

        // Items Table
        const tableColumn = ["Item", "Qty", "Price", "Total"];
        const tableRows: any[] = [];

        currentOrder.items?.forEach((item: any) => {
            const unitPrice = Number(item.price);
            const total = unitPrice * item.quantity;
            const itemData = [
                item.menuItem?.name || item.name || "Item",
                item.quantity,
                `$${unitPrice.toFixed(2)}`,
                `$${total.toFixed(2)}`
            ];
            tableRows.push(itemData);
        });

        // @ts-ignore
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 50,
        });

        // Totals
        // @ts-ignore
        const finalY = (doc as any).lastAutoTable.finalY + 10;

        doc.text(`Subtotal: $${(Number(currentOrder.total) || 0).toFixed(2)}`, 14, finalY);
        doc.text(`Total Paid: $${(Number(currentOrder.total) || 0).toFixed(2)}`, 14, finalY + 6);

        doc.save(`receipt_${currentOrder.id}.pdf`);
    };

    return (
        <div className="space-y-8">
            {/* Map Section */}
            <div className="card p-0 overflow-hidden relative group border border-white/10 shadow-2xl rounded-2xl">
                <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg pointer-events-none">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Estimated Arrival</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            {currentStep >= 5 ? "Arrived" : "15-20 min"}
                        </p>
                        {currentStep < 5 && (
                            <span className="text-sm text-emerald-400 font-medium">({distanceMiles} mi away)</span>
                        )}
                    </div>
                </div>

                <div className="h-[400px] w-full relative z-0">
                    {/* If OUT_FOR_DELIVERY (Step 4), show Route. Otherwise show standard map. */}
                    {currentStep === 4 ? (
                        <MapWithDirections
                            origin={{ lat: driverPos[0], lng: driverPos[1] }}
                            destination={{ lat: customerPos[0], lng: customerPos[1] }}
                            driverRotation={driverBearing}
                        />
                    ) : (
                        <GoogleMapsMap
                            center={driverPos}
                            zoom={14}
                            restaurants={[
                                {
                                    id: "driver",
                                    name: "Driver",
                                    coords: driverPos,
                                    image: "https://cdn-icons-png.flaticon.com/512/3097/3097180.png",
                                    tags: ["Driver"],
                                    rotation: driverBearing
                                },
                                {
                                    id: "restaurant",
                                    name: order.restaurant.name,
                                    coords: [order.restaurant.lat, order.restaurant.lng],
                                    image: order.restaurant.imageUrl,
                                    tags: ["Restaurant"]
                                },
                                // Show Customer pin if not routing
                                {
                                    id: "customer",
                                    name: "You",
                                    coords: customerPos,
                                    image: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                                    tags: ["Delivery Location"]
                                }
                            ]}
                        />
                    )}
                </div>

                <div className="p-6 bg-slate-900/50 flex gap-6 md:gap-12 items-center backdrop-blur-md border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                            🏪
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Restaurant</p>
                            <p className="font-bold text-sm">{order.restaurant?.name || "Restaurant"}</p>
                            <p className="text-xs text-slate-400">{restaurantDistance} miles away</p>
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
                            {currentOrder.driver?.vehicleType && (
                                <p className="text-xs text-slate-400 capitalize">{currentOrder.driver.vehicleType} • <span className="text-emerald-400">{distanceMiles} mi</span></p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Timeline Section */}
                <div className="md:col-span-2 card p-8 border border-white/10 bg-slate-900/50 backdrop-blur-sm">
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

                {/* Order Summary Section */}
                <div className="card p-6 border border-white/10 bg-slate-900/50 backdrop-blur-sm h-fit sticky top-24">
                    <h3 className="font-bold text-xl mb-4 border-b border-white/10 pb-4">Receipt</h3>
                    <div className="space-y-4 mb-6">
                        {order.items?.map((item: any, i: number) => (
                            <div key={item.id || i} className="flex justify-between items-start text-sm">
                                <div className="flex gap-2">
                                    <span className="font-bold text-emerald-400">{item.quantity}x</span>
                                    <span className="text-slate-300">{item.menuItem?.name || item.name || "Item"}</span>
                                </div>
                                <span className="text-slate-400 mono">${Number(item.price).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 pt-4 border-t border-white/10 text-xs text-slate-400">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${(Number(order.total) || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Delivery Fee</span>
                            <span>$0.00</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Service Fee</span>
                            <span>$0.00</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center font-bold text-xl text-white">
                        <span>Total</span>
                        <span>${(Number(order.total) || 0).toFixed(2)}</span>
                    </div>

                    <button
                        onClick={handleDownloadReceipt}
                        className="w-full btn btn-outline border-white/10 hover:bg-white/5 mt-6 text-xs"
                    >
                        Download PDF Receipt
                    </button>
                </div>
            </div>

            {/* Floating Chat Widget */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
                {isChatOpen && (
                    <div className="w-80 shadow-2xl animate-fade-in-up">
                        <ChatWindow orderId={currentOrder.id} />
                    </div>
                )}

                <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="btn btn-circle btn-primary h-14 w-14 shadow-lg shadow-primary/20 flex items-center justify-center text-xl hover:scale-110 transition-transform"
                >
                    {isChatOpen ? '✕' : '💬'}
                </button>
            </div>
        </div>
    );
}

