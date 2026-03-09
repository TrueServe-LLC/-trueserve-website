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
    restaurant: any; // We'll pass the whole restaurant object
    items: MenuItem[];
    orderingEnabled: boolean;
    initialAddress?: string;
    initialLat?: number;
    initialLng?: number;
}

export default function MenuClient({
    userId,
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

    const handleCartChange = async (newCart: { [key: string]: number }, currentTip: number = tip) => {
        setCart(newCart);

        const hasItems = Object.values(newCart).some(q => q > 0);
        if (hasItems) {
            const cartItems = Object.entries(newCart).map(([id, quantity]) => ({ id, quantity }));
            const res = await createPaymentIntent(restaurant.id, cartItems, currentTip);
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
        handleCartChange(newCart);
    };

    const removeFromCart = (itemId: string) => {
        const newCart = { ...cart };
        if (newCart[itemId] > 1) {
            newCart[itemId]--;
        } else {
            delete newCart[itemId];
        }
        handleCartChange(newCart);
    };

    const cartTotalItems = Object.values(cart).reduce((sum, q) => sum + q, 0);
    const totalPrice = Object.entries(cart).reduce((sum, [itemId, quantity]) => {
        const item = items.find(i => i.id === itemId);
        return sum + (item ? Number(item.price) * quantity : 0);
    }, 0);

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

        const response = await placeOrder(
            restaurant.id,
            cartItems,
            paymentIntentId,
            deliveryLat,
            deliveryLng,
            deliveryAddress,
            tip,
            deliveryInstructions
        );

        if (response.success && response.orderId) {
            setCart({});
            setClientSecret(null);
            router.push(`/orders/${response.orderId}`);
        } else {
            alert(response.message || "Failed to finalize order");
            setIsSubmitting(false);
        }
    };

    // Success view removed in favor of redirect

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start md:mt-0 -mt-6">
            {/* Menu Section */}
            <div className="md:col-span-2">
                {/* Mobile Tabs */}
                <div className="md:hidden flex gap-8 mb-6 border-b border-white/10 pb-0">
                    <button className="text-secondary font-black relative pb-3 after:absolute after:bottom-[-1px] after:left-0 after:w-full after:h-0.5 after:bg-secondary">
                        Menu
                    </button>
                    <button className="text-slate-500 font-bold hover:text-white transition-colors pb-3">
                        Reviews
                    </button>
                </div>

                <h2 className="hidden md:block text-xl md:text-3xl font-black mb-6 md:mb-8 tracking-tight">Menu Highlights</h2>
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="group relative bg-white/5 rounded-2xl border border-white/5 overflow-hidden border-b-2 border-b-white/5 active:border-b-0 active:translate-y-0.5 transition-all">
                            <div className="flex flex-row">
                                <div className="w-24 sm:w-32 md:w-40 bg-slate-800 shrink-0 relative overflow-hidden">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px] uppercase font-bold text-center p-4">No Image</div>
                                    )}
                                </div>
                                <div className="p-4 flex flex-col justify-between flex-grow">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-grow">
                                            <h3 className="font-black text-base md:text-xl text-white group-hover:text-primary transition-colors leading-tight mb-1">{item.name}</h3>
                                            <p className="text-xs md:text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">{item.description}</p>
                                        </div>
                                        <span className="font-black text-base md:text-lg text-white shrink-0">${Number(item.price).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-end items-center mt-3">
                                        {cart[item.id] > 0 ? (
                                            <div className="flex items-center gap-4 bg-black/40 rounded-full px-2 py-1 border border-white/10 shadow-inner">
                                                <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white font-black text-lg">-</button>
                                                <span className="font-black w-4 text-center text-sm text-primary">{cart[item.id]}</span>
                                                <button onClick={() => addToCart(item.id)} className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center hover:scale-110 transition-all font-black text-lg shadow-lg shadow-primary/20">+</button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => addToCart(item.id)}
                                                className="btn btn-sm md:btn-md bg-white text-black rounded-full px-6 md:px-8 py-2 md:py-2.5 text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl"
                                            >
                                                Add to Order
                                            </button>
                                        )}
                                    </div>
                                </div>
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

            {/* Sidebar / Checkout */}
            <div className="space-y-6 md:sticky md:top-24">
                <div className="card p-6 bg-slate-900/50 border-white/10 shadow-xl backdrop-blur-xl">
                    {/* TrueServe+ Promo */}
                    <Link href="/benefits" className="block mb-8 p-5 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/20 hover:border-primary/50 transition-all group relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xl">💎</span>
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">TrueServe+ Benefit</span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">
                            Zero delivery fees on this order.
                            <br />
                            <span className="text-primary group-hover:underline underline-offset-4 font-bold inline-block mt-1">Explore Benefits &rarr;</span>
                        </p>
                    </Link>

                    <div className="mb-8 group">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-500">
                                Delivery Destination
                            </h3>
                            {!deliveryAddress && (
                                <span className="text-[9px] font-black text-primary animate-pulse uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">Required</span>
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
                            <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 animate-fade-in anim-delay-1">
                                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1.5 opacity-70">Confirming Address:</p>
                                <p className="text-xs text-white font-bold leading-normal break-words">{deliveryAddress}</p>
                            </div>
                        )}
                        <div className="mt-6">
                            <h3 className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-4">
                                Delivery Instructions
                            </h3>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium focus:border-primary/50 focus:bg-white/10 outline-none transition-all min-h-[80px] text-white placeholder:text-slate-600"
                                placeholder='e.g., "Leave at front door," "Gate code 1234," "Blue house with white fence"'
                                value={deliveryInstructions}
                                onChange={(e) => setDeliveryInstructions(e.target.value)}
                            />
                        </div>
                    </div>

                    <h3 className="font-black mb-6 text-xl flex items-center gap-3 text-white border-b border-white/5 pb-4">
                        <span className="text-2xl">🛒</span> Your Cart
                    </h3>

                    {cartTotalItems === 0 ? (
                        <div className="text-center py-8 opacity-50">
                            <p className="mb-2">Your cart is empty</p>
                            <p className="text-xs">Add items to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {Object.entries(cart).map(([id, quantity]) => {
                                const item = items.find(i => i.id === id);
                                if (!item) return null;
                                return (
                                    <div key={id} className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                                        <div className="flex-grow">
                                            <span className="font-semibold block">{item.name}</span>
                                            <span className="text-slate-500 text-xs">x{quantity}</span>
                                        </div>
                                        <span className="font-bold">${(Number(item.price) * quantity).toFixed(2)}</span>
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

                        <div className="flex justify-between text-xl font-bold pt-4 text-white border-t border-white/10 mt-2">
                            <span>Total</span>
                            <span>${(totalPrice + tip).toFixed(2)}</span>
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
                                            totalAmount={totalPrice + tip}
                                            onSuccess={handlePaymentSuccess}
                                            disabled={!orderingEnabled || !deliveryAddress}
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
            {cartTotalItems > 0 && (
                <div className="md:hidden fixed bottom-6 left-6 right-6 z-[60] animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <button
                        onClick={() => {
                            document.querySelector('.card.p-6.bg-slate-900\\/50')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full bg-primary text-black h-16 rounded-2xl flex items-center justify-between px-6 shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-black/10 rounded-lg flex items-center justify-center font-black">
                                {cartTotalItems}
                            </div>
                            <span className="font-bold tracking-tight uppercase text-sm">View Cart</span>
                        </div>
                        <span className="font-black text-lg">${totalPrice.toFixed(2)}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
