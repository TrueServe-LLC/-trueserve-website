
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import Map from "@/components/Map";
import ChatWindow from "@/components/ChatWindow";

async function getOrder(id: string) {
    try {
        return await prisma.order.findUnique({
            where: { id },
            include: {
                restaurant: true,
                driver: { include: { user: true } },
                items: { include: { menuItem: true } }
            }
        });
    } catch (e) {
        return null;
    }
}

export default async function OrderTracking({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = await getOrder(id);

    if (!order) {
        // Mocking for demo if DB entry missing
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
                <div className="container max-w-4xl mx-auto py-12">
                    <h1 className="text-3xl font-bold mb-8">Tracking Order #{id.slice(-6).toUpperCase()}</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="card border-primary/20 bg-primary/5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                                    <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Driver is on the way</p>
                                </div>
                                <h2 className="text-4xl font-bold mb-2">ETA: 8 Minutes</h2>
                                <p className="text-slate-400">Your driver, <span className="text-white font-semibold">Alex</span>, is currently picking up your order from <span className="text-white font-semibold">Bella Italia</span>.</p>
                            </div>
                            <Map center={[40.7128, -74.0060]} zoom={15} />
                        </div>
                        <div className="space-y-6">
                            <ChatWindow orderId={id} />
                            <div className="card bg-white/5 border-white/10 p-6">
                                <h3 className="font-bold mb-4">Order Summary</h3>
                                <div className="space-y-2 text-sm text-slate-400">
                                    <div className="flex justify-between">
                                        <span>1x Margherita Pizza</span>
                                        <span>$14.99</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-white pt-2 border-t border-white/5 mt-2">
                                        <span>Total</span>
                                        <span>$14.99</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <main className="container max-w-5xl py-20">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <Link href="/" className="text-slate-500 hover:text-white transition-colors text-sm mb-2 block">&larr; Back to Home</Link>
                        <h1 className="text-4xl font-bold tracking-tighter">Tracking Order #{order.id.slice(-6).toUpperCase()}</h1>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                        {order.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Real-time Tracking Map */}
                        <div className="card p-0 overflow-hidden relative group">
                            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Estimated ETA</p>
                                <p className="text-xl font-bold">12:45 PM</p>
                            </div>
                            <Map center={[40.7128, -74.0060]} zoom={15} />
                            <div className="p-6 bg-white/5 flex gap-12">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Pick up</p>
                                    <p className="font-bold text-sm">{order.restaurant.name}</p>
                                </div>
                                <div className="p-0.5 bg-white/10 rounded-full h-8 self-center" />
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Driver</p>
                                    <p className="font-bold text-sm">{order.driver?.user.name || "Searching..."}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="card p-8">
                            <h3 className="font-bold text-xl mb-8">Order Timeline</h3>
                            <div className="space-y-8 relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-white/10">
                                <div className="flex gap-6 relative">
                                    <div className="w-4 h-4 rounded-full bg-emerald-400 shrink-0 border-4 border-black z-10" />
                                    <div>
                                        <p className="font-bold">Order Received</p>
                                        <p className="text-sm text-slate-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 relative">
                                    <div className="w-4 h-4 rounded-full bg-emerald-400 shrink-0 border-4 border-black z-10" />
                                    <div>
                                        <p className="font-bold">Preparing Food</p>
                                        <p className="text-sm text-slate-400">Kitchen is busy working on your meal.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 relative">
                                    <div className="w-4 h-4 rounded-full bg-white/20 shrink-0 border-4 border-black z-10" />
                                    <div className="opacity-50">
                                        <p className="font-bold">Out for Delivery</p>
                                        <p className="text-sm text-slate-400">Driver hasn't left the restaurant yet.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <ChatWindow orderId={order.id} />

                        <div className="card p-6 border-primary/20 bg-primary/5">
                            <h3 className="font-bold mb-4">TrueServe+ Benefits</h3>
                            <p className="text-sm text-slate-400 mb-6">Enjoy $0 delivery fees and exclusive perks on every order.</p>
                            <button className="w-full btn btn-primary">Join Membership</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
