import Link from "next/link";
import { cookies } from "next/headers";
import { getDriverOrRedirect } from "@/lib/driver-auth";
import { createClient } from "@/lib/supabase/server";
import { acceptOrder } from "../actions";
import { getCurrentWeather } from "@/lib/weather";
import PickupPhotoForm from "./PickupPhotoForm";
import CompleteDeliveryForm from "./CompleteDeliveryForm";
import DriverMap from "@/components/DriverMap";

export const dynamic = "force-dynamic";

export default async function DriverDashboard() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const driver = isPreview
        ? {
            id: "preview",
            name: "Pilot Driver",
            currentLat: 28.5383,
            currentLng: -81.3792,
            totalEarnings: 126,
            balance: 84.25,
            stripeAccountId: null,
            orders: Array.from({ length: 7 }),
            rating: 4.9,
        }
        : await getDriverOrRedirect();
    const driverLat = typeof driver?.currentLat === "number" ? driver.currentLat : null;
    const driverLng = typeof driver?.currentLng === "number" ? driver.currentLng : null;

    let availableOrders: any[] = [];
    let myActiveOrders: any[] = [];
    let weather = { temperature: 68, condition: "Clear", multiplier: 1.0 };
    let stats = { totalEarnings: 0, balance: 0, trips: 0, rating: 0 };

    if (isPreview) {
        weather = { temperature: 74, condition: "Clear", multiplier: 1.0 };
        availableOrders = [
            {
                id: "preview-order-1",
                restaurant: { name: "Pilot Restaurant A", address: "100 Main St" },
                totalPay: 8.4,
                distance: 1.2,
            },
            {
                id: "preview-order-2",
                restaurant: { name: "Pilot Restaurant B", address: "200 Lake St" },
                totalPay: 11.5,
                distance: 2.8,
            },
        ];
        myActiveOrders = [
            {
                id: "preview-active-1",
                status: "PICKED_UP",
                restaurant: { name: "Pilot Restaurant A", address: "100 Main St" },
                deliveryAddress: "400 Market St, Apt 4B",
                customerName: "Pilot Customer",
                deliveryInstructions: "Leave at door",
            },
        ];
    } else {
        const supabase = await createClient();

        if (driverLat !== null && driverLng !== null) {
            weather = await getCurrentWeather(driverLat, driverLng);
        }

        const { data: rawAvailable } = await supabase
            .from("Order")
            .select("*, restaurant:Restaurant(name, address, lat, lng)")
            .is("driverId", null)
            .neq("status", "DELIVERED")
            .neq("status", "CANCELLED")
            .limit(10);

        const { data: rawActive } = await supabase
            .from("Order")
            .select("*, restaurant:Restaurant(name, address, lat, lng), customer:User(name)")
            .eq("driverId", driver.id)
            .neq("status", "DELIVERED")
            .neq("status", "CANCELLED");

        availableOrders = rawAvailable || [];
        myActiveOrders = rawActive || [];
    }

    stats = {
        totalEarnings: Number(driver?.totalEarnings || 0),
        balance: Number(driver?.balance || 0),
        trips: driver?.orders?.length || 0,
        rating: Number(driver?.rating || 0),
    };
    const hasStripe = Boolean((driver as any)?.stripeAccountId);
    const primaryOrder = myActiveOrders[0] || null;
    const additionalOrders = myActiveOrders.slice(1);

    return (
        <div className="md-body min-h-screen">
            <div className="md-page-hd">
                <div>
                    <div className="md-page-title">Driver Dashboard</div>
                    <div className="md-page-sub">
                        Route board · {driver.name}
                    </div>
                </div>
                <div className="md-hd-right flex-wrap">
                    <div className="md-terminal-btn">
                        <span className="md-terminal-dot"></span>
                        Live Routes
                    </div>
                    <div className="md-online-badge">Online</div>
                    <div className="md-online-badge" style={hasStripe ? { background: "#0d1a10", color: "#3dd68c", borderColor: "#1a4a2a" } : {}}>
                        {hasStripe ? "Payouts Active" : "Payout Setup"}
                    </div>
                    <Link href="/driver/dashboard/compliance" className="btn btn-gold">
                        Compliance
                    </Link>
                </div>
            </div>

            <div className="md-stat-grid">
                <div className="md-stat-block">
                    <div className="md-stat-name">Daily Yield</div>
                    <div className="md-stat-value gold">${stats.totalEarnings.toFixed(0)}</div>
                </div>
                <div className="md-stat-block">
                    <div className="md-stat-name">Trips</div>
                    <div className="md-stat-value">{stats.trips}</div>
                </div>
                <div className="md-stat-block">
                    <div className="md-stat-name">Rating</div>
                    <div className="md-stat-value">{stats.rating.toFixed(1)} ★</div>
                </div>
                <div className="md-stat-block">
                    <div className="md-stat-name">Weather</div>
                    <div className="md-stat-value grn">{weather.temperature}°F</div>
                </div>
            </div>

            {!hasStripe ? (
                <div className="md-stripe-banner">
                    <div className="md-stripe-left">
                        <div className="md-stripe-icon">
                            <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                                <rect x="1" y="1" width="18" height="12" rx="1" stroke="#4a5aaa" strokeWidth="1.3" />
                                <path d="M1 5h18" stroke="#4a5aaa" strokeWidth="1.3" />
                            </svg>
                        </div>
                        <div>
                            <div className="md-stripe-title">Connect Stripe to get paid.</div>
                            <div className="md-stripe-desc">Driver payouts activate once your Stripe account is connected.</div>
                        </div>
                    </div>
                    <Link href="/driver/dashboard/account" className="md-stripe-btn">
                        Connect Stripe Account
                    </Link>
                </div>
            ) : (
                <div className="md-stripe-banner" style={{ borderColor: "#1a4a2a", background: "#0d1a10" }}>
                    <div className="md-stripe-left">
                        <div className="md-stripe-icon" style={{ borderColor: "#1a4a2a", background: "#0d2a1a" }}>
                            <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                                <rect x="1" y="1" width="18" height="12" rx="1" stroke="#3dd68c" strokeWidth="1.3" />
                                <path d="M1 5h18" stroke="#3dd68c" strokeWidth="1.3" />
                            </svg>
                        </div>
                        <div>
                            <div className="md-stripe-title" style={{ fontStyle: "normal" }}>Stripe account connected.</div>
                            <div className="md-stripe-desc">Your payouts are active and rolling to your bank.</div>
                        </div>
                    </div>
                    <div className="md-stripe-connected">✓ Payouts Active</div>
                </div>
            )}

            <div className="md-two-col">
                <div className="md-stat-block">
                    <div className="md-stat-name">Active Mission</div>
                    <div className="mt-2 text-[28px] font-black tracking-[-0.03em] text-white">Current Route</div>

                    {primaryOrder ? (
                        <div className="mt-5 space-y-4">
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-[#e8a230]">{primaryOrder.status}</div>
                                        <h3 className="mt-1 text-[22px] font-black">{primaryOrder.restaurant?.name || "Restaurant"}</h3>
                                    </div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                                        #{primaryOrder.id.slice(-6).toUpperCase()}
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-white/10 bg-[#0b0f17] p-4">
                                        <div className="text-[10px] uppercase tracking-[0.14em] text-white/55">Pickup</div>
                                        <div className="mt-1 font-bold">{primaryOrder.restaurant?.address}</div>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-[#0b0f17] p-4">
                                        <div className="text-[10px] uppercase tracking-[0.14em] text-white/55">Drop-off</div>
                                        <div className="mt-1 font-bold">{primaryOrder.deliveryAddress}</div>
                                        {primaryOrder.customerName && (
                                            <div className="mt-1 text-xs text-[#68c7cc]">Customer: {primaryOrder.customerName}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                                    <div className="rounded-2xl border border-white/10 bg-[#0b0f17] p-4">
                                        <div className="text-[10px] uppercase tracking-[0.14em] text-white/55">Progress</div>
                                        <div className="mt-3 flex items-center gap-3">
                                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                                                <div className="h-full w-[68%] rounded-full bg-[#e8a230]" />
                                            </div>
                                            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#e8a230]">
                                                {primaryOrder.status === "PICKED_UP" ? "Picked up" : "Heading out"}
                                            </div>
                                        </div>
                                        <p className="mt-3 text-sm leading-6 text-white/65">
                                            {primaryOrder.status === "PICKED_UP"
                                                ? "Complete the drop-off steps once you arrive at the customer address."
                                                : "Capture the pickup photo once the restaurant hands over the order."}
                                        </p>
                                    </div>
                                    <div>
                                        {primaryOrder.status === "PICKED_UP" ? (
                                            <CompleteDeliveryForm
                                                orderId={primaryOrder.id}
                                                customerName={primaryOrder.customerName || primaryOrder.customer?.name}
                                                deliveryInstructions={primaryOrder.deliveryInstructions}
                                            />
                                        ) : (
                                            <PickupPhotoForm orderId={primaryOrder.id} restaurantName={primaryOrder.restaurant?.name} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {additionalOrders.length > 0 && (
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">Additional Active Orders</div>
                                    <div className="mt-3 space-y-2">
                                        {additionalOrders.slice(0, 2).map((order) => (
                                            <div key={order.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                                <div>
                                                    <div className="text-sm font-semibold text-white">{order.restaurant?.name || "Restaurant"}</div>
                                                    <div className="text-xs text-white/50">{order.deliveryAddress}</div>
                                                </div>
                                                <div className="text-[11px] font-black uppercase tracking-[0.08em] text-[#e8a230]">
                                                    {order.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mt-5 rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center text-sm text-white/60">
                            No active deliveries right now. Available orders are listed below.
                        </div>
                    )}
                </div>

                <div className="space-y-5">
                    <div className="md-stat-block">
                        <div className="md-stat-name">Navigation</div>
                        <div className="mt-2 text-[28px] font-black tracking-[-0.03em] text-white">Live Map + Heatmap</div>
                        <div className="mt-5 overflow-hidden rounded-[22px] border border-white/10 bg-[#0b0f17] p-3">
                            <DriverMap initialCenter={driverLat !== null && driverLng !== null ? { lat: driverLat, lng: driverLng } : null} />
                        </div>
                    </div>

                    <div className="md-stat-block">
                        <div className="md-stat-name">Driver Essentials</div>
                        <div className="mt-2 text-[28px] font-black tracking-[-0.03em] text-white">Payments and Tools</div>
                        <div className="mt-5 grid gap-2 sm:grid-cols-2">
                            <Link href="/driver/dashboard/account" className="btn btn-gold justify-center">Stripe Payout Setup</Link>
                            <Link href="/driver/dashboard/compliance" className="btn btn-gold justify-center">Compliance Checklist</Link>
                            <Link href="/driver/dashboard/earnings" className="btn btn-ghost justify-center">Settlement History</Link>
                            <Link href="/driver/dashboard/help" className="btn btn-ghost justify-center">TrueServe AI Support</Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="md-bottom-grid">
                <div className="md-stat-block">
                    <div className="md-stat-name">Available Orders</div>
                    <div className="mt-2 text-[28px] font-black tracking-[-0.03em] text-white">Nearby Opportunities</div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {availableOrders.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center text-sm text-white/60 md:col-span-2">
                                No nearby opportunities right now.
                            </div>
                        ) : (
                            availableOrders.slice(0, 4).map((order) => (
                                <div key={order.id} className="rounded-2xl border border-white/10 bg-[#0b0f17] p-5">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <h3 className="text-lg font-black">{order.restaurant?.name}</h3>
                                        <span className="text-[11px] uppercase tracking-[0.12em] text-[#68c7cc]">Live</span>
                                    </div>
                                    <p className="mb-4 text-sm leading-6 text-white/65">{order.restaurant?.address}</p>
                                    <div className="mb-4 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-[#3dd68c]/30 bg-[#3dd68c]/10 px-3 py-1 text-xs font-bold text-[#3dd68c]">
                                            ${(order.totalPay || order.total)?.toFixed(2)} payout
                                        </span>
                                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-white/65">
                                            {order.distance?.toFixed(1) || "1.2"} mi
                                        </span>
                                    </div>
                                    <form
                                        action={async (formData) => {
                                            "use server";
                                            const id = formData.get("orderId") as string;
                                            await acceptOrder(id);
                                        }}
                                    >
                                        <input type="hidden" name="orderId" value={order.id} />
                                        <button className="btn btn-gold w-full justify-center">Accept Order</button>
                                    </form>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="md-stat-block">
                    <div className="md-stat-name">Route Summary</div>
                    <div className="mt-2 text-[28px] font-black tracking-[-0.03em] text-white">Today at a glance</div>
                    <div className="mt-5 space-y-3">
                        {[
                            { label: "Balance", value: `$${Number(driver.balance || 0).toFixed(2)}` },
                            { label: "Weather", value: `${weather.temperature}°F · ${weather.condition}` },
                            { label: "Trip Count", value: `${stats.trips} deliveries` },
                            { label: "Rating", value: `${stats.rating.toFixed(1)} stars` },
                        ].map((row) => (
                            <div key={row.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                <span className="text-xs uppercase tracking-[0.12em] text-white/45">{row.label}</span>
                                <span className="text-sm font-bold text-white/80">{row.value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-5 grid gap-2">
                        <Link href="/driver/dashboard/compliance" className="btn btn-gold justify-center">Open Compliance</Link>
                        <Link href="/driver/dashboard/earnings" className="btn btn-ghost justify-center">View Settlements</Link>
                        <Link href="/driver/dashboard/help" className="btn btn-ghost justify-center">Get Support</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
