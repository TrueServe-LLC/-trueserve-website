"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { placeOrder, createPaymentIntent } from "../actions";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm";
import OrderConfirmAnimation from "@/components/OrderConfirmAnimation";
import AddressInput from "@/components/AddressInput";
import Logo from "@/components/Logo";

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
    const [isSubmitting, startTransition] = useTransition();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [deliveryAddress, setDeliveryAddress] = useState<string | null>(initialAddress || null);
    const [deliveryLat, setDeliveryLat] = useState<number | null>(null);
    const [deliveryLng, setDeliveryLng] = useState<number | null>(null);
    const [deliveryInstructions, setDeliveryInstructions] = useState("");
    const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
    const [redeemPoints, setRedeemPoints] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState(1); // 1: Info, 2: Review, 3: Payment
    
    // Lead Connector / GHL Integration
    const [isGHLOpen, setIsGHLOpen] = useState(false);
    const [ghlLoading, setGHLLoading] = useState(false);
    
    const ghlUrl = restaurant.name.includes("Dhan") 
        ? "https://api.leadconnectorhq.com/widget/booking/demo-dhans-kitchen"
        : restaurant.ghlUrl;

    const openGHL = () => {
        if(!ghlUrl) return;
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
    const total = Math.max(0.50, subtotal + 2.99 + tax + tip - pointsDiscount);

    const handleAddToCart = (id: string) => {
        setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    };

    const handleRemoveFromCart = (id: string) => {
        const newCart = { ...cart };
        delete newCart[id];
        setCart(newCart);
    };

    const handleQuantityChange = (id: string, delta: number) => {
        setCart(prev => {
            const next = (prev[id] || 0) + delta;
            if (next <= 0) {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            }
            return { ...prev, [id]: next };
        });
    };

    const startCheckout = async () => {
        if (!userId) {
            router.push(`/login?redirect=/restaurants/${restaurant.id}`);
            return;
        }
        
        startTransition(async () => {
             const res = await createPaymentIntent(
                 restaurant.id, 
                 Object.entries(cart).map(([id, quantity]) => ({ id, quantity })),
                 tip,
                 redeemPoints ? pointsValue : 0
             );
             if (res.clientSecret) {
                 setClientSecret(res.clientSecret);
                 setCheckoutStep(3);
             } else {
                 alert(res.error || "Failed to initialize payment node.");
             }
        });
    };

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        if (!deliveryAddress) return;
        
        startTransition(async () => {
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

            if (res.success && res.orderId) {
                setPendingOrderId(res.orderId);
            } else {
                alert(res.message || "Failed to finalize order mission.");
            }
        });
    };

    return (
        <div className="flex flex-col lg:flex-row gap-12 font-barlow-cond relative">
            <style jsx global>{`
                .industrial-card { 
                    background: rgba(255,255,255,0.015); 
                    border: 1px solid rgba(255,255,255,0.05); 
                    border-radius: 2.5rem; 
                    padding: 2rem; 
                    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                    position: relative;
                    overflow: hidden;
                }
                .industrial-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(232, 162, 48, 0.05) 0%, transparent 100%);
                    opacity: 0;
                    transition: opacity 0.5s;
                }
                .industrial-card:hover { 
                    transform: translateY(-8px) scale(1.02); 
                    border-color: rgba(232, 162, 48, 0.4); 
                    background: rgba(255,255,255,0.03); 
                    box-shadow: 0 40px 80px -20px rgba(0,0,0,0.8), 0 0 30px rgba(232,162,48,0.05); 
                }
                .industrial-card:hover::before { opacity: 1; }
                
                .hud-sidebar { 
                    width: 100%; 
                    lg:width: 480px; 
                    position: sticky; 
                    top: 120px; 
                    height: fit-content; 
                    background: linear-gradient(180deg, #0f1218 0%, #0c0e13 100%); 
                    border: 1px solid rgba(255,255,255,0.07); 
                    border-radius: 3.5rem; 
                    overflow: hidden; 
                    box-shadow: 0 0 120px rgba(0,0,0,0.7), inset 0 0 20px rgba(255,255,255,0.02);
                }
                
                .step-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.05); transition: all 0.4s; position: relative; }
                .step-dot.active { background: #e8a230; box-shadow: 0 0 20px #e8a230; transform: scale(1.4); }
                .step-dot.active::after { content: ''; position: absolute; inset: -4px; border: 1px solid #e8a230; border-radius: 50%; animation: pulse-out 2s infinite; }
                .step-dot.complete { background: #fff; }
                
                @keyframes pulse-out {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(2.5); opacity: 0; }
                }

                .scanline-overlay { 
                    position: absolute; inset: 0; 
                    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(232,162,48,0.015) 3px); 
                    pointer-events: none; z-index: 10;
                }
                
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(232,162,48,0.2); border-radius: 10px; }
            `}</style>

            {pendingOrderId && (
                <OrderConfirmAnimation
                    restaurantName={restaurant.name}
                    onComplete={() => router.push(`/orders/${pendingOrderId}`)}
                />
            )}

            {isGHLOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/70" onClick={() => setIsGHLOpen(false)}>
                    <div className="w-full max-w-5xl h-[90vh] bg-[#0c0e13] border border-white/10 rounded-[4rem] overflow-hidden flex flex-col shadow-2xl relative animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="bg-white/[0.03] p-10 flex justify-between items-center border-b border-white/5">
                            <div className="space-y-1">
                                <div className="flex items-center gap-4">
                                    <div className="w-2.5 h-2.5 bg-[#e8a230] rounded-full animate-pulse shadow-[0_0_15px_#e8a230]"></div>
                                    <h3 className="font-bebas italic text-3xl uppercase tracking-widest text-white">{restaurant.name} Secure Portal</h3>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic ml-6">// Terminal Uplink Established</p>
                            </div>
                            <button onClick={() => setIsGHLOpen(false)} className="w-12 h-12 rounded-3xl border border-white/10 flex items-center justify-center text-white hover:bg-[#e8a230] hover:text-black transition-all hover:rotate-90">✕</button>
                        </div>
                        <div className="flex-1 relative bg-black">
                            {ghlLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-[#0c0e13]">
                                    <div className="relative w-20 h-20">
                                        <div className="absolute inset-0 border-4 border-[#e8a230]/10 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-t-[#e8a230] rounded-full animate-spin"></div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#e8a230] animate-pulse italic">Synchronizing Neural Interface</p>
                                        <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-slate-600 italic">V2.4 Protocol Handshake</p>
                                    </div>
                                </div>
                            )}
                            <iframe src={ghlUrl} className="w-full h-full border-none" onLoad={() => setGHLLoading(false)} />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 space-y-16">
                {ghlUrl && (
                    <button 
                        onClick={openGHL}
                        className="group w-full py-8 bg-gradient-to-r from-[#e8a230] to-[#f5b342] text-black rounded-[2.5rem] flex items-center justify-center gap-6 shadow-[0_30px_60px_-15px_rgba(232,162,48,0.25)] hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] transition-all"
                    >
                         <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center text-3xl group-hover:rotate-[360deg] transition-all duration-700">⚡</div>
                         <div className="text-left">
                            <span className="font-bebas italic text-3xl uppercase tracking-widest block leading-none">Engage AI Concierge</span>
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-50 italic">Full Service Neural Terminal</span>
                         </div>
                    </button>
                )}

                <div className="flex items-center gap-8 opacity-40">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20"></div>
                    <span className="font-black text-[10px] uppercase tracking-[0.6em] italic text-slate-500">Inventory Catalog</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {items.map(item => (
                        <div key={item.id} className="industrial-card group flex flex-col" onClick={() => handleAddToCart(item.id)}>
                            <div className="scanline-overlay opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="relative z-10 flex-1 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#e8a230] italic opacity-0 group-hover:opacity-100 transition-all">// Asset ID: {item.id.slice(0,5)}</p>
                                        <h3 className="font-bebas italic text-4xl uppercase tracking-tight text-white group-hover:text-[#e8a230] transition-colors duration-300">{item.name}</h3>
                                    </div>
                                    <div className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-2xl">
                                        <span className="text-2xl font-bebas italic text-[#e8a230] shadow-glow">${item.price.toFixed(2)}</span>
                                    </div>
                                </div>
                                <p className="text-slate-500 italic text-[13px] font-medium leading-relaxed line-clamp-3 group-hover:text-slate-300 transition-colors">
                                    {item.description || "Elite culinary composition. Handcrafted and optimized for regional courier logistics with zero thermal variance."}
                                </p>
                            </div>
                            
                            <div className="mt-8 relative z-10">
                                <button className="w-full py-5 bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:bg-[#e8a230] group-hover:text-black group-hover:border-[#e8a230] group-hover:shadow-[0_0_30px_rgba(232,162,48,0.2)] transition-all italic flex items-center justify-center gap-3">
                                    + Acquire Asset <span className="opacity-40 tracking-normal">→</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="hud-sidebar animate-slide-in-right relative">
                <div className="scanline-overlay pointer-events-none"></div>
                
                <div className="bg-white/[0.03] border-b border-white/5 p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none rotate-12">
                        <Logo size="md" />
                    </div>
                    
                    <div className="flex justify-between items-end mb-12">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#e8a230] italic animate-pulse">// Mission Status</p>
                            <h3 className="font-bebas italic text-4xl uppercase tracking-widest text-white">Payload HUD</h3>
                        </div>
                        <div className="text-right">
                             <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bebas italic text-white leading-none">{cartItems.length}</span>
                                <span className={`w-2 h-2 rounded-full mb-1 ${cartItems.length > 0 ? 'bg-[#e8a230] shadow-glow' : 'bg-white/5'}`}></span>
                             </div>
                             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 block mt-1">Sectors Captured</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-2">
                        {[1, 2, 3].map(s => (
                            <div key={s} className="flex items-center gap-4 flex-1 last:flex-none">
                                <div className={`step-dot ${checkoutStep === s ? 'active' : checkoutStep > s ? 'complete' : ''}`}></div>
                                {s < 3 && <div className={`h-px flex-1 mx-2 transition-all duration-1000 ${checkoutStep > s ? 'bg-white/30' : 'bg-white/10'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-10">
                    {cartItems.length === 0 ? (
                        <div className="py-24 text-center space-y-8 flex flex-col items-center">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center text-5xl opacity-20">📡</div>
                                <div className="absolute inset-0 border border-[#e8a230]/20 rounded-[2rem] animate-ping opacity-0 group-hover:opacity-100"></div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-slate-600 text-[11px] font-black uppercase tracking-[0.5em] italic">Scanning For Signals...</p>
                                <p className="text-[8px] font-bold text-slate-800 uppercase tracking-widest">Select assets to begin synchronization</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {checkoutStep === 1 && (
                                <div className="space-y-10 animate-fade-in-up">
                                    <div className="space-y-6">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 flex items-center gap-3 italic">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#e8a230]"></span>
                                            Logistics Coordination
                                        </label>
                                        <AddressInput 
                                            initialAddress={deliveryAddress || ""} 
                                            onAddressSelect={(addr, lat, lng) => {
                                                setDeliveryAddress(addr);
                                                setDeliveryLat(lat);
                                                setDeliveryLng(lng);
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-6">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 flex items-center gap-3 italic">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#e8a230]"></span>
                                            Tactical Instructions
                                        </label>
                                        <textarea
                                            placeholder="Gated entries, delivery protocol, or site-specific notes..."
                                            value={deliveryInstructions}
                                            onChange={(e) => setDeliveryInstructions(e.target.value)}
                                            className="w-full bg-white/[0.015] border border-white/5 rounded-3xl p-8 text-sm italic font-medium text-white placeholder:text-slate-800 focus:outline-none focus:border-[#e8a230]/30 focus:bg-white/[0.03] transition-all h-40 resize-none shadow-inner"
                                        ></textarea>
                                    </div>

                                    <button 
                                        onClick={() => setCheckoutStep(2)}
                                        disabled={!deliveryAddress}
                                        className="w-full py-6 bg-white text-black rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] hover:bg-[#e8a230] transition-all hover:scale-[1.02] active:scale-[0.98] italic shadow-glow shadow-[#e8a230]/10 disabled:opacity-10 disabled:grayscale"
                                    >
                                        Validate Route →
                                    </button>
                                </div>
                            )}

                            {checkoutStep === 2 && (
                                <div className="space-y-12 animate-fade-in-up">
                                    <div className="space-y-6 overflow-hidden">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#e8a230] italic">// Payload manifest</label>
                                        <div className="space-y-5 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                                            {cartItems.map(([id, qty]) => {
                                                const item = items.find(i => i.id === id);
                                                if (!item) return null;
                                                return (
                                                    <div key={id} className="flex justify-between items-center group/item p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                                                        <div className="flex items-center gap-6">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <button onClick={() => handleQuantityChange(id, 1)} className="text-[10px] text-slate-700 hover:text-[#e8a230] transition-colors font-black">▲</button>
                                                                <span className="text-sm font-black text-[#e8a230] italic font-bebas tracking-widest">{qty}</span>
                                                                <button onClick={() => handleQuantityChange(id, -1)} className="text-[10px] text-slate-700 hover:text-[#e8a230] transition-colors font-black">▼</button>
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <span className="font-bebas text-lg italic text-white uppercase tracking-wider">{item.name}</span>
                                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">Unit Val: ${item.price.toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-lg font-bebas italic text-white opacity-40">${(item.price * qty).toFixed(2)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="bg-[#e8a230]/5 border border-[#e8a230]/10 rounded-[2.5rem] p-10 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#e8a230] italic">// Loyalty Uplink</p>
                                                <p className="text-white font-bebas italic text-2xl tracking-widest">{truePointsBalance.toLocaleString()} PTS</p>
                                            </div>
                                            <button 
                                                onClick={() => setRedeemPoints(!redeemPoints)}
                                                className={`px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all italic border ${redeemPoints ? 'bg-[#e8a230] text-black border-[#e8a230] shadow-glow' : 'border-white/10 text-white hover:bg-white/10'}`}
                                            >
                                                {redeemPoints ? 'Sync Active' : 'Initialize'}
                                            </button>
                                        </div>
                                        {redeemPoints && (
                                            <div className="pt-4 border-t border-[#e8a230]/20 flex justify-between items-center animate-fade-in">
                                                <span className="text-[10px] font-black text-[#e8a230] uppercase italic tracking-[0.3em]">Reduction Offset</span>
                                                <span className="text-2xl font-bebas italic text-[#e8a230]">-${pointsDiscount.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                         <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 italic">// Sector Logistics Support (Gratuity)</label>
                                         <div className="grid grid-cols-4 gap-4">
                                             {[0, 15, 18, 20].map(p => (
                                                 <button 
                                                    key={p} 
                                                    onClick={() => setTipPct(p)}
                                                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic border ${tipPct === p ? 'bg-white text-black border-white shadow-glow' : 'border-white/5 text-slate-600 hover:bg-white/5'}`}
                                                 >
                                                     {p === 0 ? 'LATER' : `${p}%`}
                                                 </button>
                                             ))}
                                         </div>
                                    </div>

                                    <div className="pt-10 border-t border-white/5 space-y-4">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">
                                            <span>Subtotal</span>
                                            <span className="text-sm font-bold text-slate-300">${subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">
                                            <span>Logistics Fee</span>
                                            <span className="text-sm font-bold text-slate-300">$2.99</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">
                                            <span>Regional Tax</span>
                                            <span className="text-sm font-bold text-slate-300">${tax.toFixed(2)}</span>
                                        </div>
                                        <div className="pt-8 flex justify-between items-end bg-gradient-to-t from-white/[0.01] to-transparent p-6 rounded-3xl border border-white/[0.02]">
                                            <div className="space-y-1">
                                                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-[#e8a230] italic leading-none">Total Yield</span>
                                                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-600">Verification complete</p>
                                            </div>
                                            <span className="text-6xl font-bebas italic text-white tracking-widest leading-none">${total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-6">
                                        <button onClick={() => setCheckoutStep(1)} className="flex-1 py-6 border border-white/5 rounded-3xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:text-white hover:border-white/20 transition-all italic">Recalibrate</button>
                                        <button 
                                            onClick={startCheckout}
                                            disabled={isSubmitting}
                                            className="flex-[2] py-6 bg-[#e8a230] text-black rounded-3xl font-black uppercase tracking-[0.3em] text-[12px] shadow-[0_20px_40px_-10px_rgba(232,162,48,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all italic flex items-center justify-center gap-3"
                                        >
                                            {isSubmitting ? "Syncing..." : "Initialize Transfer"} <span>→</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {checkoutStep === 3 && clientSecret && (
                                <div className="space-y-10 animate-fade-in-up">
                                    <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#e8a230] mb-8 block italic animate-pulse">// AUTHORIZATION TERMINAL</label>
                                        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#e8a230', borderRadius: '16px', colorBackground: '#0c0e13', colorText: '#F0EDE8' } } }}>
                                            <CheckoutForm totalAmount={total} onSuccess={handlePaymentSuccess} disabled={isSubmitting} />
                                        </Elements>
                                    </div>
                                    <button 
                                        onClick={() => setCheckoutStep(2)} 
                                        className="w-full py-5 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-white hover:bg-white/5 transition-all italic"
                                    >
                                        ← Revise Logistics Manifesto
                                    </button>
                                </div>
                            )}

                            {!clientSecret && checkoutStep === 3 && (
                                <div className="py-24 text-center flex flex-col items-center gap-8">
                                    <div className="relative w-16 h-16">
                                        <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-t-[#e8a230] rounded-full animate-spin"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#e8a230] italic animate-pulse">Establishing Node Connect</p>
                                        <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest italic">Securing financial bandwidth...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!userId && cartItems.length > 0 && (
                    <div className="p-10 pt-0">
                         <Link href={`/login?redirect=/restaurants/${restaurant.id}`} className="group relative block w-full py-6 bg-white/[0.02] border border-[#e8a230]/20 text-[#e8a230] rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] text-center overflow-hidden hover:bg-[#e8a230] hover:text-black transition-all italic">
                            <span className="relative z-10">Uplink Authorization Required</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                         </Link>
                    </div>
                )}
            </div>
        </div>
    );
}


