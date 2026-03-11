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
    const [eta, setEta] = useState<string>("Calculating...");

    // Initial positions (Ensure numbers)
    const restaurantLat = Number(order.restaurant.lat) || 35.2271;
    const restaurantLng = Number(order.restaurant.lng) || -80.8431;
    const restaurantPos: [number, number] = [restaurantLat, restaurantLng];

    // Driver position
    const driverLat = order.driver?.currentLat ? Number(order.driver.currentLat) : restaurantLat;
    const driverLng = order.driver?.currentLng ? Number(order.driver.currentLng) : restaurantLng;
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
        // 1. Subscribe to Order updates (Status)
        const orderChannel = supabase
            .channel(`order-track-${order.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Order', filter: `id=eq.${order.id}` }, (payload) => {
                const newOrder = payload.new;
                setCurrentOrder((prev: any) => ({ ...prev, ...newOrder }));
                if (newOrder.status === 'DELIVERED') {
                    setTimeout(() => setIsReviewOpen(true), 2000);
                }
            })
            .subscribe();

        // 2. Subscribe to Driver Location updates via RAMEN Broadcast
        let driverChannel: any;
        if (order.driverId) {
            driverChannel = supabase
                .channel(`driver-loc-${order.driverId}`)
                .on('broadcast', { event: 'location_update' }, (payload) => {
                    const { lat, lng } = payload.payload;
                    if (lat && lng) {
                        setDriverPos(prev => {
                            // Calculate bearing based on previous position
                            const bearing = calculateBearing(prev[0], prev[1], lat, lng);
                            if (bearing !== 0) setDriverBearing(bearing);
                            return [lat, lng];
                        });
                    }
                })
                .subscribe();
        }

        return () => {
            supabase.removeChannel(orderChannel);
            if (driverChannel) supabase.removeChannel(driverChannel);
        };
    }, [order.id, order.driverId]);

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
        <div className="md:space-y-8 flex flex-col min-h-[calc(100vh-80px)] md:min-h-0 bg-slate-950">
            {/* Map Section - Full Bleed on Mobile */}
            <div className="relative w-full h-[55vh] md:h-[400px] md:card md:p-0 md:overflow-hidden md:border md:border-white/5 md:shadow-2xl md:rounded-3xl z-0">
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-black/80 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] text-center w-max max-w-[90%]">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Estimated Arrival</p>
                    <div className="flex items-center justify-center gap-2">
                        <p className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-200">
                            {currentStep >= 5 ? "Delivered" : eta}
                        </p>
                        {currentStep < 5 && (
                            <span className="text-[10px] md:text-sm text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full inline-flex border border-emerald-500/20">{distanceMiles} mi</span>
                        )}
                    </div>
                </div>

                {/* Show Delivery PIN to Customer when out for delivery */}
                {currentOrder.status === 'PICKED_UP' && currentOrder.deliveryPin && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-slate-900 border border-emerald-500/30 p-4 rounded-2xl shadow-2xl flex flex-col items-center animate-fade-in-up md:bottom-10 w-[90%] md:w-auto">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Give this PIN to your driver</p>
                        <div className="flex items-center gap-3">
                            {currentOrder.deliveryPin.split('').map((digit: string, idx: number) => (
                                <div key={idx} className="w-10 h-12 md:w-12 md:h-14 bg-black border border-emerald-500/50 rounded-xl flex items-center justify-center text-2xl font-mono text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                    {digit}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="absolute inset-0 z-0">
                    <MapWithDirections
                        routeOrigin={{ lat: restaurantPos[0], lng: restaurantPos[1] }}
                        origin={{ lat: driverPos[0], lng: driverPos[1] }}
                        destination={{ lat: customerPos[0], lng: customerPos[1] }}
                        driverRotation={driverBearing}
                        showDriver={true}
                        onDurationUpdate={setEta}
                    />
                </div>
            </div>

            {/* Bottom Sheet UI overlaying the map on mobile */}
            <div className="relative z-10 flex-1 -mt-8 md:mt-0 bg-slate-950 md:bg-transparent rounded-t-[2.5rem] md:rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.3)] md:shadow-none border-t border-white/10 md:border-0 pt-2 md:pt-0 px-6 md:px-0 pb-32">
                {/* Mobile Drag Handle */}
                <div className="w-14 h-1.5 bg-white/20 rounded-full mx-auto mb-6 md:hidden"></div>

                {/* Premium Driver Profile Card */}
                {currentOrder.driverId ? (
                    <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl mb-8 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-xl font-black text-black shadow-lg shadow-primary/20 overflow-hidden">
                                    {currentOrder.driver?.user?.name?.charAt(0) || "D"}
                                </div>
                                {/* Online Ping Indicator */}
                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            </div>
                            <div>
                                <p className="font-black text-lg text-white mb-0.5">{currentOrder.driver?.user?.name || "Your Driver"}</p>
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                                    <span className="flex items-center gap-1"><span className="text-primary">★</span> 5.0</span>
                                    <span>•</span>
                                    <span className="capitalize">{currentOrder.driver?.vehicleType || "Vehicle"}</span>
                                    {currentOrder.driver?.licensePlate && (
                                        <>
                                            <span>•</span>
                                            <span className="px-1.5 py-0.5 bg-white/10 rounded uppercase text-[9px] tracking-wider border border-white/10">{currentOrder.driver.licensePlate}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        {currentOrder.driver?.user?.phone && (
                            <a
                                href={`tel:${currentOrder.driver.user.phone}`}
                                className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xl hover:bg-emerald-500 hover:text-black hover:border-emerald-400 transition-all shadow-lg"
                                title="Call Driver"
                            >
                                📞
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-5 mb-8 flex items-center gap-4 animate-pulse">
                        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-lg">
                            🔍
                        </div>
                        <div>
                            <p className="font-bold text-white mb-1">Searching for a Driver...</p>
                            <p className="text-xs text-slate-400">We're finding the best courier for you.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Timeline Section */}
                    <div className="md:col-span-2 card p-8 border border-white/10 bg-slate-900/50 backdrop-blur-sm">
                        <h3 className="font-bold text-xl mb-8 flex items-center gap-2">
                            <span>📍</span> Order Status
                        </h3>
                        <div className="space-y-8 relative before:absolute before:inset-0 before:left-[19px] before:w-0.5 before:bg-white/5">

                            {/* Step 1 */}
                            <div className="flex gap-6 relative">
                                <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center border-[3px] z-10 transition-all duration-700 ${currentStep >= 1 ? 'border-primary bg-primary/20 text-primary shadow-[0_0_15px_rgba(255,153,42,0.3)]' : 'border-white/10 bg-slate-900 text-slate-500'}`}>
                                    {currentStep === 1 ? <span className="animate-pulse">✓</span> : "✓"}
                                </div>
                                <div className={currentStep >= 1 ? 'opacity-100' : 'opacity-40'}>
                                    <p className={`font-bold text-lg ${currentStep === 1 ? 'text-primary' : 'text-white'}`}>Order Received</p>
                                    <p className="text-sm text-slate-400 mt-1">{new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - Sent to kitchen.</p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-6 relative">
                                <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center border-[3px] z-10 transition-all duration-700 ${currentStep >= 2 ? 'border-orange-500 bg-orange-500/20 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'border-white/10 bg-slate-900 text-slate-500'}`}>
                                    {currentStep === 2 ? <span className="animate-pulse">🔥</span> : "🔥"}
                                </div>
                                <div className={currentStep >= 2 ? 'opacity-100' : 'opacity-40'}>
                                    <p className={`font-bold text-lg ${currentStep === 2 ? 'text-orange-400' : 'text-white'}`}>Preparing Food</p>
                                    <p className="text-sm text-slate-400 mt-1">The kitchen is cooking up your meal.</p>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex gap-6 relative">
                                <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center border-[3px] z-10 transition-all duration-700 ${currentStep >= 4 ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 'border-white/10 bg-slate-900 text-slate-500'}`}>
                                    {currentStep === 4 ? <span className="animate-pulse">🛵</span> : "🛵"}
                                </div>
                                <div className={currentStep >= 4 ? 'opacity-100' : 'opacity-40'}>
                                    <p className={`font-bold text-lg ${currentStep === 4 ? 'text-emerald-400' : 'text-white'}`}>Out for Delivery</p>
                                    <p className="text-sm text-slate-400 mt-1">{currentStep === 4 ? "Driver heading your way!" : "Driver has picked up the order."}</p>
                                </div>
                            </div>

                            {/* Step 5 */}
                            <div className="flex gap-6 relative">
                                <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center border-[3px] z-10 transition-all duration-700 ${currentStep >= 5 ? 'border-emerald-500 bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'border-white/10 bg-slate-900 text-slate-500'}`}>
                                    🏠
                                </div>
                                <div className={currentStep >= 5 ? 'opacity-100 flex-1' : 'opacity-40 flex-1'}>
                                    <p className="font-bold text-lg">Delivered</p>
                                    <p className="text-sm text-slate-400 mt-1">Enjoy your meal!</p>
                                    
                                    {/* Proof of Delivery Photo */}
                                    {currentOrder.proofOfDeliveryUrl && (
                                        <div className="mt-4 bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
                                            <div className="p-3 border-b border-white/5 bg-white/5 backdrop-blur-sm flex items-center gap-2">
                                                <span>📸</span>
                                                <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Proof of Delivery</p>
                                            </div>
                                            <img 
                                                src={currentOrder.proofOfDeliveryUrl} 
                                                alt="Delivery Proof" 
                                                className="w-full h-auto aspect-video object-cover"
                                            />
                                        </div>
                                    )}
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

                <div className="fixed bottom-[100px] md:bottom-28 right-6 z-50 flex flex-col items-end gap-3">
                    {isChatOpen && (
                        <div className="w-80 shadow-2xl animate-fade-in-up md:w-96 rounded-3xl overflow-hidden border border-white/10">
                            <ChatWindow orderId={currentOrder.id} role="CUSTOMER" />
                        </div>
                    )}

                    <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className="w-16 h-16 rounded-full bg-slate-900 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-all text-primary relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors"></div>
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
        </div>
    );
}

