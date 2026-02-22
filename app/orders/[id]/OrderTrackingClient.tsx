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
import ReviewModal from "@/components/ReviewModal";



interface OrderTrackingClientProps {
    order: any;
}

export default function OrderTrackingClient({ order }: OrderTrackingClientProps) {

    const [currentOrder, setCurrentOrder] = useState(order);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    // Initial positions (Ensure numbers)
    const restaurantLat = Number(order.restaurant.lat) || 35.2271;
    const restaurantLng = Number(order.restaurant.lng) || -80.8431;
    const restaurantPos: [number, number] = [restaurantLat, restaurantLng];

    // Driver position
    const driverLoc = order.driver?.currentLocation;
    const driverLat = (driverLoc && driverLoc[0]) ? Number(driverLoc[0]) : restaurantLat;
    const driverLng = (driverLoc && driverLoc[1]) ? Number(driverLoc[1]) : restaurantLng;
    const initialDriverPos: [number, number] = [driverLat, driverLng];

    // Customer Location
    const [customerPos] = useState<[number, number]>(
        (order.deliveryLat && order.deliveryLng)
            ? [Number(order.deliveryLat), Number(order.deliveryLng)]
            : [restaurantPos[0] + 0.015, restaurantPos[1] + 0.015]
    );

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
                const newOrder = payload.new;
                setCurrentOrder((prev: any) => ({ ...prev, ...newOrder }));
                if (newOrder.status === 'DELIVERED') {
                    setTimeout(() => setIsReviewOpen(true), 2000);
                }
            })
            .subscribe();

        // Simulation Loop
        const interval = setInterval(() => {
            setDriverPos(prev => {
                const [lat, lng] = prev;
                let target: [number, number] = restaurantPos;

                if (currentOrder.status === 'PICKED_UP') {
                    target = customerPos;
                } else {
                    // Stay at restaurant if preparing or ready
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
        if (status === 'PICKED_UP') return 4;
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
        doc.text(`Deliver To: ${currentOrder.deliveryAddress || "N/A"}`, 14, 50);

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
            <div className="card p-0 overflow-hidden relative group border border-white/5 shadow-2xl rounded-3xl">
                <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md p-3 md:p-4 rounded-2xl border border-white/10 shadow-lg pointer-events-none">
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Estimated Arrival</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            {currentStep >= 5 ? "Arrived" : "15-20 min"}
                        </p>
                        {currentStep < 5 && (
                            <span className="text-[10px] md:text-sm text-emerald-400 font-bold">({distanceMiles} mi away)</span>
                        )}
                    </div>
                </div>

                <div className="h-[250px] md:h-[400px] w-full relative z-0">
                    <MapWithDirections
                        routeOrigin={{ lat: restaurantPos[0], lng: restaurantPos[1] }}
                        origin={{ lat: driverPos[0], lng: driverPos[1] }}
                        destination={{ lat: customerPos[0], lng: customerPos[1] }}
                        driverRotation={driverBearing}
                        showDriver={true}
                    />
                </div>

                <div className="p-4 md:p-6 bg-slate-900/80 flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-12 items-stretch sm:items-center backdrop-blur-2xl border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-white/10 flex-shrink-0">
                            🏪
                        </div>
                        <div>
                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mb-0.5">Restaurant</p>
                            <p className="font-bold text-xs md:text-sm text-white truncate max-w-[120px] md:max-w-none">{order.restaurant?.name || "Restaurant"}</p>
                            <p className="text-[10px] text-slate-400">{restaurantDistance} miles away</p>
                        </div>
                    </div>

                    {/* Progress Bar Line */}
                    <div className="hidden sm:block flex-1 h-1 bg-white/5 rounded-full overflow-hidden relative">
                        <div
                            className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(255,153,42,0.5)]"
                            style={{ width: `${(currentStep / 5) * 100}%` }}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/20 flex-shrink-0">
                            📍
                        </div>
                        <div>
                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mb-0.5">Destination</p>
                            <p className="font-bold text-xs md:text-sm text-white truncate max-w-[120px] md:max-w-none">{order.deliveryAddress || "Home"}</p>
                            <p className="text-[10px] text-slate-400">Hub</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-primary text-black flex items-center justify-center font-black text-sm shadow-lg shadow-primary/20 flex-shrink-0">
                            {/* Driver Initials */}
                            {currentOrder.driver?.user?.name?.charAt(0) || "D"}
                        </div>
                        <div>
                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mb-0.5">Driver</p>
                            <p className="font-bold text-xs md:text-sm text-white truncate max-w-[120px] md:max-w-none">{currentOrder.driver?.user?.name || "Assigning..."}</p>
                            {currentOrder.driver?.vehicleType && (
                                <p className="text-[10px] text-slate-400 capitalize">{currentOrder.driver.vehicleType} • <span className="text-emerald-400 font-bold">{distanceMiles} mi</span></p>
                            )}
                        </div>
                    </div>

                    {currentOrder.driver?.user?.phone && (
                        <a
                            href={`tel:${currentOrder.driver.user.phone}`}
                            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all"
                            title="Call Driver"
                        >
                            📞
                        </a>
                    )}
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

                        {/* Step 4 */}
                        <div className="flex gap-6 relative">
                            <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center border-4 border-slate-900 z-10 transition-colors ${currentStep >= 4 ? 'bg-primary text-black' : 'bg-slate-800 text-slate-500'}`}>
                                🛵
                            </div>
                            <div className={currentStep >= 4 ? 'opacity-100' : 'opacity-40'}>
                                <p className="font-bold text-lg">Out for Delivery</p>
                                <p className="text-sm text-slate-400">{currentStep === 4 ? "Driver heading your way!" : "Driver picked up your order."}</p>
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
                        <div className="flex justify-between text-emerald-400 font-medium">
                            <span>Driver Tip</span>
                            <span>${(Number(order.tip) || 0).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center font-bold text-xl text-white">
                        <span>Total</span>
                        <span>${((Number(order.total) || 0) + (Number(order.tip) || 0)).toFixed(2)}</span>
                    </div>

                    <button
                        onClick={handleDownloadReceipt}
                        className="w-full btn btn-outline border-white/10 hover:bg-white/5 mt-6 text-xs"
                    >
                        Download PDF Receipt
                    </button>

                    {currentOrder.status === 'DELIVERED' && currentOrder.driverId && (
                        <button
                            onClick={() => setIsReviewOpen(true)}
                            className="w-full btn btn-primary mt-2 text-xs shadow-lg shadow-primary/20"
                        >
                            Rate Driver
                        </button>
                    )}
                </div>
            </div>

            {/* Floating Chat Widget */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
                {isChatOpen && (
                    <div className="w-80 shadow-2xl animate-fade-in-up">
                        <ChatWindow orderId={currentOrder.id} role="CUSTOMER" />
                    </div>
                )}

                <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="btn btn-circle btn-primary h-14 w-14 shadow-lg shadow-primary/20 flex items-center justify-center text-xl hover:scale-110 transition-transform"
                >
                    {isChatOpen ? '✕' : '💬'}
                </button>
            </div>

            {currentOrder.driverId && (
                <ReviewModal
                    isOpen={isReviewOpen}
                    onClose={() => setIsReviewOpen(false)}
                    orderId={currentOrder.id}
                    driverId={currentOrder.driverId}
                    customerId={currentOrder.userId}
                />
            )}
        </div>
    );
}

