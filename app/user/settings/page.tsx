import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import NotificationBell from "@/components/NotificationBell";
import LogoutButton from "@/components/LogoutButton";
import WalletUI from "@/components/WalletUI";
import MembershipUI from "@/components/MembershipUI";
import ProfileNameEditor from "@/components/ProfileNameEditor";

export default async function UserSettings() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
        redirect("/login");
    }

    // Fetch user details
    const { data: user } = await supabase
        .from('User')
        .select('*')
        .eq('id', userId)
        .single();

    // Fetch orders
    const { data: orders } = await supabase
        .from('Order')
        .select('*, restaurant:Restaurant(name)')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

    // Fetch Saved Stores
    const { data: savedStoresData } = await supabase
        .from('Favorite')
        .select('restaurant:Restaurant(*)')
        .eq('userId', userId);

    const savedStores = savedStoresData?.map(s => s.restaurant) || [];



    return (
        <div className="min-h-screen bg-[#080c14] text-slate-200 font-sans">
            <nav className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="container flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-full border border-white/10 group-hover:border-primary transition-all shadow-lg" />
                        <span className="text-2xl font-black tracking-tight text-white">
                            True<span className="text-primary">Serve</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link>
                        {userId && (
                            <>
                                <NotificationBell userId={userId} />
                                <LogoutButton />
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main className="container py-12">
                <h1 className="text-4xl font-bold text-white mb-2">Account Settings</h1>
                <p className="text-slate-400 mb-12">Manage your payment methods and view past orders.</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="card bg-white/5 border border-white/10 p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold border border-primary/20">
                                    {user?.name?.[0] || "U"}
                                </div>
                                <div className="flex-grow">
                                    <ProfileNameEditor userId={userId} initialName={user?.name || ""} />
                                    <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        <WalletUI userId={userId} />
                        <MembershipUI userId={userId} plan={user?.plan || "Basic"} hasPaymentMethod={!!user?.stripeCustomerId} />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* TruePoints Wallet */}
                        <section>
                            <div className="bg-slate-900 border border-orange-500/20 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] -mr-[200px] -mt-[200px] pointer-events-none"></div>
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-12">
                                    <div className="flex-1">
                                        <h3 className="text-orange-400 font-black uppercase tracking-[0.2em] text-xs mb-4 flex items-center gap-3">
                                            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.8)]"></span>
                                            TruePoints Wallet
                                        </h3>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="text-7xl font-black text-white tracking-tighter leading-none">
                                                {user?.truePointsBalance || 0}
                                            </div>
                                            <div className="flex flex-col items-start gap-1 justify-center">
                                                <span className="text-slate-400 font-black text-xl uppercase tracking-widest leading-none">pts</span>
                                                <span className="text-orange-400 font-bold text-xs bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20 mt-1 whitespace-nowrap">
                                                    =${((user?.truePointsBalance || 0) / 100).toFixed(2)} Value
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full md:w-auto bg-black border border-white/5 rounded-3xl p-6 shadow-2xl md:min-w-[320px]">
                                        <div className="flex justify-between items-end mb-4">
                                            <span className="text-[11px] text-slate-500 uppercase font-black tracking-widest leading-none pb-0.5">Next Reward</span>
                                            <div className="text-right">
                                                <span className="text-[13px] text-orange-400 font-black leading-none block border-b border-orange-500/20 pb-1 mb-1">1,000 pts</span>
                                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">$10.00 Off</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden shadow-inner mb-4 border border-white/5">
                                            <div 
                                                className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full relative"
                                                style={{ width: `${Math.min(100, ((user?.truePointsBalance || 0) / 1000) * 100)}%` }}
                                            >
                                                <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30 truncate"></div>
                                            </div>
                                        </div>
                                        {user?.plan !== 'Plus' && (
                                            <div className="pt-4 border-t border-white/5 text-center">
                                                <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                                                    Want to earn <span className="text-orange-400 font-black">3x faster?</span> <Link href="/#subscription" className="text-white underline hover:text-orange-400 transition-colors ml-1">Upgrade to Plus</Link>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Recent Orders</h2>
                            <div className="space-y-4">
                                {orders && orders.length > 0 ? (
                                    orders.map((order: any) => (
                                        <div key={order.id} className="card bg-white/5 border border-white/10 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/10 transition-colors">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-white text-lg">{order.restaurant?.name || "Restaurant"}</h3>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                                                        ${order.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-400 leading-relaxed">
                                                    {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <p className="text-xl font-bold text-white">${Number(order.total).toFixed(2)}</p>
                                                <Link href={`/orders/${order.id}`} className="btn btn-outline text-xs px-4 py-2 border-white/20 text-white hover:bg-white/10">
                                                    View Receipt
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-slate-400 mb-4">No past orders found.</p>
                                        <Link href="/restaurants" className="btn btn-primary">Order Food</Link>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Saved Stores</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {savedStores.length > 0 ? (
                                    savedStores.map((store: any) => (
                                        <Link key={store.id} href={`/restaurants/${store.id}`} className="card bg-white/5 border border-white/10 overflow-hidden hover:bg-white/10 transition-all group">
                                            <div className="h-32 relative">
                                                <img src={store.imageUrl || "/restaurant1.jpg"} alt={store.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] to-transparent" />
                                                <div className="absolute bottom-3 left-4">
                                                    <h4 className="font-bold text-white">{store.name}</h4>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{store.city}, {store.state}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-slate-400">No stores saved yet.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
