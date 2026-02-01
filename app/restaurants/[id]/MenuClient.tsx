"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { placeOrder } from "../actions";

interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
}

interface MenuClientProps {
    restaurantId: string;
    items: MenuItem[];
}

export default function MenuClient({ restaurantId, items }: MenuClientProps) {
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

        const response = await placeOrder(restaurantId, cartItems, payment);

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
        <div className="grid grid-3 gap-12 items-start">
            {/* Menu Section */}
            <div className="col-span-2">
                <h2 className="text-2xl font-bold mb-8">Menu</h2>
                <div className="grid grid-1 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="card p-0 overflow-hidden flex flex-row h-24 hover:border-primary/50 transition-colors group relative">
                            <div className="w-24 bg-slate-700 shrink-0">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs text-center border-r border-white/5">No Image</div>
                                )}
                            </div>
                            <div className="p-4 flex flex-col justify-between flex-grow">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                        <span className="font-bold text-primary">${Number(item.price).toFixed(2)}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 line-clamp-2">{item.description}</p>
                                </div>
                                <div className="flex justify-end items-center gap-3">
                                    {cart[item.id] > 0 && (
                                        <div className="flex items-center gap-2 animate-fade-in">
                                            <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5">-</button>
                                            <span className="font-bold w-4 text-center">{cart[item.id]}</span>
                                            <button onClick={() => addToCart(item.id)} className="w-8 h-8 rounded-full border border-primary/50 text-primary flex items-center justify-center hover:bg-primary/10">+</button>
                                        </div>
                                    )}
                                    {!cart[item.id] && (
                                        <button
                                            onClick={() => addToCart(item.id)}
                                            className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                                        >
                                            ADD TO ORDER <span>+</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar / Checkout */}
            <div className="space-y-8 sticky top-24">
                <div className="card p-6 bg-primary/5 border-primary/20">
                    <h3 className="font-bold mb-4 text-xl">Your Cart</h3>

                    {cartTotalItems === 0 ? (
                        <p className="text-slate-500 text-sm italic py-4">Your cart is empty. Add some delicious food!</p>
                    ) : (
                        <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {Object.entries(cart).map(([id, quantity]) => {
                                const item = items.find(i => i.id === id);
                                if (!item) return null;
                                return (
                                    <div key={id} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <div className="flex-grow">
                                            <span className="font-semibold">{item.name}</span>
                                            <span className="text-slate-500 text-xs ml-2">x{quantity}</span>
                                        </div>
                                        <span className="font-bold">${(Number(item.price) * quantity).toFixed(2)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="space-y-2 text-sm border-t border-white/10 pt-4">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Subtotal</span>
                            <span className="font-bold">${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Delivery Fee</span>
                            <span className="font-bold text-emerald-400">FREE</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 text-white border-t border-primary/20 mt-2">
                            <span>Total</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    {cartTotalItems > 0 && (
                        <div className="mt-6 pt-6 border-t border-white/10 animate-fade-in">
                            <p className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-widest">Payment Method</p>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Card Number"
                                    className="w-full bg-slate-800 border border-white/10 rounded p-2 text-sm outline-none focus:border-primary transition-colors"
                                    value={payment.cardNumber}
                                    onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        className="w-full bg-slate-800 border border-white/10 rounded p-2 text-sm outline-none focus:border-primary transition-colors"
                                        value={payment.expiry}
                                        onChange={(e) => setPayment({ ...payment, expiry: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="CVC"
                                        className="w-full bg-slate-800 border border-white/10 rounded p-2 text-sm outline-none focus:border-primary transition-colors"
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
                        className="w-full btn btn-primary mt-6 shadow-[0_0_20px_rgba(244,63,94,0.3)] disabled:opacity-50 disabled:shadow-none"
                    >
                        {isSubmitting ? "Processing Payment..." : "Pay & Place Order"}
                    </button>
                    <div className="flex items-center justify-center gap-2 mt-4 text-slate-500 opacity-50">
                        <span className="text-[10px] uppercase tracking-widest">Secured by Stripe</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
