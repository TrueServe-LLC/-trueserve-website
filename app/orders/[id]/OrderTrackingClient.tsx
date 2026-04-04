"use client";

import { calculateDistance } from "@/lib/utils";

import { useState, useEffect } from "react";
import Link from 'next/link';

import { supabase } from "@/lib/supabase";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import ChatWindow from "@/components/ChatWindow";


// Google Maps Import
import GoogleMapsMap from "@/components/GoogleMapsMap";
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

    const handleCancelOrder = async () => {
        if (!cancelReason) {
            alert("Please select a reason for cancellation.");
            return;
        }
        
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
        <div className="tracking-wrap shadow">
            {/* LEFT PANEL: INFO */}
            <div className="tracking-info">
                <Link href="/" className="back" style={{ marginBottom: '16px', display: 'block' }}>← Back to Home</Link>
                <div className="order-id">ORDER #{currentOrder.id.slice(-6).toUpperCase()}</div>
                <h2>{currentOrder.restaurant.name}</h2>
                <p className="lead">Estimated arrival: {currentStep >= 5 ? "Delivered" : eta}</p>

                <div className="status-bar">
                    <div className={`sb-step ${currentStep >= 1 ? 'on' : ''}`}></div>
                    <div className={`sb-step ${currentStep >= 2 ? 'on' : ''}`}></div>
                    <div className={`sb-step ${currentStep >= 4 ? 'on' : ''} ${currentStep === 4 ? 'active' : ''}`}></div>
                    <div className={`sb-step ${currentStep >= 5 ? 'on' : ''}`}></div>
                </div>

                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold)', marginTop: '10px', textTransform: 'uppercase' }}>
                    {currentOrder.status === 'PENDING' && "ORDER PLACED"}
                    {currentOrder.status === 'PREPARING' && "KITCHEN IS COOKING"}
                    {currentOrder.status === 'PICKED_UP' && "DRIVER IS HEADING YOUR WAY"}
                    {currentOrder.status === 'DELIVERED' && "ENJOY YOUR MEAL!"}
                </div>

                {currentOrder.driverId && (
                    <div className="driver-card">
                        <div className="driver-img">
                            {currentOrder.driver?.user?.avatarUrl ? (
                                <img src={currentOrder.driver.user.avatarUrl} alt="Driver" />
                            ) : (
                                <div style={{ background: '#222', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                    {currentOrder.driver?.user?.name?.charAt(0) || "D"}
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="driver-name">{currentOrder.driver?.user?.name || "Your Driver"}</div>
                            <div className="driver-star">★ 4.9 • {currentOrder.driver?.vehicleType || "Courier"}</div>
                        </div>
                    </div>
                )}

                <div className="order-items">
                    <h4>Your Order</h4>
                    {currentOrder.items?.map((item: any, i: number) => (
                        <div key={item.id || i} className="o-item">
                            <div><span className="qty">{item.quantity}x</span> {item.menuItem?.name || item.name || "Item"}</div>
                            <div>${Number(item.price).toFixed(2)}</div>
                        </div>
                    ))}
                    
                    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                        <div className="flex justify-between" style={{ fontSize: '14px', fontWeight: 800 }}>
                            <div style={{ color: 'var(--t2)' }}>Total Paid</div>
                            <div>${((Number(currentOrder.total) || 0) + (Number(currentOrder.tip) || 0)).toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                {currentOrder.status === 'DELIVERED' && !isReviewOpen && (
                    <button 
                        onClick={() => setIsReviewOpen(true)}
                        className="place-btn" 
                        style={{ marginTop: '24px', width: '100%' }}
                    >
                        Rate Your Experience
                    </button>
                )}

                {['PENDING', 'PREPARING'].includes(currentOrder.status) && (
                    <button 
                        onClick={() => setIsCancelModalOpen(true)}
                        className="btn btn-ghost" 
                        style={{ marginTop: '24px', width: '100%', color: 'var(--red)', borderColor: 'var(--red)', opacity: 0.6 }}
                    >
                        Cancel Order
                    </button>
                )}
            </div>

            {/* RIGHT PANEL: MAP */}
            <div className="tracking-map">
                {currentOrder.status === 'PICKED_UP' && currentOrder.deliveryPin && (
                    <div style={{ 
                        position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', 
                        zIndex: 10, background: 'rgba(15,18,25,0.9)', border: '1px solid var(--gold)', 
                        padding: '12px 24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' 
                    }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--t2)', letterSpacing: '.1em', marginBottom: '4px' }}>DELIVERY PIN</div>
                        <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--gold)', letterSpacing: '.2em' }}>{currentOrder.deliveryPin}</div>
                    </div>
                )}

                <MapWithDirections
                    routeOrigin={{ lat: restaurantPos[0], lng: restaurantPos[1] }}
                    origin={{ lat: driverPos[0], lng: driverPos[1] }}
                    destination={{ lat: customerPos[0], lng: customerPos[1] }}
                    driverRotation={driverBearing}
                    showDriver={true}
                    onDurationUpdate={setEta}
                />

                {/* Floating Chat Button */}
                <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    style={{
                        position: 'absolute', bottom: '30px', right: '30px', zIndex: 10,
                        width: '56px', height: '56px', borderRadius: '50%', background: 'var(--gold)',
                        border: 'none', color: '#000', fontSize: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    {isChatOpen ? '✕' : '💬'}
                </button>

                {isChatOpen && (
                    <div style={{
                        position: 'absolute', bottom: '100px', right: '30px', zIndex: 11,
                        width: '360px', height: '480px', background: 'var(--card)',
                        border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden',
                        boxShadow: '0 12px 48px rgba(0,0,0,0.6)'
                    }}>
                        <ChatWindow orderId={currentOrder.id} role="CUSTOMER" />
                    </div>
                )}
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

            {isCancelModalOpen && (
                <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.8)', zIndex: 100 }}>
                    <div className="modal-card" style={{ maxWidth: '400px' }}>
                        <h3>Cancel Order?</h3>
                        <p style={{ color: 'var(--t2)', fontSize: '14px', marginBottom: '24px' }}>Please let us know why you need to cancel this order.</p>
                        
                        <div className="fg">
                            <select 
                                value={cancelReason} 
                                onChange={(e) => setCancelReason(e.target.value)}
                                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: 'white' }}
                            >
                                <option value="">Select a reason</option>
                                <option value="Wait time is too long">Wait time is too long</option>
                                <option value="Forgot to add an item">Forgot to add an item</option>
                                <option value="Changed my mind">Changed my mind</option>
                                <option value="Order mistake">Order mistake</option>
                            </select>
                        </div>
                        
                        <div className="flex gap-2" style={{ marginTop: '24px' }}>
                            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setIsCancelModalOpen(false)}>Back</button>
                            <button 
                                className="place-btn" 
                                style={{ flex: 1, background: 'var(--red)', border: 'none' }}
                                onClick={handleCancelOrder}
                                disabled={isCancelling || !cancelReason}
                            >
                                {isCancelling ? "Processing..." : "Confirm Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


