"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { placeOrder, createPaymentIntent } from "../actions";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm";
import GoogleMapsMap from "@/components/GoogleMapsMap";
import AddressInput from "@/components/AddressInput";
import FavoriteButton from "@/components/FavoriteButton";
import { useEffect } from "react";
import OrderConfirmAnimation from "@/components/OrderConfirmAnimation";

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
    restaurant: any; // We'll pass the whole restaurant object
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
    initialLat = undefined,
    initialLng = undefined
}: MenuClientProps) {
    const router = useRouter();
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [tip, setTip] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [deliveryAddress, setDeliveryAddress] = useState<string | null>(initialAddress || null);
    const [deliveryLat, setDeliveryLat] = useState<number | null>(initialLat || null);
    const [deliveryLng, setDeliveryLng] = useState<number | null>(initialLng || null);
    const [deliveryInstructions, setDeliveryInstructions] = useState("");
    const [deliveryOption, setDeliveryOption] = useState<"leave" | "hand">("leave");
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
    const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
    
    const [redeemPoints, setRedeemPoints] = useState(false);

    const cartTotalItems = Object.values(cart).reduce((sum, q) => sum + q, 0);
    const rawTotalPrice = Object.entries(cart).reduce((sum, [itemId, quantity]) => {
        const item = items.find(i => i.id === itemId);
        return sum + (item ? Number(item.price) * quantity : 0);
    }, 0);
    
    // Dynamic Points Calculation
    // Never allow a user to spend MORE points than the total price (minus $0.50 Stripe minimum)
    const maxPointsSpendable = Math.max(0, Math.floor((rawTotalPrice + tip - 0.50) * 100));
    const pointsValue = Math.min(Math.floor(truePointsBalance / 100) * 100, maxPointsSpendable);
    
    const pointsDiscountAmount = pointsValue > 0 && redeemPoints ? pointsValue * 0.01 : 0;
    const totalPrice = rawTotalPrice;

    const handleCartChange = async (newCart: { [key: string]: number }, currentTip: number = tip, currentRedeem: boolean = redeemPoints) => {
        setCart(newCart);

        const hasItems = Object.values(newCart).some(q => q > 0);
        if (hasItems) {
            const cartItems = Object.entries(newCart).map(([id, quantity]) => ({ id, quantity }));
            
            // Recalculate max points based on new cart state to pass to backend immediately
            const rawNewTotal = cartItems.reduce((sum, cartItem) => {
                const i = items.find(itemObj => itemObj.id === cartItem.id);
                return sum + (i ? Number(i.price) * cartItem.quantity : 0);
            }, 0);
            
            const newMaxPoints = Math.max(0, Math.floor((rawNewTotal + currentTip - 0.50) * 100));
            const newPointsValue = Math.min(Math.floor(truePointsBalance / 100) * 100, newMaxPoints);
            const pointsToSpend = currentRedeem ? newPointsValue : 0;

            const res = await createPaymentIntent(restaurant.id, cartItems, currentTip, pointsToSpend);
            
            console.log("[Stripe] createPaymentIntent response received", { hasSecret: !!res.clientSecret });
            if (res.clientSecret) {
                setClientSecret(res.clientSecret);
                console.log("[Stripe] Client secret set in state");
            }
        } else {
            setClientSecret(null);
        }
    };

    const addToCart = (itemId: string) => {
        const newCart = {
            ...cart,
            [itemId]: (cart[itemId] || 0) + 1
        };
        handleCartChange(newCart, tip, redeemPoints);
    };

    const removeFromCart = (itemId: string) => {
        const newCart = { ...cart };
        if (newCart[itemId] > 1) {
            newCart[itemId]--;
        } else {
            delete newCart[itemId];
        }
        handleCartChange(newCart, tip, redeemPoints);
    };

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        setIsSubmitting(true);
        const cartItems = Object.entries(cart).map(([id, quantity]) => {
            const item = items.find(i => i.id === id);
            return { id, quantity, price: item ? Number(item.price) : 0 };
        });

        if (!deliveryAddress || !deliveryLat || !deliveryLng) {
            alert("Please select a delivery address.");
            setIsSubmitting(false);
            return;
        }

        const pointsToSpend = redeemPoints ? pointsValue : 0;

        const response = await placeOrder(
            restaurant.id,
            cartItems,
            paymentIntentId,
            deliveryLat,
            deliveryLng,
            deliveryAddress,
            tip,
            `[Method: ${deliveryOption === 'leave' ? 'Leave at Door' : 'Hand it to me'}] ${deliveryInstructions}`,
            pointsToSpend
        );

        if (response.success && response.orderId) {
            setCart({});
            setClientSecret(null);
            setPendingOrderId(response.orderId);
        } else {
            alert(response.message || "Failed to finalize order");
            setIsSubmitting(false);
        }
    };

    // Success view removed in favor of animated transition

    return (
        <>
        {pendingOrderId && (
            <OrderConfirmAnimation
                restaurantName={restaurant.name}
                onComplete={() => router.push(`/orders/${pendingOrderId}`)}
            />
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start md:mt-0 -mt-6">
            {/* Busy Mode Alert */}
            {restaurant.isBusy && (
                <div className="col-span-1 md:col-span-3 bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse mb-4">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-red-500/30">🔥</div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-white mb-1 tracking-tight">Operating at Capacity</h2>
                            <p className="text-slate-400 text-sm font-medium">This restaurant is currently overwhelmed and has paused new orders to maintain quality.</p>
                        </div>
                    </div>
                    <div className="px-6 py-2 bg-red-500/20 rounded-full border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                        Paused Temporarily
                    </div>
                </div>
            )}

            {/* Menu Section */}
            <div className={`md:col-span-2 ${restaurant.isBusy ? 'opacity-40 grayscale pointer-events-none transition-all' : ''}`}>

                {/* Mobile Tabs */}
                <div className="md:hidden flex gap-8 mb-6 border-b border-white/10 pb-0">
                    <button className="text-secondary font-black relative pb-3 after:absolute after:bottom-[-1px] after:left-0 after:w-full after:h-0.5 after:bg-secondary">
                        Menu
                    </button>
                    <button className="text-slate-500 font-bold hover:text-white transition-colors pb-3">
                        Reviews
                    </button>
                </div>

                <div className="hidden md:block mb-12 animate-fade-in">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-3 opacity-60 italic">
                        {restaurant.name} • {restaurant.address}
                    </p>
                    <h2 className="text-4xl md:text-7xl font-black text-white font-serif leading-tight tracking-tighter italic drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        Menu Highlights
                    </h2>
                </div>
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="group relative py-10 border-b border-white/5 flex items-center justify-between gap-8 transition-all hover:bg-white/[0.01] px-4 -mx-4 rounded-3xl">
                            <div className="flex items-center gap-8 flex-1">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-gradient-to-br from-slate-800 to-black shrink-0 relative overflow-hidden flex items-center justify-center shadow-2xl border border-white/5 group-hover:border-primary/30 transition-all duration-700 aspect-square">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-cover transform scale-110 group-hover:scale-125 transition-transform duration-1000 ease-out" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 group-hover:bg-primary/5 transition-colors">
                                            <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all opacity-20 group-hover:opacity-100 group-hover:scale-110 duration-500">🍽️</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-black text-xl md:text-2xl text-primary group-hover:text-white transition-colors leading-tight italic tracking-tight">{item.name}</h3>
                                        <span className="font-black text-xl md:text-2xl text-white tracking-tighter whitespace-nowrap ml-4">${Number(item.price).toFixed(2)}</span>
                                    </div>
                                    <p className="text-sm md:text-base text-slate-500 line-clamp-2 leading-relaxed font-medium group-hover:text-slate-400 transition-colors max-w-xl">{item.description}</p>
                                </div>
                            </div>
                            <div className="shrink-0 flex items-center pl-4">
                                {cart[item.id] > 0 ? (
                                    <div className="flex items-center gap-4 bg-primary/10 rounded-full px-2 py-1 border border-primary/20 shadow-2xl backdrop-blur-xl">
                                        <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white font-black text-lg">-</button>
                                        <span className="font-black w-4 text-center text-sm text-primary">{cart[item.id]}</span>
                                        <button onClick={() => addToCart(item.id)} className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center hover:scale-110 transition-all font-black text-lg shadow-lg shadow-primary/20">+</button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => addToCart(item.id)}
                                        className="px-8 py-3 border border-white/20 rounded-xl text-[10px] text-white font-black uppercase tracking-[0.25em] hover:border-primary hover:text-primary hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl bg-black/40 backdrop-blur-sm whitespace-nowrap italic"
                                    >
                                        Add to Order
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="col-span-1 p-8 text-center bg-slate-900/50 rounded-2xl border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-2">No Menu Available</h3>
                            <p className="text-slate-400">This restaurant has not published their menu yet. Please check back later.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-8 md:sticky md:top-24">
                <div className="card p-8 bg-slate-900/40 border-white/5 shadow-3xl backdrop-blur-2xl rounded-[3rem]">
                    {/* TrueServe+ Promo */}
                    <Link href="/benefits" className="block mb-10 p-12 rounded-[2.5rem] bg-[#0a0f1a] border border-white/5 hover:border-primary/40 transition-all group relative shadow-2xl text-center overflow-hidden">
                        <div className="absolute inset-0 bg-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col items-center gap-6">
                            <div className="text-5xl filter transition-all group-hover:scale-110 drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">💎</div>
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-primary/70 block mb-4 italic">TrueServe+ Benefit</span>
                                <p className="text-2xl text-white font-black font-serif leading-tight max-w-[200px] mx-auto italic">
                                    Zero delivery fees on this order.
                                </p>
                            </div>
                            <div className="w-full border border-primary/30 text-primary py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl group-hover:bg-primary group-hover:text-black transition-all duration-500 italic">
                                Explore Benefits &rarr;
                            </div>
                        </div>
                    </Link>

                    <div className="mb-10 group bg-black/20 p-8 rounded-[2rem] border border-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-500 italic">
                                Delivery Destination
                            </h3>
                            {!deliveryAddress && (
                                <span className="text-[9px] font-black text-red-500 animate-pulse uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">Required</span>
                            )}
                        </div>
                        <AddressInput
                            initialAddress={deliveryAddress || ""}
                            onAddressSelect={(addr, lat, lng) => {
                                setDeliveryAddress(addr);
                                setDeliveryLat(lat);
                                setDeliveryLng(lng);
                            }}
                        />
                        {deliveryAddress && (
                            <div className="mt-6 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 animate-fade-in relative overflow-hidden group/addr">
                                <div className="absolute top-0 right-0 p-4 opacity-5 text-2xl">📍</div>
                                <p className="text-[9px] text-emerald-400 font-black uppercase tracking-[0.3em] mb-2 opacity-60 italic">Confirming Address:</p>
                                <p className="text-xs text-white font-black leading-relaxed break-words italic">{deliveryAddress}</p>
                            </div>
                        )}
                        <div className="mt-10 mb-10">
                            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-6 italic">
                                Delivery Method
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setDeliveryOption('leave')}
                                    className={`p-6 rounded-[2rem] border transition-all text-left relative overflow-hidden group/opt ${deliveryOption === 'leave' ? 'bg-primary/10 border-primary ring-1 ring-primary/20' : 'bg-white/[0.03] border-white/5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'}`}
                                >
                                    <div className="text-3xl mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">🚪</div>
                                    <h4 className={`font-black text-[11px] uppercase tracking-[0.2em] italic ${deliveryOption === 'leave' ? 'text-primary' : 'text-white'}`}>Leave at door</h4>
                                    <p className="text-[9px] text-slate-500 font-bold mt-2 uppercase tracking-widest">No-contact</p>
                                    {deliveryOption === 'leave' && <div className="absolute top-4 right-4 text-primary text-xs">✓</div>}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeliveryOption('hand')}
                                    className={`p-6 rounded-[2rem] border transition-all text-left relative overflow-hidden group/opt ${deliveryOption === 'hand' ? 'bg-primary/10 border-primary ring-1 ring-primary/20' : 'bg-white/[0.03] border-white/5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'}`}
                                >
                                    <div className="text-3xl mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">🤝</div>
                                    <h4 className={`font-black text-[11px] uppercase tracking-[0.2em] italic ${deliveryOption === 'hand' ? 'text-primary' : 'text-white'}`}>Hand it to me</h4>
                                    <p className="text-[9px] text-slate-500 font-bold mt-2 uppercase tracking-widest">Meet outside</p>
                                    {deliveryOption === 'hand' && <div className="absolute top-4 right-4 text-primary text-xs">✓</div>}
                                </button>
                            </div>
                        </div>

                        <div className="mt-10">
                            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-6 italic">
                                Delivery Instructions
                            </h3>
                            <textarea
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-sm font-medium focus:border-primary/50 focus:bg-white/[0.06] outline-none transition-all min-h-[120px] text-white placeholder:text-slate-700 leading-relaxed italic"
                                placeholder='"Leave at front door," "Gate code 1234," "Blue house with white fence"'
                                value={deliveryInstructions}
                                onChange={(e) => setDeliveryInstructions(e.target.value)}
                            />
                        </div>
                    </div>

                    <h3 className="font-black mb-8 text-2xl flex items-center justify-between text-white border-b border-white/5 pb-6 italic">
                        <span className="flex items-center gap-4"><span className="text-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">🛒</span> Your Order</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">{cartTotalItems} Items</span>
                    </h3>

                    {cartTotalItems === 0 ? (
                        <div className="text-center py-8 opacity-50">
                            <p className="mb-2">Your cart is empty</p>
                            <p className="text-xs">Add items to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-4 mb-8 max-h-80 overflow-y-auto pr-3 custom-scrollbar">
                            {Object.entries(cart).map(([id, quantity]) => {
                                const item = items.find(i => i.id === id);
                                if (!item) return null;
                                return (
                                    <div key={id} className="flex justify-between items-center text-sm group/cart">
                                        <div className="flex-grow">
                                            <span className="font-black text-white block truncate max-w-[180px] italic">{item.name}</span>
                                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Quantity: {quantity}</span>
                                        </div>
                                        <span className="font-black text-white tracking-tighter text-base italic">${(Number(item.price) * quantity).toFixed(2)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="space-y-3 text-sm border-t border-white/10 pt-4">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Subtotal</span>
                            <span className="font-bold">${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Delivery Fee</span>
                            <span className="font-bold text-emerald-400">FREE</span>
                        </div>

                        {/* TIP SELECTION */}
                        <div className="pt-4 border-t border-white/5 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Driver Tip</span>
                                <span className="font-bold text-white">${tip.toFixed(2)}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {[3, 5, 7].map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => {
                                            setTip(amount);
                                            handleCartChange(cart, amount);
                                        }}
                                        className={`py-2 rounded-lg text-xs font-bold transition-all ${tip === amount ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                                    >
                                        ${amount}
                                    </button>
                                ))}
                                <button
                                    onClick={() => {
                                        const custom = prompt("Enter custom tip amount:");
                                        if (custom && !isNaN(Number(custom))) {
                                            const val = Math.max(0, Number(custom));
                                            setTip(val);
                                            handleCartChange(cart, val);
                                        }
                                    }}
                                    className={`py-2 rounded-lg text-[10px] uppercase font-bold transition-all ${![3, 5, 7, 0].includes(tip) ? 'bg-primary text-black' : 'bg-white/5 text-slate-400'}`}
                                >
                                    Custom
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-500 italic">100% of tips go to your driver.</p>
                        </div>

                        {userId && pointsValue > 0 && (
                            <div className="pt-4 border-t border-white/5">
                                <label className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 cursor-pointer hover:bg-orange-500/20 transition-all">
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="checkbox" 
                                            checked={redeemPoints} 
                                            onChange={(e) => {
                                                setRedeemPoints(e.target.checked);
                                                handleCartChange(cart, tip, e.target.checked);
                                            }}
                                            className="w-4 h-4 rounded border-orange-500/30 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-900 bg-black"
                                        />
                                        <div>
                                            <p className="font-bold text-orange-400 text-xs">Use TruePoints</p>
                                            <p className="text-[10px] text-orange-400/70 opacity-80">Redeem {pointsValue} pts</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-orange-400">-${pointsDiscountAmount.toFixed(2)}</span>
                                </label>
                            </div>
                        )}

                        <div className="flex justify-between text-4xl font-black pt-8 text-white border-t border-white/10 mt-6 font-serif italic tracking-tighter">
                            <span>Total</span>
                            <span className="text-primary drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                ${Math.max(0, totalPrice + tip - pointsDiscountAmount).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {cartTotalItems > 0 && (
                        <div className="mt-6 pt-6 border-t border-white/10 animate-fade-in">
                            {!userId ? (
                                <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl group-hover:scale-110 transition-transform">🔐</div>
                                    <p className="font-black text-white mb-2 text-lg tracking-tight">One Last Step</p>
                                    <p className="text-xs text-slate-400 mb-6 font-medium">Create an account to track your order and save local favorites.</p>
                                    <Link
                                        href={`/login?redirect=/restaurants/${restaurant.id}`}
                                        className="btn btn-primary w-full text-black font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl shadow-lg shadow-primary/20"
                                    >
                                        Sign In to Order
                                    </Link>
                                    <div className="mt-6 flex items-center justify-center gap-4 border-t border-white/5 pt-6">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xl mb-1">⚡</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Fast Pay</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-xl mb-1">🛰️</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Live Track</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-xl mb-1">🎁</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Rewards</span>
                                        </div>
                                    </div>
                                </div>
                            ) : clientSecret ? (
                                <>
                                    <p className="text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest">Secure Payment Gateway</p>
                                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                                        <CheckoutForm
                                            totalAmount={Math.max(0, totalPrice + tip - pointsDiscountAmount)}
                                            onSuccess={handlePaymentSuccess}
                                            disabled={!orderingEnabled || !deliveryAddress || restaurant.isBusy}
                                        />

                                    </Elements>
                                </>
                            ) : orderingEnabled && (
                                <div className="mt-6 flex flex-col items-center gap-3">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Securing Session...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {!orderingEnabled && (
                        <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                            <p className="text-red-400 font-bold text-sm uppercase tracking-widest mb-1">Ordering Paused</p>
                            <p className="text-xs text-slate-400">We are currently not accepting new orders. Please check back later.</p>
                        </div>
                    )}
                </div>

                {/* Mobile Cart / Checkout Bottom Sheet Modal */}
                {isMobileCartOpen && (
                    <div className="md:hidden fixed inset-0 z-[100] flex flex-col justify-end pointer-events-none">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity"
                            onClick={() => setIsMobileCartOpen(false)}
                        ></div>

                        {/* Drawer */}
                        <div className="relative z-10 bg-slate-900 w-full h-[85vh] rounded-t-[2.5rem] border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] pointer-events-auto flex flex-col animate-in slide-in-from-bottom-full duration-300">
                            {/* Drag Handle */}
                            <div className="w-full flex justify-center py-4 shrink-0" onClick={() => setIsMobileCartOpen(false)}>
                                <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 pb-24 custom-scrollbar">
                                <h3 className="font-black mb-6 text-2xl flex items-center justify-between text-white pb-4 border-b border-white/5">
                                    <span className="flex items-center gap-3"><span className="text-2xl">🛒</span> Checkout</span>
                                    <button onClick={() => setIsMobileCartOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">✕</button>
                                </h3>

                                {/* Delivery Info inside Mobile Modal */}
                                <div className="mb-8">
                                    <h3 className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-4">
                                        Delivery Details
                                    </h3>
                                    <AddressInput
                                        initialAddress={deliveryAddress || ""}
                                        onAddressSelect={(addr, lat, lng) => {
                                            setDeliveryAddress(addr);
                                            setDeliveryLat(lat);
                                            setDeliveryLng(lng);
                                        }}
                                    />
                                </div>

                                {/* Cart Items inside Mobile Modal */}
                                <div className="space-y-4 mb-6">
                                    {Object.entries(cart).map(([id, quantity]) => {
                                        const item = items.find(i => i.id === id);
                                        if (!item) return null;
                                        return (
                                            <div key={id} className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                                                <div className="flex-grow">
                                                    <span className="font-bold text-white block">{item.name} <span className="text-slate-500 font-medium">x{quantity}</span></span>
                                                </div>
                                                <span className="font-black text-white">${(Number(item.price) * quantity).toFixed(2)}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Totals inside Mobile Modal */}
                                <div className="space-y-3 text-sm border-t border-white/10 pt-4 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Subtotal</span>
                                        <span className="font-bold text-white">${totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Driver Tip</span>
                                        <span className="font-bold text-white">${tip.toFixed(2)}</span>
                                    </div>

                                    {userId && pointsValue > 0 && (
                                        <div className="pt-4 border-t border-white/5 mt-4">
                                            <label className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 cursor-pointer hover:bg-orange-500/20 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={redeemPoints} 
                                                        onChange={(e) => {
                                                            setRedeemPoints(e.target.checked);
                                                            handleCartChange(cart, tip, e.target.checked);
                                                        }}
                                                        className="w-4 h-4 rounded border-orange-500/30 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-900 bg-black"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-orange-400 text-xs">Use TruePoints</p>
                                                        <p className="text-[10px] text-orange-400/70 opacity-80">Redeem {pointsValue} pts</p>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-orange-400">-${pointsDiscountAmount.toFixed(2)}</span>
                                            </label>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-xl font-bold pt-4 text-white border-t border-white/10 mt-2">
                                        <span>Total</span>
                                        <span className="text-primary">${Math.max(0, totalPrice + tip - pointsDiscountAmount).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Mobile Checkout Action */}
                                <div className="mt-8 pt-6 border-t border-white/10">
                                    {!userId ? (
                                        <Link
                                            href={`/login?redirect=/restaurants/${restaurant.id}`}
                                            className="btn btn-primary w-full text-black font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-lg shadow-primary/20"
                                        >
                                            Sign In to Order
                                        </Link>
                                    ) : clientSecret ? (
                                        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                                            <CheckoutForm
                                                totalAmount={Math.max(0, totalPrice + tip - pointsDiscountAmount)}
                                                onSuccess={handlePaymentSuccess}
                                                disabled={!orderingEnabled || !deliveryAddress || restaurant.isBusy}
                                            />

                                        </Elements>
                                    ) : (
                                        <button disabled className="btn btn-primary w-full opacity-50 cursor-not-allowed">
                                            Loading Payment...
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info & Map Sidebar (Now integrated) */}
                <div className="card p-0 overflow-hidden border-white/10">
                    <div className="h-48 relative">
                        <div className="absolute inset-0 z-0">

                            {/* Google Maps Map Implementation */}
                            <GoogleMapsMap
                                center={[restaurant?.lat || 35.2271, restaurant?.lng || -80.8431]}
                                zoom={14}
                                restaurants={restaurant ? [{
                                    id: restaurant.id,
                                    name: restaurant.name,
                                    coords: [restaurant.lat || 35.2271, restaurant.lng || -80.8431],
                                    image: restaurant.imageUrl
                                }] : []}
                            />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-20 pointer-events-none">
                            <h3 className="font-bold text-white">{restaurant?.address || "Address"}</h3>
                            <p className="text-xs text-emerald-400">Open Now • Closes 10 PM</p>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-900/50">
                        <div className="space-y-2 text-sm text-slate-400">
                            <div className="flex justify-between">
                                <span>Mon - Fri</span>
                                <span>10:00 AM - 10:00 PM</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Sat - Sun</span>
                                <span>11:00 AM - 11:30 PM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Cart Bar */}
            {cartTotalItems > 0 && !isMobileCartOpen && (
                <div className="md:hidden fixed bottom-6 left-6 right-6 z-[60] animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <button
                        onClick={() => setIsMobileCartOpen(true)}
                        className="w-full bg-primary text-black h-16 rounded-3xl flex items-center justify-between px-6 shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all border border-primary/20"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-black/10 rounded-xl flex items-center justify-center font-black">
                                {cartTotalItems}
                            </div>
                            <span className="font-black tracking-widest uppercase text-[10px] md:text-sm">Checkout</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-black text-lg">${Math.max(0, totalPrice + tip - pointsDiscountAmount).toFixed(2)}</span>
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-inner">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </div>
                        </div>
                    </button>
                </div>
            )}
        </div>
        </>
    );
}
