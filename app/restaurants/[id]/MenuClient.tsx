"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { placeOrder } from "../actions";
import Map from "@/components/Map"; // Ensure this import is valid

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
    const [payment, setPayment] = useState({ cardNumber: '', expiry: '', cvc: '' });

    const addToCart = (itemId: string) => {
        setCart(prev => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
        }));
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => {
            const newCart = { ...prev };
            if (newCart[itemId] > 1) {
                newCart[itemId]--;
            } else {
                delete newCart[itemId];
            }
            return newCart;
        });
    };

    const cartTotalItems = Object.values(cart).reduce((sum, q) => sum + q, 0);
    const totalPrice = Object.entries(cart).reduce((sum, [itemId, quantity]) => {
        const item = items.find(i => i.id === itemId);
        return sum + (item ? Number(item.price) * quantity : 0);
    }, 0);

    const handlePlaceOrder = async () => {
        if (!payment.cardNumber || !payment.expiry || !payment.cvc) {
            alert("Please enter payment details.");
            return;
        }

        setIsSubmitting(true);
        const cartItems = Object.entries(cart).map(([id, quantity]) => {
            const item = items.find(i => i.id === id);
            return { id, quantity, price: item ? Number(item.price) : 0 };
        });

        const response = await placeOrder(restaurant.id, cartItems, payment);

        if (response.success && response.orderId) {
            setCart({});
            setPayment({ cardNumber: '', expiry: '', cvc: '' });
            // Redirect to tracking page
            router.push(`/orders/${response.orderId}`);
        } else {
            alert(response.message || "Failed to place order");
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
                        <div key={item.id} className="card p-0 overflow-hidden flex flex-row h-28 hover:bg-white/5 transition-all group relative border border-white/5">
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
            <div className="space-y-6 sticky top-24">
                <div className="card p-6 bg-slate-900/50 border-white/10 shadow-xl backdrop-blur-xl">
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

                    {cartTotalItems > 0 && (
                        <div className="mt-6 pt-6 border-t border-white/10 animate-fade-in">
                            <p className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-widest">Quick Payment</p>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Card Number"
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-primary transition-colors"
                                    value={payment.cardNumber}
                                    onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-primary transition-colors"
                                        value={payment.expiry}
                                        onChange={(e) => setPayment({ ...payment, expiry: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="CVC"
                                        className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-primary transition-colors"
                                        value={payment.cvc}
                                        onChange={(e) => setPayment({ ...payment, cvc: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        disabled={cartTotalItems === 0 || isSubmitting}
                        onClick={handlePlaceOrder}
                        className="w-full btn btn-primary mt-6 py-4 text-lg shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        {isSubmitting ? "Processing..." : "Place Order"}
                    </button>
                    <div className="flex items-center justify-center gap-2 mt-4 text-slate-500 opacity-50">
                        <span className="text-[10px] uppercase tracking-widest">Secured by Stripe</span>
                    </div>
                </div>

                {/* Info & Map Sidebar (Now integrated) */}
                <div className="card p-0 overflow-hidden border-white/10">
                    <div className="h-48 relative">
                        <div className="absolute inset-0 z-0">
                            {/* Fallback to simple map if component fails, but using Map component here */}
                            <Map center={[restaurant?.lat || 35.2271, restaurant?.lng || -80.8431]} zoom={14} />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10">
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
        </div>
    );
}
