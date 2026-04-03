import { supabase } from "@/lib/supabase";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import ProfileAvatar from "@/components/ProfileAvatar";
import { getAuthSession } from "@/app/auth/actions";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function UserSettings() {
    const { isAuth, userId } = await getAuthSession();
    if (!isAuth || !userId) return null;

    const { data: user } = await supabase.from('User').select('*').eq('id', userId).single();

    const sections = [
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
        }
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#F0EDE8] font-barlow overflow-x-hidden pb-[120px]">
            {/* AMBIENT ORBS */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="orb w-[260px] h-[260px] top-[-60px] right-[-80px] bg-[#E8A020]/10" />
                <div className="orb w-[200px] h-[200px] top-[400px] left-[-70px] bg-[#E8A020]/0.06" />
            </div>

            <div className="max-w-[430px] mx-auto min-h-screen relative flex flex-col z-10 bg-[#0A0A0A]/20">
                
                {/* ─── SHARED NAV ─── */}
                <nav className="sticky top-0 z-50 flex items-center justify-between px-[18px] py-[18px] bg-[#0A0A0A]/98 backdrop-blur-xl animate-dn">
                    <Logo size="sm" />
                </nav>

                <main className="px-[18px] py-[14px] animate-up">
                    
                    {/* PROFILE HEADER */}
                    <header className="flex items-center gap-4 bg-[#131313] border border-white/0.05 rounded-[20px] p-[18px] mb-6">
                        <ProfileAvatar 
                            userId={userId} 
                            initialName={user?.name || ""} 
                            initialColor={user?.avatarColor} 
                            initialUrl={user?.avatarUrl} 
                            className="w-[66px] h-[66px] border-2 border-[#E8A020]/20 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                            <h2 className="font-barlow-cond text-[20px] font-bold uppercase tracking-[0.04em] white-space-nowrap overflow-hidden text-overflow-ellipsis">
                                {user?.name || "GUEST"}
                            </h2>
                            <p className="text-[12px] text-[#5A5550] truncate">{user?.email}</p>
                            <div className="inline-flex items-center gap-[5px] bg-[#E8A020]/10 border border-[#E8A020]/20 rounded-full px-[10px] py-[3px] mt-2">
                                <span className="font-barlow-cond text-[11px] font-semibold uppercase tracking-[0.1em] text-[#E8A020]">
                                    ⭐ TrueServe Member
                                </span>
                            </div>
                        </div>
                    </header>

                    {/* SETTINGS SECTIONS */}
                    {sections.map((section, si) => (
                        <section key={si} className="mb-6">
                            <h3 className="font-barlow-cond text-[12px] font-semibold uppercase tracking-[0.22em] text-[#5A5550] mb-2.5 pl-1 italic">
                                {section.label}
                            </h3>
                            <div className="bg-[#131313] border border-white/0.05 rounded-[16px] overflow-hidden">
                                {section.items.map((item, ii) => (
                                    <Link key={ii} href={item.href} className="flex items-center gap-3.5 p-[15px] border-b border-white/0.05 last:border-0 hover:bg-white/0.03 transition-all active:scale-[0.99] group">
                                        <div className="text-[20px] w-6 flex justify-center grayscale group-hover:grayscale-0 transition-all">{item.icon}</div>
                                        <div className="flex-1">
                                            <div className="font-barlow-cond text-[16px] font-bold uppercase tracking-[0.04em] text-white italic">{item.title}</div>
                                            <div className="text-[12px] text-[#5A5550] mt-0.5">{item.sub}</div>
                                        </div>
                                        {item.badge ? (
                                            <div className="bg-[#E8A020]/10 text-[#E8A020] font-barlow-cond text-[11px] font-bold uppercase tracking-[0.08em] px-[9px] py-[3px] rounded-full">
                                                {item.badge}
                                            </div>
                                        ) : (
                                            <div className="text-[#5A5550] text-[14px]">{item.right || "›"}</div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}

                    {/* EMPTY SECTIONS FOR VISUAL FILL */}
                    <div className="mb-6">
                        <h3 className="font-barlow-cond text-[12px] font-semibold uppercase tracking-[0.22em] text-[#5A5550] mb-2.5 pl-1 italic">Mission History</h3>
                        <div className="bg-[#131313] border border-white/0.05 rounded-[16px] p-7 flex flex-col items-center gap-2.5">
                            <div className="text-[34px] opacity-40">📋</div>
                            <div className="font-barlow-cond text-[15px] font-bold uppercase tracking-[0.06em] text-[#5A5550]">No Orders Yet</div>
                            <p className="text-[12px] text-[#5A5550] text-center max-w-[200px] leading-relaxed">Your order history will appear here after your first delivery.</p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <LogoutButton className="w-full bg-transparent border border-[rgba(255,80,80,0.25)] text-[rgba(255,100,100,0.7)] font-barlow-cond font-bold text-[14px] uppercase tracking-[0.1em] py-[14px] rounded-[14px] transition-all hover:bg-[rgba(255,80,80,0.05)] active:scale-[0.98]" />
                    </div>

                </main>

                {/* ─── BOTTOM NAV ─── */}
                <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-[#0C0C0C]/97 backdrop-blur-2xl border-t border-white/5 flex justify-around px-2 pt-[11px] pb-[24px]">
                    <Link href="/" className="flex flex-col items-center gap-1 flex-1 text-[#5A5550] hover:text-[#E8A020] transition-colors">
                        <span className="text-[21px]">🏠</span>
                        <span className="font-barlow-cond text-[10px] font-semibold uppercase tracking-[0.1em]">Home</span>
                    </Link>
                    <Link href="/restaurants" className="flex flex-col items-center gap-1 flex-1 text-[#5A5550] hover:text-[#E8A020] transition-colors">
                        <span className="text-[21px]">🔍</span>
                        <span className="font-barlow-cond text-[10px] font-semibold uppercase tracking-[0.1em]">Explore</span>
                    </Link>
                    <Link href="/orders" className="flex flex-col items-center gap-1 flex-1 text-[#5A5550] hover:text-[#E8A020] transition-colors">
                        <span className="text-[21px]">📋</span>
                        <span className="font-barlow-cond text-[10px] font-semibold uppercase tracking-[0.1em]">Orders</span>
                    </Link>
                    <Link href="/user/settings" className="flex flex-col items-center gap-1 flex-1 text-[#E8A020]">
                        <span className="text-[21px]">👤</span>
                        <span className="font-barlow-cond text-[10px] font-semibold uppercase tracking-[0.1em]">Profile</span>
                    </Link>
                </nav>
            </div>
        </div>
    );
}
