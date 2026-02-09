import Link from "next/link";

export default function OrdersPage() {
    // In a real app, we would fetch orders here based on the user session.
    // For now, we'll show a placeholder state or a list if available.

    const activeOrders = [
        // Example mock order
        // { id: "123456", restaurant: "Joe's Pizza", status: "PREPARING", total: 25.50, date: new Date().toISOString() }
    ];

    return (
        <div className="min-h-screen bg-black text-slate-200 pb-24">
            <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
                <div className="container flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-xl font-black tracking-tight text-white">
                            Your<span className="text-primary">Orders</span>
                        </span>
                    </Link>
                </div>
            </nav>

            <main className="container max-w-lg mx-auto p-6 space-y-8">
                <section>
                    <h2 className="text-lg font-bold text-white mb-4">Active Orders</h2>
                    {activeOrders.length > 0 ? (
                        <div className="space-y-4">
                            {/* Map orders here */}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🍽️</div>
                            <h3 className="text-lg font-bold text-white mb-2">No active orders</h3>
                            <p className="text-slate-400 text-sm mb-6">Hungry? Find something delicious nearby.</p>
                            <Link href="/restaurants" className="btn btn-primary shadow-lg shadow-primary/20">
                                Browse Restaurants
                            </Link>
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-lg font-bold text-white mb-4">Past Orders</h2>
                    <div className="text-center py-8">
                        <p className="text-slate-500 text-sm">No past orders found.</p>
                    </div>
                </section>
            </main>
        </div>
    );
}
