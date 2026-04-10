"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ChatWindow from "@/components/ChatWindow";
import MapWithDirections from "@/components/MapWithDirections";
import ReviewModal from "@/components/ReviewModal";
import { customerCancelOrder, submitOrderIssueProof } from "../actions";

interface OrderTrackingClientProps {
    order: any;
}

export default function OrderTrackingClient({ order }: OrderTrackingClientProps) {
    const [currentOrder, setCurrentOrder] = useState(order);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelComment, setCancelComment] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);
    const [eta, setEta] = useState<string>("Calculating...");
    const [issueType, setIssueType] = useState("Wrong items");
    const [issueDescription, setIssueDescription] = useState("");
    const [issuePhoto, setIssuePhoto] = useState<File | null>(null);
    const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

    const parseCoordinate = (value: unknown): number | null => {
        const num = typeof value === "number" ? value : Number(value);
        return Number.isFinite(num) ? num : null;
    };

    const restaurantLat = parseCoordinate(order.restaurant?.lat);
    const restaurantLng = parseCoordinate(order.restaurant?.lng);
    const driverLat = parseCoordinate(order.driver?.currentLat);
    const driverLng = parseCoordinate(order.driver?.currentLng);
    const deliveryLat = parseCoordinate(order.deliveryLat);
    const deliveryLng = parseCoordinate(order.deliveryLng);

    const [customerPos, setCustomerPos] = useState<[number, number] | null>(
        deliveryLat !== null && deliveryLng !== null ? [deliveryLat, deliveryLng] : null
    );
    const [driverPos, setDriverPos] = useState<[number, number] | null>(
        driverLat !== null && driverLng !== null
            ? [driverLat, driverLng]
            : (restaurantLat !== null && restaurantLng !== null ? [restaurantLat, restaurantLng] : null)
    );
    const [driverBearing, setDriverBearing] = useState(0);
    const routeOrigin =
        restaurantLat !== null && restaurantLng !== null
            ? { lat: restaurantLat, lng: restaurantLng }
            : null;
    const mapDestination =
        customerPos !== null
            ? { lat: customerPos[0], lng: customerPos[1] }
            : null;
    const mapOrigin =
        driverPos !== null
            ? { lat: driverPos[0], lng: driverPos[1] }
            : null;

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
        if (customerPos || !navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCustomerPos([position.coords.latitude, position.coords.longitude]);
            },
            () => {
                console.log("Unable to access geolocation for customer map centering.");
            }
        );
    }, [customerPos]);

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
                    const nextLat = parseCoordinate(lat);
                    const nextLng = parseCoordinate(lng);
                    if (nextLat !== null && nextLng !== null) {
                        setDriverPos(prev => {
                            if (!prev) return [nextLat, nextLng];
                            const bearing = calculateBearing(prev[0], prev[1], nextLat, nextLng);
                            if (bearing !== 0) setDriverBearing(bearing);
                            return [nextLat, nextLng];
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

    const handleSubmitIssue = async () => {
        if (!issueDescription.trim() && !issuePhoto) {
            alert("Please provide details or attach a photo.");
            return;
        }

        setIsSubmittingIssue(true);
        const res = await submitOrderIssueProof(
            currentOrder.id,
            issueType,
            issueDescription,
            issuePhoto
        );
        setIsSubmittingIssue(false);

        if (res.success) {
            setIssueDescription("");
            setIssuePhoto(null);
            alert("Issue submitted. Support and the merchant have been notified.");
        } else {
            alert(res.error || "Failed to submit issue.");
        }
    };

    const openSupport = (prefill?: string) => {
        try {
            window.dispatchEvent(new CustomEvent("ts:support:open", { detail: { prefill } }));
        } catch { }
    };

    return (
        <main id="view-tracking" className="active">
            <div className="track-top">
                <div>
                    <div className="track-label">Order #{currentOrder.id.slice(-6).toUpperCase()} · {currentOrder.restaurant.name}</div>
                    <h2>Track Your Order</h2>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => openSupport(`Hi TrueServe Support — I need help with order ${currentOrder.id}.`)}
                    >
                        Contact Support
                    </button>
                    {['PENDING', 'PREPARING'].includes(currentOrder.status) && (
                        <button className="btn btn-red" onClick={() => setIsCancelModalOpen(true)}>Cancel Order</button>
                    )}
                </div>
            </div>

            <div className="track-grid">
                    {/* LEFT PANEL */}
                    <div className="track-left">
                        <div id="track-map" style={{ height: '300px', backgroundColor: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>
                            {routeOrigin && mapOrigin && mapDestination ? (
                                <MapWithDirections
                                    routeOrigin={routeOrigin}
                                    origin={mapOrigin}
                                    destination={mapDestination}
                                    driverRotation={driverBearing}
                                    showDriver={true}
                                    onDurationUpdate={setEta}
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs uppercase tracking-[0.16em] text-white/45">
                                    Waiting for live location coordinates...
                                </div>
                            )}
                        </div>

                        <div style={{ height: '340px' }}>
                             <ChatWindow orderId={currentOrder.id} role="CUSTOMER" fitContainer />
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
                                        <div className="tl-sub">Estimated arrival: {eta}</div>
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

                        {["DELIVERED", "PICKED_UP", "READY_FOR_PICKUP"].includes(currentOrder.status) && (
                            <div className="driver-box" style={{ marginTop: "12px" }}>
                                <h3>Report Order Issue</h3>
                                <p style={{ fontSize: "12px", color: "var(--t2)", marginBottom: "10px" }}>
                                    Received the wrong order? Send details and an optional photo proof.
                                </p>
                                <select
                                    value={issueType}
                                    onChange={(e) => setIssueType(e.target.value)}
                                    className="bg-transparent border border-white/10 w-full p-2 rounded"
                                    style={{ marginBottom: "10px" }}
                                >
                                    <option value="Wrong items">Wrong items</option>
                                    <option value="Missing items">Missing items</option>
                                    <option value="Damaged order">Damaged order</option>
                                    <option value="Other">Other</option>
                                </select>
                                <textarea
                                    value={issueDescription}
                                    onChange={(e) => setIssueDescription(e.target.value)}
                                    className="bg-transparent border border-white/10 w-full p-2 rounded"
                                    placeholder="Tell us what happened..."
                                    rows={3}
                                />
                                <div style={{ marginTop: "10px", marginBottom: "12px" }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setIssuePhoto(e.target.files?.[0] || null)}
                                    />
                                    {issuePhoto && (
                                        <div style={{ fontSize: "11px", color: "var(--t2)", marginTop: "6px" }}>
                                            Attached: {issuePhoto.name}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="place-btn"
                                    style={{ marginTop: 0 }}
                                    onClick={handleSubmitIssue}
                                    disabled={isSubmittingIssue}
                                >
                                    {isSubmittingIssue ? "Submitting..." : "Submit Issue Report"}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    style={{ width: "100%", marginTop: "10px" }}
                                    onClick={() => openSupport(`I just submitted an issue for order ${currentOrder.id}. I’d like to speak to a human agent.`)}
                                >
                                    Talk to a Human
                                </button>
                            </div>
                        )}
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
