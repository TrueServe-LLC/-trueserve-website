"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { placeOrder, createPaymentIntent } from "../actions";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

import GoogleMapsMap from "@/components/GoogleMapsMap";

interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
}

interface MenuClientProps {
    restaurant: any; // We'll pass the whole restaurant object
    items: MenuItem[];
}

export default function MenuClient({ restaurant, items }: MenuClientProps) {
    const router = useRouter();
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    const handleCartChange = async (newCart: { [key: string]: number }) => {
        setCart(newCart);

        const hasItems = Object.values(newCart).some(q => q > 0);
        if (hasItems) {
            const cartItems = Object.entries(newCart).map(([id, quantity]) => ({ id, quantity }));
            const res = await createPaymentIntent(restaurant.id, cartItems);
            if (res.clientSecret) {
                setClientSecret(res.clientSecret);
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

        const response = await placeOrder(restaurant.id, cartItems, paymentIntentId);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Menu Section */}
            <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-8">Menu</h2>
                <div className="grid grid-cols-1 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="card p-0 overflow-hidden flex flex-row min-h-28 h-auto hover:bg-white/5 transition-all group relative border border-white/5">
                            <div className="w-32 bg-slate-800 shrink-0 relative">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs text-center p-2">No Image</div>
                                )}
                            </div>
                            <div className="p-4 flex flex-col justify-between flex-grow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                                    </div>
                                    <span className="font-bold text-lg">${Number(item.price).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-end items-center mt-2">
                                    {cart[item.id] > 0 ? (
                                        <div className="flex items-center gap-3 bg-slate-800 rounded-full px-2 py-1 border border-white/10">
                                            <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">-</button>
                                            <span className="font-bold w-4 text-center text-sm">{cart[item.id]}</span>
                                            <button onClick={() => addToCart(item.id)} className="w-6 h-6 rounded-full bg-primary text-black flex items-center justify-center hover:bg-primary-hover transition-colors font-bold">+</button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => addToCart(item.id)}
                                            className="btn btn-sm btn-primary rounded-full px-4 py-1.5 text-xs shadow-lg transform hover:scale-105 transition-all"
                                        >
                                            Add
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar / Checkout */}
            <div className="space-y-6 md:sticky md:top-24">
                <div className="card p-6 bg-slate-900/50 border-white/10 shadow-xl backdrop-blur-xl">
                    {/* TrueServe+ Promo */}
                    <Link href="/benefits" className="block mb-6 p-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/20 hover:border-primary/50 transition-all group">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xl">💎</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">TrueServe+ Benefit</span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">
                            You could be saving <span className="text-white font-bold">$5.99</span> on this delivery.
                            <span className="text-primary ml-1 group-hover:underline underline-offset-2 font-bold">See Benefits &rarr;</span>
                        </p>
                    </Link>

                    <h3 className="font-bold mb-6 text-xl flex items-center gap-2">
                        <span>🛒</span> Your Cart
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
                        <div className="flex justify-between text-xl font-bold pt-4 text-white border-t border-white/10 mt-2">
                            <span>Total</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    {cartTotalItems > 0 && clientSecret && (
                        <div className="mt-6 pt-6 border-t border-white/10 animate-fade-in">
                            <p className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-widest">Secure Payment</p>
                            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                                <CheckoutForm
                                    totalAmount={totalPrice}
                                    onSuccess={handlePaymentSuccess}
                                />
                            </Elements>
                        </div>
                    )}

                    {!clientSecret && cartTotalItems > 0 && (
                        <div className="mt-6 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
