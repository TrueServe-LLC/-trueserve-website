"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { placeOrder, createPaymentIntent } from "../actions";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm";
import OrderConfirmAnimation from "@/components/OrderConfirmAnimation";
import AddressInput from "@/components/AddressInput";
import MapWithDirections from "@/components/MapWithDirections";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const DELIVERY_STORAGE_KEYS = {
    address: "ts.delivery.address",
    lat: "ts.delivery.lat",
    lng: "ts.delivery.lng",
} as const;

interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    category?: string | null;
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
    initialLat = undefined,
    initialLng = undefined,
}: MenuClientProps) {
    const router = useRouter();
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [tipPct, setTipPct] = useState(15);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [deliveryAddress, setDeliveryAddress] = useState<string | null>(initialAddress || null);
    const [deliveryLat, setDeliveryLat] = useState<number | null>(
        typeof initialLat === "number" && Number.isFinite(initialLat) ? initialLat : null
    );
    const [deliveryLng, setDeliveryLng] = useState<number | null>(
        typeof initialLng === "number" && Number.isFinite(initialLng) ? initialLng : null
    );
    const [deliveryInstructions, setDeliveryInstructions] = useState("");
    const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
    const [redeemPoints, setRedeemPoints] = useState(false);
    const [checkoutEta, setCheckoutEta] = useState<string>("Calculating...");
    const [checkoutDistance, setCheckoutDistance] = useState<string>("");
    
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
    const locationLabel = deliveryAddress
        ? deliveryAddress.split(",").slice(0, 2).join(", ").trim()
        : "Select delivery address";
    const restaurantLat = typeof restaurant.lat === "number" ? restaurant.lat : Number(restaurant.lat);
    const restaurantLng = typeof restaurant.lng === "number" ? restaurant.lng : Number(restaurant.lng);
    const hasCheckoutRoute =
        Number.isFinite(restaurantLat) &&
        Number.isFinite(restaurantLng) &&
        deliveryLat !== null &&
        deliveryLng !== null;
    const isDhansKitchen = Boolean(restaurant?.name?.toLowerCase?.().includes("dhan"));

    useEffect(() => {
        try {
            const savedAddress = localStorage.getItem(DELIVERY_STORAGE_KEYS.address);
            const savedLat = localStorage.getItem(DELIVERY_STORAGE_KEYS.lat);
            const savedLng = localStorage.getItem(DELIVERY_STORAGE_KEYS.lng);

            if (!deliveryAddress && savedAddress && savedAddress.trim()) {
                setDeliveryAddress(savedAddress.trim());
            }
            if (deliveryLat === null && savedLat && Number.isFinite(Number(savedLat))) {
                setDeliveryLat(Number(savedLat));
            }
            if (deliveryLng === null && savedLng && Number.isFinite(Number(savedLng))) {
                setDeliveryLng(Number(savedLng));
            }
        } catch { }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCartChange = (newCart: { [key: string]: number }) => {
        setCart(newCart);
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

    const removeItem = (id: string) => {
        const newCart = { ...cart };
        delete newCart[id];
        handleCartChange(newCart);
    };

    useEffect(() => {
        const syncPaymentIntent = async () => {
            const nextCartItems = Object.entries(cart).filter(([_, qty]) => qty > 0);
            if (!nextCartItems.length) {
                setClientSecret(null);
                setCheckoutDistance("");
                return;
            }

            const res = await createPaymentIntent(
                restaurant.id,
                nextCartItems.map(([id, quantity]) => ({ id, quantity })),
                tip,
                redeemPoints ? pointsValue : 0
            );

            if (res.clientSecret) {
                setClientSecret(res.clientSecret);
            }
        };

        syncPaymentIntent();
    }, [cart, pointsValue, redeemPoints, restaurant.id, tip]);

    const normalizedItems = items.map((item) => ({
        ...item,
        category: typeof item.category === "string" ? item.category : (item as any).category ?? null,
    }));

    const categoryLabelFor = (item: MenuItem) => {
        const raw = typeof item.category === "string" ? item.category.trim() : "";
        return raw.length ? raw : "Main Menu";
    };

    const categoryOrder = (() => {
        if (isDhansKitchen) {
            return ["Doubles", "Curry Platters", "Vegan", "Sides", "Drinks", "Dessert", "Main Menu"];
        }
        if (restaurant?.name?.toLowerCase?.().includes("pimento")) {
            return ["Appetizers", "Entrees", "Roti", "Sides", "Drinks", "Desserts", "Main Menu"];
        }
        if (restaurant?.name?.toLowerCase?.().includes("krave 489")) {
            return ["Small Plates", "Salads", "Entrees", "Seafood Boil", "Sides", "Desserts", "Kids Cravings", "Main Menu"];
        }
        return [];
    })();

    const menuSections = (() => {
        const buckets = new Map<string, MenuItem[]>();
        for (const item of normalizedItems) {
            const inferredLabel = (() => {
                if (!isDhansKitchen) return null;
                if (typeof item.category === "string" && item.category.trim().length) return null;
                const name = String(item.name || "").toLowerCase();
                if (name.includes("doubles")) return "Doubles";
                if (name.includes("curry")) return "Curry Platters";
                if (name.includes("vegan")) return "Vegan";
                return null;
            })();

            const pimentoLabel = (() => {
                if (!restaurant?.name?.toLowerCase?.().includes("pimento")) return null;
                if (typeof item.category === "string" && item.category.trim().length) return null;
                const name = String(item.name || "").toLowerCase();
                if (name.includes("patty") || name.includes("coco bread")) return "Appetizers";
                if (name.includes("roti")) return "Roti";
                if (name.includes("sorrel") || name.includes("ginger beer") || name.includes("juice")) return "Drinks";
                if (name.includes("rice and peas") || name.includes("mac and cheese") || name.includes("cabbage") || name.includes("plantain") || name.includes("festival")) return "Sides";
                return "Entrees";
            })();

            const kraveLabel = (() => {
                if (!restaurant?.name?.toLowerCase?.().includes("krave 489")) return null;
                if (typeof item.category === "string" && item.category.trim().length) return null;
                const name = String(item.name || "").toLowerCase();
                if (
                    [
                        "seasonal hummus",
                        "street corn ribs",
                        "burrata",
                        "antipasti skewers",
                        "whipped feta dip",
                        "tuna nacho",
                        "wagyu beef meatballs",
                        "scallops",
                        "mussels",
                        "blood orange ceviche",
                        "sausage and peppers",
                        "crab cakes",
                        "teriyaki shrimp skewers",
                        "crispy calamari",
                    ].some((needle) => name.includes(needle))
                ) {
                    return "Small Plates";
                }
                if (name.includes("watermelon and feta") || name.includes("southern caesar") || name.includes("gardenia") || name.includes("krave cobb")) {
                    return "Salads";
                }
                if (name.includes("boil") || name.startsWith("add ")) {
                    return "Seafood Boil";
                }
                if (
                    name.includes("twice baked sweet potatoes") ||
                    name.includes("rosemary parmesan fries") ||
                    name.includes("lime slaw") ||
                    name.includes("brussel sprouts") ||
                    name.includes("mushroom pilaf") ||
                    name.includes("mashed potatoes") ||
                    name.includes("asparagus") ||
                    name.includes("roasted vegetable medley") ||
                    name.includes("mac and cheese")
                ) {
                    return "Sides";
                }
                if (name.includes("pie") || name.includes("cobbler") || name.includes("bread pudding") || name.includes("cake")) {
                    return "Desserts";
                }
                if (name.startsWith("kids ")) {
                    return "Kids Cravings";
                }
                return "Entrees";
            })();

            const label = inferredLabel || pimentoLabel || kraveLabel || categoryLabelFor(item);
            if (!buckets.has(label)) buckets.set(label, []);
            buckets.get(label)!.push(item);
        }

        const sortKey = (label: string) => {
            const idx = categoryOrder.indexOf(label);
            if (idx >= 0) return `0_${idx.toString().padStart(3, "0")}_${label.toLowerCase()}`;
            return `1_${label.toLowerCase()}`;
        };

        return Array.from(buckets.entries())
            .sort(([a], [b]) => sortKey(a).localeCompare(sortKey(b)))
            .map(([label, sectionItems]) => ({
                label,
                items: sectionItems.sort((a, b) => a.name.localeCompare(b.name)),
            }));
    })();

    const hasCategories =
        menuSections.length > 1 ||
        (menuSections.length === 1 && menuSections[0]?.label !== "Main Menu");

    const fallbackDistanceText = (() => {
        if (!hasCheckoutRoute) return "";
        const toRad = (value: number) => (value * Math.PI) / 180;
        const earthMiles = 3958.8;
        const dLat = toRad(restaurantLat - deliveryLat!);
        const dLng = toRad(restaurantLng - deliveryLng!);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(deliveryLat!)) *
                Math.cos(toRad(restaurantLat)) *
                Math.sin(dLng / 2) ** 2;
        const miles = 2 * earthMiles * Math.asin(Math.sqrt(a));
        if (!Number.isFinite(miles)) return "";
        return `~${miles.toFixed(1)} mi`;
    })();

    const checkoutDistanceText = checkoutDistance || fallbackDistanceText;

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        if (!deliveryAddress) return alert("Please set a delivery address");
        if (deliveryLat === null || deliveryLng === null) {
            return alert("Please select a suggested address so we can route your order accurately.");
        }
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
                    <button type="button" className="ghl-btn !bg-[#f97316] !text-black shadow-lg" onClick={openGHL}>
                        <span style={{ fontSize: '16px' }}>⚡️</span> 
                        Order with Fast Assist
                    </button>
                )}
                {!hasCategories ? <div className="cat">Main Menu</div> : null}
                {menuSections.map((section) => (
                    <div key={section.label}>
                        {hasCategories ? <div className="cat">{section.label}</div> : null}
                        {section.items.map(item => (
                            <div key={item.id} className="m-item">
                                <div>
                                    <div className="m-name">{item.name}</div>
                                    <div className="m-desc">{item.description}</div>
                                </div>
                                <div className="m-r">
                                    <span className="m-price">${item.price.toFixed(2)}</span>
                                    <button type="button" className="add-btn" onClick={() => addItem(item.id)}>+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="cart">
                <div className="cart-hd">Your Order</div>
                <div className="cart-scroll" style={{ flex: 1, overflowY: 'auto' }}>
                    {cartItems.length === 0 ? (
                        <div className="cart-empty">Add a few favorites to start your cart.</div>
                    ) : (
                        cartItems.map(([id, qty]) => {
                            const item = items.find(i => i.id === id);
                            if (!item) return null;
                            return (
                                <div className="ci" key={id}>
                                    <div className="ci-name">{item.name}</div>
                                    <div className="qc">
                                        <button type="button" className="qb" onClick={() => chgQty(id, -1)}>−</button>
                                        <span style={{ fontSize: '12px', fontWeight: 700 }}>{qty}</span>
                                        <button type="button" className="qb" onClick={() => chgQty(id, 1)}>+</button>
                                    </div>
                                    <span className="ci-p">${(item.price * qty).toFixed(2)}</span>
                                    <button
                                        type="button"
                                        className="ci-remove"
                                        aria-label={`Remove ${item.name} from order`}
                                        onClick={() => removeItem(id)}
                                    >
                                        ✕
                                    </button>
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
                            <div style={{ fontSize: '11px', color: 'var(--t2)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.14em', fontWeight: 800 }}>Tip your driver</div>
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

                        {userId && truePointsBalance > 0 && (
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', fontSize: '12px', color: 'var(--t2)' }}>
                                <input
                                    type="checkbox"
                                    checked={redeemPoints}
                                    onChange={(e) => setRedeemPoints(e.target.checked)}
                                />
                                Redeem TruePoints balance (${(truePointsBalance / 100).toFixed(2)} available)
                            </label>
                        )}

                        {/* Address Selection */}
                        {!isSubmitting && (
                            <div style={{ marginTop: '16px' }}>
                                    <AddressInput 
                                        initialAddress={deliveryAddress || ""} 
                                        onAddressSelect={(addr, lat, lng) => {
                                            setDeliveryAddress(addr);
                                            setDeliveryLat(typeof lat === "number" && Number.isFinite(lat) ? lat : null);
                                            setDeliveryLng(typeof lng === "number" && Number.isFinite(lng) ? lng : null);
                                            setCheckoutEta("Calculating...");
                                            setCheckoutDistance("");
                                            try {
                                                const nextAddress = String(addr || "").trim();
                                                if (nextAddress) {
                                                    localStorage.setItem(DELIVERY_STORAGE_KEYS.address, nextAddress);
                                                } else {
                                                    localStorage.removeItem(DELIVERY_STORAGE_KEYS.address);
                                                }
                                                if (typeof lat === "number" && Number.isFinite(lat)) {
                                                    localStorage.setItem(DELIVERY_STORAGE_KEYS.lat, String(lat));
                                                } else {
                                                    localStorage.removeItem(DELIVERY_STORAGE_KEYS.lat);
                                                }
                                                if (typeof lng === "number" && Number.isFinite(lng)) {
                                                    localStorage.setItem(DELIVERY_STORAGE_KEYS.lng, String(lng));
                                                } else {
                                                    localStorage.removeItem(DELIVERY_STORAGE_KEYS.lng);
                                                }
                                            } catch { }
                                        }}
                                    />
                                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Delivery Route</div>
                                                <div className="text-[11px] font-semibold text-white/70 mt-1">{locationLabel}</div>
                                            </div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-[#f97316] text-right">
                                                {hasCheckoutRoute ? (
                                                    <>
                                                        <div>{`ETA ${checkoutEta}`}</div>
                                                        {checkoutDistanceText ? (
                                                            <div className="mt-1 text-[9px] text-slate-400">{checkoutDistanceText} away</div>
                                                        ) : null}
                                                    </>
                                                ) : (
                                                    "Awaiting Address"
                                                )}
                                            </div>
                                        </div>
                                        {hasCheckoutRoute ? (
                                            <MapWithDirections
                                                height={220}
                                                routeOrigin={{ lat: restaurantLat, lng: restaurantLng }}
                                                origin={{ lat: restaurantLat, lng: restaurantLng }}
                                                destination={{ lat: deliveryLat, lng: deliveryLng }}
                                                showDriver={false}
                                                onDurationUpdate={setCheckoutEta}
                                                onDistanceUpdate={setCheckoutDistance}
                                            />
                                        ) : (
                                            <div className="h-[220px] px-6 py-6 flex items-center justify-center text-center">
                                                <div className="max-w-[280px]">
                                                    <div className="text-2xl mb-3 opacity-70">🗺️</div>
                                                    <div className="text-sm font-semibold text-white/70">Select a suggested address</div>
                                                    <div className="mt-2 text-xs text-slate-500">
                                                        Choose an address from Google suggestions to preview the route and distance.
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
                                <div style={{ marginTop: '20px', textAlign: 'center', opacity: 0.5, fontSize: '12px' }}>Preparing secure checkout...</div>
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
