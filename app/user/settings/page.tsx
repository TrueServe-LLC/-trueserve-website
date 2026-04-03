import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import ProfileAvatar from "@/components/ProfileAvatar";
import Logo from "@/components/Logo";
import { getAuthSession } from "@/app/auth/actions";

export const dynamic = "force-dynamic";

export default async function UserSettings() {
    const { isAuth, userId, name, role } = await getAuthSession();
    if (!isAuth || !userId) return null;

    const cookieStore = await cookies();
    const supabase = await createClient();
    const { data: user } = await supabase.from('User').select('*').eq('id', userId).single();

    interface SettingItem {
        icon: string;
        title: string;
        sub: string;
        href: string;
        right?: string;
        badge?: string;
    }

    const sections: { label: string; items: SettingItem[] }[] = [
        {
            label: "Account",
            items: [
                { icon: "👤", title: "Personal Info", sub: "Name, email, phone number", href: "/user/settings/info" },
                { icon: "🔒", title: "Password & Security", sub: "Manage your login security", href: "/user/settings/security" },
            ]
        },
        {
            label: "Payment",
            items: [
                { icon: "💳", title: "Saved Cards", sub: "Manage payment methods", href: "/user/settings/payment", right: "+" },
                { icon: "⭐", title: "TrueServe Plus", sub: "Unlimited free delivery", href: "/plus", badge: "Upgrade" },
            ]
        },
        {
            label: "Preferences",
            items: [
                { icon: "🔔", title: "Notifications", sub: "Order updates, offers, news", href: "/user/settings/notifications" },
                { icon: "📍", title: "Saved Addresses", sub: "Home, work, and more", href: "/user/settings/addresses" },
            ]
        },
        {
            label: "Partnerships",
            items: [
                { icon: "🏎️", title: "Apply to Fleet", sub: "Become a professional driver", href: "/driver/signup" },
                { icon: "🏛️", title: "Merchant Hub", sub: "Register your restaurant", href: "/merchant/signup" },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#F0EDE8] font-barlow overflow-x-hidden pb-32">
            {/* AMBIENT LIGHTING */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute w-[300px] h-[300px] top-[-100px] right-[-100px] bg-[#E8A020]/10 rounded-full blur-[100px]" />
                <div className="absolute w-[250px] h-[250px] top-[40%] left-[-80px] bg-[rgba(232,162,48,0.05)] rounded-full blur-[80px]" />
            </div>

            {/* ── MOBILE APP VIEW ── */}
            <div className="lg:hidden max-w-[430px] mx-auto min-h-screen relative flex flex-col z-10 animate-up px-5 pt-10">
                
                {/* PROFILE HEADER */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-[#141417] border border-white/5 flex items-center justify-center text-4xl shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#E8A020]/20 to-transparent" />
                            <ProfileAvatar 
                                userId={userId} 
                                initialName={user?.name || ""} 
                                initialColor={user?.avatarColor || "#E8A230"} 
                                initialUrl={user?.avatarUrl} 
                                className="w-full h-full object-cover rounded-[2.5rem]"
                            />
                        </div>
                        <Link href="/user/settings/info" className="absolute -bottom-2 -right-2 bg-[#E8A020] text-black w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-[#0A0A0A] shadow-lg active:scale-90 transition-all">
                            <span className="text-xl">✏️</span>
                        </Link>
                    </div>
                    <h1 className="font-bebas text-4xl italic tracking-widest text-white uppercase mt-6 mb-1">{user?.name || "TRUE SERVE ELITE"}</h1>
                    <p className="font-barlow-cond text-[10px] font-black uppercase tracking-[0.3em] text-[#E8A020] animate-pulse italic">SECTOR OPERATIVE · {user?.email}</p>
                </div>

                {/* ELITE CARDS */}
                <div className="space-y-8">
                    {/* SECTION: OPERATIONAL CONTROLS */}
                    <div>
                        <h2 className="font-bebas text-2xl italic tracking-widest text-[#555] uppercase mb-4 px-2">Operational Controls</h2>
                        <div className="bg-[#0d0d0d] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            {[
                                { label: 'Personal Information', sub: 'ID & Contact Records', icon: '👤', href: '/user/settings/info' },
                                { label: 'Active Missions', sub: 'Order Tracking Hub', icon: '🚚', href: '/orders' },
                                { label: 'Security Protocols', sub: 'Password & Auth Hooks', icon: '🔐', href: '#' },
                                { label: 'Settlement Synchronizer', sub: 'Payment Methods & Logic', icon: '💳', href: '#' },
                            ].map((item, i) => (
                                <Link key={i} href={item.href} className={`flex items-center gap-5 p-6 active:bg-white/[0.02] transition-colors ${i !== 3 ? 'border-b border-white/5' : ''}`}>
                                    <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-xl">{item.icon}</div>
                                    <div className="flex-1">
                                        <p className="font-bold text-white tracking-tight uppercase barlow-cond italic text-lg">{item.label}</p>
                                        <p className="font-barlow-cond text-[10px] font-black uppercase tracking-widest text-[#444] mt-0.5">{item.sub}</p>
                                    </div>
                                    <span className="text-[#E8A020] opacity-30 text-xl font-bold tracking-tighter">➔</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* SECTION: PARTNERSHIPS - CRITICAL FOR PORTAL ACCESS */}
                    <div>
                        <h2 className="font-bebas text-2xl italic tracking-widest text-white uppercase mb-4 px-2 animate-blink">Elite Portal Access</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/merchant/signup" className="group relative bg-[#0c0c0e] border border-[#E8A020]/20 p-7 rounded-[3rem] shadow-2xl active:scale-95 transition-all overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">🏬</div>
                                <h3 className="font-bebas text-3xl italic text-white tracking-widest uppercase leading-none">Merchant<br />Hub</h3>
                                <p className="font-barlow-cond text-[9px] font-black uppercase tracking-widest text-[#E8A020] mt-4 italic bg-[#E8A020]/10 py-1.5 px-3 rounded-lg inline-block">Execute Login ➔</p>
                            </Link>
                            <Link href="/driver/signup" className="group relative bg-[#0c0c0e] border border-[#3dd68c]/20 p-7 rounded-[3rem] shadow-2xl active:scale-95 transition-all overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">🏎️</div>
                                <h3 className="font-bebas text-3xl italic text-white tracking-widest uppercase leading-none">Fleet<br />Terminal</h3>
                                <p className="font-barlow-cond text-[9px] font-black uppercase tracking-widest text-[#3dd68c] mt-4 italic bg-[#3dd68c]/10 py-1.5 px-3 rounded-lg inline-block">Join Fleet ➔</p>
                            </Link>
                        </div>
                    </div>

                    {/* LOGOUT */}
                    <div className="pt-6">
                        <LogoutButton className="w-full bg-[#111] border border-red-500/10 text-[#444] font-barlow-cond font-black text-xs uppercase tracking-[0.3em] py-6 rounded-[2rem] transition-all hover:bg-black hover:text-red-500 active:scale-95 italic" />
                    </div>

                    <div className="flex flex-col items-center opacity-10 pb-10">
                        <Logo size="sm" />
                        <p className="font-barlow-cond text-[9px] font-black tracking-[0.5em] uppercase mt-4">TrueServe Protocol V2.6</p>
                    </div>
                </div>
            </div>

            {/* ── DESKTOP VIEW ── */}
            <div className="hidden lg:block">
                <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md px-24 py-6 flex justify-between items-center">
                    <Logo size="sm" />
                    <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">← Back to Home</Link>
                </nav>
                <main className="max-w-4xl mx-auto py-24 px-12">
                    <div className="flex items-center gap-10 mb-16 animate-slide-up">
                        <ProfileAvatar 
                            userId={userId} 
                            initialName={user?.name || ""} 
                            initialColor={user?.avatarColor || "#E8A230"} 
                            initialUrl={user?.avatarUrl} 
                            className="w-40 h-40 border-2 border-white/10 rounded-full flex items-center justify-center text-4xl shadow-2xl"
                        />
                        <div>
                            <h1 className="text-5xl font-serif text-white mb-2 italic">Account Settings</h1>
                            <p className="text-zinc-500 font-medium text-lg leading-relaxed">{user?.email}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="p-10 card-glass flex items-start gap-8 hover:border-primary/30 transition-all group">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">👤</div>
                            <div>
                                <h3 className="text-2xl font-serif text-white mb-3">Personal Information</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-6">Update your name and primary email address.</p>
                                <Link href="/user/settings/info" className="text-primary font-bold text-sm tracking-widest uppercase hover:underline">Edit Records →</Link>
                            </div>
                        </div>
                        <div className="p-10 card-glass flex items-start gap-8 opacity-60 hover:border-primary/30 transition-all group">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🔐</div>
                            <div>
                                <h3 className="text-2xl font-serif text-white mb-3">Password & Security</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-6">Manage your password and security settings.</p>
                                <span className="text-zinc-600 font-bold text-xs tracking-widest uppercase">Encryption Active</span>
                            </div>
                        </div>
                        <div className="p-10 card-glass flex items-start gap-8 opacity-60 hover:border-primary/30 transition-all group">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💳</div>
                            <div>
                                <h3 className="text-2xl font-serif text-white mb-3">Payment Methods</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-6">Add or remove payment methods for faster checkout.</p>
                                <span className="text-zinc-600 font-bold text-xs tracking-widest uppercase">Secure Wallet Ready</span>
                            </div>
                        </div>
                        <div className="p-10 card-glass flex items-start gap-8 hover:border-primary/30 transition-all group border-primary/20">
                            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🤝</div>
                            <div>
                                <h3 className="text-2xl font-serif text-white mb-3">Partnerships</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-6">Grow with TrueServe by becoming a partner.</p>
                                <div className="flex gap-4">
                                    <Link href="/merchant/login" className="text-primary font-extrabold text-sm tracking-widest uppercase hover:underline">Merchant Portal</Link>
                                    <span className="text-zinc-700">|</span>
                                    <Link href="/driver/login" className="text-primary font-extrabold text-sm tracking-widest uppercase hover:underline">Driver Portal</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
