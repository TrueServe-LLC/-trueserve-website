import Link from "next/link";
import { getDriverOrRedirect } from "@/lib/driver-auth";
import { createClient } from "@/lib/supabase/server";
import { acceptOrder } from "../actions";
import { getCurrentWeather } from "@/lib/weather";
import PickupPhotoForm from "./PickupPhotoForm";
import CompleteDeliveryForm from "./CompleteDeliveryForm";
import DriverMap from "@/components/DriverMap";

export const dynamic = "force-dynamic";

export default async function DriverDashboard() {
    const driver = await getDriverOrRedirect();
    const driverLat = typeof driver?.currentLat === "number" ? driver.currentLat : null;
    const driverLng = typeof driver?.currentLng === "number" ? driver.currentLng : null;

    let availableOrders: any[] = [];
    let myActiveOrders: any[] = [];
    let weather = { temperature: 68, condition: "Clear", multiplier: 1.0 };
    let stats = { totalEarnings: 0, balance: 0, trips: 0, rating: 0 };

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
    stats = {
        totalEarnings: Number(driver?.totalEarnings || 0),
        balance: Number(driver?.balance || 0),
        trips: driver?.orders?.length || 0,
        rating: Number(driver?.rating || 0),
    };

    return (
        <div className="food-app-main">
            <section className="food-panel mb-6">
                <p className="food-kicker mb-2">Driver Operations</p>
                <h1 className="food-heading mb-2">Daily Workspace</h1>
                <p className="food-subtitle !max-w-none">
                    View active deliveries, claim nearby opportunities, navigate with live heatmaps, and complete proof steps from a single dashboard.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-4">
                    <div className="food-card !p-4">
                        <div className="food-kicker">Daily Yield</div>
                        <div className="text-2xl font-black text-[#e8a230]">${stats.totalEarnings.toFixed(0)}</div>
                    </div>
                    <div className="food-card !p-4">
                        <div className="food-kicker">Trips</div>
                        <div className="text-2xl font-black">{stats.trips}</div>
                    </div>
                    <div className="food-card !p-4">
                        <div className="food-kicker">Rating</div>
                        <div className="text-2xl font-black">{stats.rating.toFixed(1)} ★</div>
                    </div>
                    <div className="food-card !p-4">
                        <div className="food-kicker">Weather</div>
                        <div className="text-2xl font-black">{weather.temperature}°F</div>
                    </div>
                </div>
            </section>

            <section className="mb-6 grid gap-6 xl:grid-cols-[1.35fr_.95fr]">
                <div className="food-panel">
                    <div className="food-section-head">
                        <div>
                            <p className="food-kicker mb-2">Active Deliveries</p>
                            <h2 className="food-heading !text-[34px]">Current Missions</h2>
                        </div>
                    </div>

                    {myActiveOrders.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center text-sm text-white/60">
                            No active deliveries. Claim an available order below to get started.
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {myActiveOrders.map((order) => (
                                <div key={order.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                                    <div className="mb-4 flex items-start justify-between gap-3">
                                        <div>
                                            <div className="text-[11px] uppercase tracking-[0.14em] text-[#e8a230]">{order.status}</div>
                                            <h3 className="mt-1 text-xl font-black">{order.restaurant?.name || "Restaurant"}</h3>
                                        </div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                                            #{order.id.slice(-6).toUpperCase()}
                                        </div>
                                    </div>

                                    {order.status === "PICKED_UP" ? (
                                        <div className="space-y-4">
                                            <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                                                <div className="text-[11px] uppercase tracking-[0.14em] text-white/55">Drop-off</div>
                                                <div className="mt-1 font-bold">{order.deliveryAddress}</div>
                                                {order.customerName && (
                                                    <div className="mt-1 text-xs text-[#68c7cc]">Customer: {order.customerName}</div>
                                                )}
                                            </div>
                                            <CompleteDeliveryForm
                                                orderId={order.id}
                                                customerName={order.customerName || order.customer?.name}
                                                deliveryInstructions={order.deliveryInstructions}
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                                                <div className="text-[11px] uppercase tracking-[0.14em] text-white/55">Pickup</div>
                                                <div className="mt-1 font-bold">{order.restaurant?.address}</div>
                                            </div>
                                            <PickupPhotoForm orderId={order.id} restaurantName={order.restaurant?.name} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="food-panel">
                        <p className="food-kicker mb-2">Navigation</p>
                        <h3 className="food-heading !text-[30px] mb-4">Live Map + Heatmap</h3>
                        <DriverMap initialCenter={driverLat !== null && driverLng !== null ? { lat: driverLat, lng: driverLng } : null} />
                    </div>
                    <div className="food-panel">
                        <p className="food-kicker mb-2">Driver Essentials</p>
                        <h3 className="food-heading !text-[30px] mb-4">Payments and Tools</h3>
                        <div className="grid gap-2">
                            <Link href="/driver/dashboard/account" className="btn btn-gold justify-center">Stripe Payout Setup</Link>
                            <Link href="/driver/dashboard/earnings" className="btn btn-ghost justify-center">Settlement History</Link>
                            <Link href="/driver/dashboard/help" className="btn btn-ghost justify-center">TrueServe AI Support</Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="food-panel mb-10">
                <p className="food-kicker mb-2">Available Orders</p>
                <h2 className="food-heading !text-[34px] mb-4">Nearby Opportunities</h2>

                {availableOrders.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center text-sm text-white/60">
                        No nearby opportunities right now.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {availableOrders.map((order) => (
                            <div key={order.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-black">{order.restaurant?.name}</h3>
                                    <span className="text-[11px] uppercase tracking-[0.12em] text-[#68c7cc]">Live</span>
                                </div>
                                <p className="mb-4 text-sm text-white/65">{order.restaurant?.address}</p>
                                <div className="mb-4 flex items-center gap-2">
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
                                    <button className="place-btn">Accept Order</button>
                                </form>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
