"use client";

import { calculateDistance } from "@/lib/utils";
import { useState, useEffect } from "react";
import Link from 'next/link';
import { supabase } from "@/lib/supabase";
import ChatWindow from "@/components/ChatWindow";
import MapWithDirections from "@/components/MapWithDirections";
import ReviewModal from "@/components/ReviewModal";
import { customerCancelOrder } from "../actions";

interface OrderTrackingClientProps {
    order: any;
}

export default function OrderTrackingClient({ order }: OrderTrackingClientProps) {
    const [currentOrder, setCurrentOrder] = useState(order);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelComment, setCancelComment] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);
    const [eta, setEta] = useState<string>("Calculating...");

    // Positions (Ensure numbers)
    const restaurantLat = Number(order.restaurant.lat) || 35.2271;
    const restaurantLng = Number(order.restaurant.lng) || -80.8431;
    
    const driverLat = order.driver?.currentLat ? Number(order.driver.currentLat) : restaurantLat;
    const driverLng = order.driver?.currentLng ? Number(order.driver.currentLng) : restaurantLng;
    
    const [customerPos] = useState<[number, number]>(
        (order.deliveryLat && order.deliveryLng)
            ? [Number(order.deliveryLat), Number(order.deliveryLng)]
            : [restaurantLat + 0.015, restaurantLng + 0.015]
    );

    const [driverPos, setDriverPos] = useState<[number, number]>([driverLat, driverLng]);
    const [driverBearing, setDriverBearing] = useState(0);

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

        let driverChannel: any;
        if (order.driverId) {
            driverChannel = supabase
                .channel(`driver-loc-${order.driverId}`)
                .on('broadcast', { event: 'location_update' }, (payload) => {
                    const { lat, lng } = payload.payload;
                    if (lat && lng) {
                        setDriverPos(prev => {
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

    const getProgressStep = (status: string) => {
        if (status === 'PENDING') return 1;
        if (status === 'PREPARING') return 2;
        if (status === 'READY_FOR_PICKUP') return 3;
        if (status === 'PICKED_UP') return 4;
        if (status === 'DELIVERED') return 5;
        return 1;
    };
    const currentStep = getProgressStep(currentOrder.status);

    const handleCancelOrder = async () => {
        if (!cancelReason) return;
        setIsCancelling(true);
        const res = await customerCancelOrder(currentOrder.id, cancelReason, cancelComment);
        setIsCancelling(false);
        if (res.success) {
            setIsCancelModalOpen(false);
            window.location.reload();
        } else {
            alert(res.error);
        }
    };

    return (
        <main id="view-tracking" className="active">
            <div style={{ maxWidth: '980px', margin: '0 auto', padding: '34px 24px' }}>
                <div className="track-top">
                    <div>
                        <div className="track-label">Order #{currentOrder.id.slice(-6).toUpperCase()} · {currentOrder.restaurant.name}</div>
                        <h2>Track Your Order</h2>
                    </div>
                    {['PENDING', 'PREPARING'].includes(currentOrder.status) && (
                        <button className="btn btn-red" onClick={() => setIsCancelModalOpen(true)}>Cancel Order</button>
                    )}
                </div>

                <div className="track-grid">
                    {/* LEFT PANEL */}
                    <div className="track-left">
                        <div id="track-map" style={{ height: '300px', backgroundColor: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>
                            <MapWithDirections
                                routeOrigin={{ lat: restaurantLat, lng: restaurantLng }}
                                origin={{ lat: driverPos[0], lng: driverPos[1] }}
                                destination={{ lat: customerPos[0], lng: customerPos[1] }}
                                driverRotation={driverBearing}
                                showDriver={true}
                                onDurationUpdate={setEta}
                            />
                        </div>

                        <div className="chat-box" style={{ height: '320px', display: 'flex', flexDirection: 'column', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                             <ChatWindow orderId={currentOrder.id} role="CUSTOMER" />
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="track-right">
                        <div className="status-box">
                            <h3>Order Status</h3>
                            <div className="tl">
                                <div className={`tl-row ${currentStep >= 1 ? 'done' : ''}`}>
                                    <div className={`tl-dot ${currentStep >= 1 ? 'done' : 'wait'}`}>✓</div>
                                    <div className="tl-body">
                                        <div className="tl-lbl">Order Confirmed</div>
                                        <div className="tl-sub">{new Date(currentOrder.createdAt).toLocaleTimeString()}</div>
                                    </div>
                                </div>
                                <div className={`tl-row ${currentStep >= 2 ? 'done' : currentStep === 1 ? 'live' : ''}`}>
                                    <div className={`tl-dot ${currentStep >= 2 ? 'done' : currentStep === 1 ? 'live' : 'wait'}`}>{currentStep === 1 ? '⟳' : '✓'}</div>
                                    <div className="tl-body">
                                        <div className="tl-lbl">Preparing Your Food</div>
                                        <div className="tl-sub">Kitchen is cooking</div>
                                    </div>
                                </div>
                                <div className={`tl-row ${currentStep >= 4 ? 'done' : currentStep === 3 ? 'live' : ''}`}>
                                    <div className={`tl-dot ${currentStep >= 4 ? 'done' : currentStep === 3 ? 'live' : 'wait'}`}>{currentStep === 3 ? '⟳' : '✓'}</div>
                                    <div className="tl-body">
                                        <div className="tl-lbl">Driver Picked Up</div>
                                        <div className="tl-sub">Heading your way</div>
                                    </div>
                                </div>
                                <div className={`tl-row ${currentStep >= 5 ? 'done' : currentStep === 4 ? 'live' : ''}`}>
                                    <div className={`tl-dot ${currentStep >= 5 ? 'done' : currentStep === 4 ? 'live' : 'wait'}`}>{currentStep === 4 ? '⟳' : '✓'}</div>
                                    <div className="tl-body">
                                        <div className="tl-lbl">Delivered</div>
                                        <div className="tl-sub">Enjoy your meal!</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {currentOrder.driverId && (
                            <div className="driver-box">
                                <h3>Your Driver</h3>
                                <div className="driver-inner">
                                    <div className="d-avatar" style={{ backgroundColor: 'var(--gold)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '50%', fontWeight: 900 }}>
                                        {currentOrder.driver?.user?.name?.charAt(0) || "D"}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="d-name" style={{ fontWeight: 800 }}>{currentOrder.driver?.user?.name || "Marcus T."}</div>
                                        <div className="d-stat" style={{ fontSize: '11px', color: 'var(--t2)' }}>⭐ 4.96 · {currentOrder.driver?.vehicleType}</div>
                                    </div>
                                    <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '6px 11px' }}>📞</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isCancelModalOpen && (
                <div className="overlay" style={{ display: 'flex', position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal" style={{ background: 'var(--card)', padding: '24px', borderRadius: 'var(--radius)', maxWidth: '400px', width: '90%' }}>
                        <h3>Cancel Order?</h3>
                        <p>Please select a reason for cancellation.</p>
                        <select 
                            className="bg-transparent border border-white/10 w-full p-2 rounded mt-4"
                            value={cancelReason} 
                            onChange={(e) => setCancelReason(e.target.value)}
                        >
                            <option value="">Select a reason</option>
                            <option value="Long wait time">Long wait time</option>
                            <option value="Ordered by mistake">Ordered by mistake</option>
                            <option value="Other">Other</option>
                        </select>
                        <div className="flex gap-2 mt-6">
                            <button className="sec-btn flex-1" onClick={() => setIsCancelModalOpen(false)}>Back</button>
                            <button className="place-btn flex-1" onClick={handleCancelOrder} disabled={isCancelling || !cancelReason}>
                                {isCancelling ? "..." : "Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {currentOrder.driverId && (
                <ReviewModal
                    isOpen={isReviewOpen}
                    onClose={() => setIsReviewOpen(false)}
                    orderId={currentOrder.id}
                    driverId={currentOrder.driverId}
                    customerId={currentOrder.userId}
                />
            )}
        </main>
    );
}
