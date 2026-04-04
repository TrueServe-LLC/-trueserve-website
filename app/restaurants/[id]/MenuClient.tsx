"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { placeOrder, createPaymentIntent } from "../actions";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm";
import OrderConfirmAnimation from "@/components/OrderConfirmAnimation";
import AddressInput from "@/components/AddressInput";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
}

interface MenuClientProps {
    userId?: string;
    truePointsBalance?: number;
    restaurant: any;
    items: MenuItem[];
    orderingEnabled: boolean;
    initialAddress?: string;
    initialLat?: number;
    initialLng?: number;
}

export default function MenuClient({
    userId,
    truePointsBalance = 0,
    restaurant,
    items,
    orderingEnabled,
    initialAddress = undefined,
}: MenuClientProps) {
    const router = useRouter();
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [tipPct, setTipPct] = useState(15);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [deliveryAddress, setDeliveryAddress] = useState<string | null>(initialAddress || null);
    const [deliveryLat, setDeliveryLat] = useState<number | null>(null);
    const [deliveryLng, setDeliveryLng] = useState<number | null>(null);
    const [deliveryInstructions, setDeliveryInstructions] = useState("");
    const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
    const [redeemPoints, setRedeemPoints] = useState(false);
    
    // GHL State
    const [isGHLOpen, setIsGHLOpen] = useState(false);
    const [ghlLoading, setGHLLoading] = useState(false);
    
    // Hardcoded GHL demo for Dhan's Kitchen per request
    const ghlUrl = restaurant.name.includes("Dhan") 
        ? "https://api.leadconnectorhq.com/widget/booking/demo-dhans-kitchen"
        : restaurant.ghlUrl; // Assuming fallback to DB field

    const openGHL = () => {
        if(!ghlUrl) {
            alert("No GHL embed configured for this restaurant.");
            return;
        }
        setGHLLoading(true);
        setIsGHLOpen(true);
    };

    // Cart calculations
    const cartItems = Object.entries(cart).filter(([_, qty]) => qty > 0);
    const subtotal = cartItems.reduce((sum, [id, qty]) => {
        const item = items.find(i => i.id === id);
        return sum + (item ? item.price * qty : 0);
    }, 0);
    
    const tax = subtotal * 0.07;
    const tip = subtotal * (tipPct / 100);
    const pointsValue = Math.min(Math.floor(truePointsBalance / 100) * 100, Math.max(0, Math.floor((subtotal + tip - 0.50) * 100)));
    const pointsDiscount = redeemPoints ? pointsValue * 0.01 : 0;
    const total = subtotal + 2.99 + tax + tip - pointsDiscount;

    const handleCartChange = async (newCart: { [key: string]: number }, currentTipPct: number = tipPct) => {
        setCart(newCart);
        const hasItems = Object.values(newCart).some(q => q > 0);
        if (hasItems) {
            const currentTip = subtotal * (currentTipPct / 100);
            const res = await createPaymentIntent(restaurant.id, Object.entries(newCart).map(([id, quantity]) => ({ id, quantity })), currentTip, redeemPoints ? pointsValue : 0);
            if (res.clientSecret) setClientSecret(res.clientSecret);
        } else {
            setClientSecret(null);
        }
    };

    const addItem = (id: string) => {
        handleCartChange({ ...cart, [id]: (cart[id] || 0) + 1 });
    };

    const chgQty = (id: string, d: number) => {
        const newCart = { ...cart };
        newCart[id] = (newCart[id] || 0) + d;
        if (newCart[id] <= 0) delete newCart[id];
        handleCartChange(newCart);
    };

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        if (!deliveryAddress) return alert("Please set a delivery address");
        setIsSubmitting(true);
        const res = await placeOrder(
            restaurant.id,
            cartItems.map(([id, qty]) => {
                const item = items.find(i => i.id === id);
                return { id, quantity: qty, price: item?.price || 0 };
            }),
            paymentIntentId,
            deliveryLat || 0,
            deliveryLng || 0,
            deliveryAddress,
            tip,
            deliveryInstructions,
            redeemPoints ? pointsValue : 0
        );
        if (res.success && res.orderId) setPendingOrderId(res.orderId);
        else alert(res.message || "Failed to place order");
        setIsSubmitting(false);
    };

    return (
        <div className="menu-body">
            {pendingOrderId && (
                <OrderConfirmAnimation
                    restaurantName={restaurant.name}
                    onComplete={() => router.push(`/orders/${pendingOrderId}`)}
                />
            )}

            {/* GHL Modal */}
            {isGHLOpen && (
                <div className="ghl-modal" onClick={() => setIsGHLOpen(false)}>
                    <div className="ghl-card" onClick={e => e.stopPropagation()}>
                        <div className="ghl-hd">
                            <span style={{ fontWeight: 800 }}>{restaurant.name} Assistant</span>
                            <button onClick={() => setIsGHLOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ position: 'relative', flex: 1 }}>
                            {ghlLoading && (
                                <div className="ghl-loading">
                                    <div className="ai-dot" style={{ width: '12px', height: '12px' }}></div>
                                    Connecting to GHL Hive...
                                </div>
                            )}
                            <iframe 
                                src={ghlUrl} 
                                className="ghl-frame"
                                onLoad={() => setGHLLoading(false)}
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="menu-items">
                {ghlUrl && (
                    <button className="ghl-btn" onClick={openGHL}>
                        <span style={{ fontSize: '14px' }}>🤖</span> 
                        Launch GHL Fast Booking/Order Assistant
                    </button>
                )}
                <div className="cat">Main Menu</div>
                {items.map(item => (
                    <div key={item.id} className="m-item">
                        <div>
                            <div className="m-name">{item.name}</div>
                            <div className="m-desc">{item.description}</div>
                        </div>
                        <div className="m-r">
                            <span className="m-price">${item.price.toFixed(2)}</span>
                            <button className="add-btn" onClick={() => addItem(item.id)}>+</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="cart">
                <div className="cart-hd">🛒 Your Order</div>
                <div className="cart-scroll" style={{ flex: 1, overflowY: 'auto' }}>
                    {cartItems.length === 0 ? (
                        <div className="cart-empty">Add items to get started.</div>
                    ) : (
                        cartItems.map(([id, qty]) => {
                            const item = items.find(i => i.id === id);
                            if (!item) return null;
                            return (
                                <div className="ci" key={id}>
                                    <div className="ci-name">{item.name}</div>
                                    <div className="qc">
                                        <button className="qb" onClick={() => chgQty(id, -1)}>−</button>
                                        <span style={{ fontSize: '12px', fontWeight: 700 }}>{qty}</span>
                                        <button className="qb" onClick={() => chgQty(id, 1)}>+</button>
                                    </div>
                                    <span className="ci-p">${(item.price * qty).toFixed(2)}</span>
                                </div>
                            );
                        })
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="cart-ft" style={{ display: 'block', padding: '20px', borderTop: '1px solid var(--border)' }}>
                        <div className="tr"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                        <div className="tr"><span>Delivery Fee</span><span>$2.99</span></div>
                        <div className="tr"><span>Tax (7%)</span><span>${tax.toFixed(2)}</span></div>
                        {redeemPoints && <div className="tr" style={{ color: 'var(--gold)' }}><span>TruePoints</span><span>-${pointsDiscount.toFixed(2)}</span></div>}
                        <div className="tr big"><span>Total</span><span>${total.toFixed(2)}</span></div>

                        {/* Tip Selection */}
                        <div style={{ marginTop: '16px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--t2)', marginBottom: '8px' }}>Tip Your Driver</div>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                {[0, 15, 18, 20].map(p => (
                                    <button 
                                        key={p} 
                                        className={`btn ${tipPct === p ? 'btn-gold' : 'btn-ghost'}`} 
                                        style={{ flex: 1, padding: '4px', fontSize: '11px' }}
                                        onClick={() => setTipPct(p)}
                                    >
                                        {p === 0 ? 'No' : p + '%'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Address Selection */}
                        {!isSubmitting && (
                            <div style={{ marginTop: '16px' }}>
                                <AddressInput 
                                    initialAddress={deliveryAddress || ""} 
                                    onAddressSelect={(addr, lat, lng) => {
                                        setDeliveryAddress(addr);
                                        setDeliveryLat(lat);
                                        setDeliveryLng(lng);
                                    }}
                                />
                            </div>
                        )}

                        {userId ? (
                            clientSecret ? (
                                <div style={{ marginTop: '20px' }}>
                                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                                        <CheckoutForm totalAmount={total} onSuccess={handlePaymentSuccess} disabled={isSubmitting || !deliveryAddress} />
                                    </Elements>
                                </div>
                            ) : (
                                <div style={{ marginTop: '20px', textAlign: 'center', opacity: 0.5, fontSize: '12px' }}>Loading payment session...</div>
                            )
                        ) : (
                            <Link href={`/login?redirect=/restaurants/${restaurant.id}`} className="co-btn" style={{ textAlign: 'center', display: 'block' }}>Sign In to Order</Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

