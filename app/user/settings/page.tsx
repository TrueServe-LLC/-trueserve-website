import { supabase } from "@/lib/supabase";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import WalletUI from "@/components/WalletUI";
import MembershipUI from "@/components/MembershipUI";
import ProfileNameEditor from "@/components/ProfileNameEditor";
import ProfileAvatar from "@/components/ProfileAvatar";
import { getAuthSession } from "@/app/auth/actions";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function UserSettings() {
    const { isAuth, userId } = await getAuthSession();
    if (!isAuth || !userId) return null;

    const { data: user } = await supabase.from('User').select('*').eq('id', userId).single();
    const { data: orders } = await supabase.from('Order').select('*, restaurant:Restaurant(name)').eq('userId', userId).order('createdAt', { ascending: false }).limit(5);
    const { data: savedStoresData } = await supabase.from('Favorite').select('restaurant:Restaurant(*)').eq('userId', userId);
    const savedStores = savedStoresData?.map(s => s.restaurant) || [];

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#F0EDE8] font-barlow-cond pb-32">
            {/* AMBIENT ORBS */}
            <div className="orb w-[300px] h-[300px] top-[-100px] right-[-100px] bg-[#e8a230]/5 animate-pulse-slow" />
            
            {/* NAV */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-5 py-4 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5">
                <Logo size="sm" />
                <div className="flex items-center gap-3">
                    <LogoutButton />
                </div>
            </nav>

            <main className="max-w-[430px] mx-auto px-5 pt-8 space-y-10">
                {/* PROFILE HEADER */}
                <header className="flex items-center gap-6 animate-fade-in">
                    <ProfileAvatar 
                        userId={userId} 
                        initialName={user?.name || ""} 
                        initialColor={user?.avatarColor} 
                        initialUrl={user?.avatarUrl} 
                        className="w-20 h-20 rounded-[2rem] border-2 border-[#e8a230]/20 shadow-[0_0_40px_rgba(232,162,48,0.1)]"
                    />
                    <div className="space-y-1">
                        <ProfileNameEditor userId={userId} initialName={user?.name || "GUEST"} />
                        <p className="text-[#5A5550] text-[10px] font-bold uppercase tracking-widest italic">{user?.email}</p>
                    </div>
                </header>

                {/* WALLET & MEMBERSHIP */}
                <div className="space-y-8 animate-slide-up">
                    <WalletUI userId={userId} />
                    <MembershipUI userId={userId} plan={user?.plan || "Basic"} hasPaymentMethod={!!user?.stripeCustomerId} />
                </div>

                {/* POINTS STATUS */}
                <section className="bg-[#131313] border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#e8a230]/5 blur-[40px] rounded-full -mr-12 -mt-12 pointer-events-none"></div>
                    <h3 className="font-bebas text-white text-3xl uppercase italic leading-none tracking-wider mb-6">Discovery <span className="text-[#e8a230]">POUTS</span></h3>
                    <div className="flex items-end gap-3 mb-6">
                        <span className="text-6xl font-bebas text-white leading-none">{user?.truePointsBalance || 0}</span>
                        <span className="text-[#5A5550] text-xs font-bold uppercase tracking-widest mb-1 italic">PTS ACTIVE</span>
                    </div>
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-[1px]">
                        <div className="h-full bg-[#e8a230] rounded-full shadow-[0_0_15px_#e8a230]" style={{ width: `${Math.min(100, (user?.truePointsBalance || 0) / 10)}%` }} />
                    </div>
                </section>

                {/* RECENT ACTIVITY */}
                <section className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <h3 className="font-bebas text-white text-3xl uppercase italic leading-none tracking-wider">Mission <span className="text-[#e8a230]">LOGS</span></h3>
                        <Link href="/orders" className="text-[10px] font-bold text-[#e8a230] uppercase tracking-widest italic decoration-dotted underline underline-offset-4">VIEW ALL ➔</Link>
                    </div>
                    <div className="space-y-4">
                        {orders && orders.length > 0 ? (
                            orders.map((order: any) => (
                                <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between p-5 bg-[#131313] border border-white/5 rounded-2xl hover:bg-[#1C1C1C] transition-all">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-white tracking-widest">{order.restaurant?.name || "RESTAURANT"}</p>
                                        <p className="text-[9px] text-[#5A5550] font-black uppercase tracking-widest italic">
                                            {new Date(order.createdAt).toLocaleDateString()} · STATUS: {order.status}
                                        </p>
                                    </div>
                                    <span className="text-lg font-bebas text-[#e8a230] italic tracking-wider">${Number(order.total).toFixed(2)}</span>
                                </Link>
                            ))
                        ) : (
                            <div className="py-12 bg-[#131313] border border-white/5 border-dashed rounded-2xl text-center">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5550] italic">No missions logged yet.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* SAVED STORES */}
                <section className="space-y-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <h3 className="font-bebas text-white text-3xl uppercase italic leading-none tracking-wider">Saved <span className="text-[#e8a230]">Hubs</span></h3>
                    <div className="grid grid-cols-2 gap-4">
                        {savedStores.map((store: any) => (
                            <Link key={store.id} href={`/restaurants/${store.id}`} className="bg-[#131313] border border-white/5 rounded-2xl p-4 space-y-3 hover:bg-[#1C1C1C] transition-all group">
                                <div className="aspect-square bg-black/40 rounded-xl flex items-center justify-center text-3xl grayscale group-hover:grayscale-0 transition-all">
                                    🏪
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-white truncate uppercase tracking-widest">{store.name}</p>
                                    <p className="text-[8px] text-[#5A5550] font-black uppercase tracking-widest">{store.city}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>

            {/* BOTTOM NAV */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#0C0C0C]/95 backdrop-blur-2xl border-t border-white/5 px-6 pt-3 pb-8 flex items-center justify-around z-50">
                <Link href="/" className="flex flex-col items-center gap-1 opacity-50"><span className="text-xl">🏠</span><span className="text-[9px] font-bold uppercase tracking-widest">Home</span></Link>
                <Link href="/restaurants" className="flex flex-col items-center gap-1 opacity-50"><span className="text-xl">🔍</span><span className="text-[9px] font-bold uppercase tracking-widest">Explore</span></Link>
                <Link href="/orders" className="flex flex-col items-center gap-1 opacity-50"><span className="text-xl">📋</span><span className="text-[9px] font-bold uppercase tracking-widest">Orders</span></Link>
                <Link href="/user/settings" className="flex flex-col items-center gap-1 text-[#e8a230]"><span className="text-xl">👤</span><span className="text-[9px] font-bold uppercase tracking-widest">Profile</span></Link>
            </div>
        </div>
    );
}
