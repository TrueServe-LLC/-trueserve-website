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
        <div className="min-h-screen bg-[#000] text-[#F0EDE8] font-sans overflow-x-hidden pb-[160px] animate-in fade-in duration-700">
             <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&family=Barlow+Condensed:ital,wght@0,700;0,800;1,700;1,800&family=Bebas+Neue&display=swap');
                
                .bebas { font-family: 'Bebas Neue', sans-serif; }
                .barlow-cond { font-family: 'Barlow Condensed', sans-serif; }
            ` }} />

            {/* AMBIENT ORBS */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute w-[260px] h-[260px] top-[-60px] right-[-80px] bg-[#E8A020]/10 rounded-full blur-[100px]" />
                <div className="absolute w-[200px] h-[200px] top-[400px] left-[-70px] bg-[#E8A020]/0.04 rounded-full blur-[80px]" />
            </div>

            <div className="max-w-[440px] mx-auto min-h-screen relative flex flex-col z-10">
                
                {/* ─── SHARED NAV ─── */}
                <nav className="flex items-center justify-between px-8 pt-10 pb-6">
                    <Logo size="sm" />
                    <Link href="/hub" className="barlow-cond font-black text-[10px] uppercase tracking-widest text-[#555] hover:text-[#e8a230] transition-all">Command Terminal</Link>
                </nav>

                <main className="px-8 py-4">
                    
                    {/* PROFILE HEADER */}
                    <header className="flex items-center gap-6 bg-[#0d0d0d] border border-white/5 rounded-[2rem] p-6 mb-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#e8a230]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                        <div className="relative z-10 flex items-center gap-6">
                            <ProfileAvatar 
                                userId={userId} 
                                initialName={user?.name || ""} 
                                initialColor={user?.avatarColor || "#E8A230"} 
                                initialUrl={user?.avatarUrl} 
                                className="w-16 h-16 border-2 border-[#E8A020]/20 rounded-full shadow-[0_0_20px_rgba(232,162,48,0.2)]"
                            />
                            <div className="flex-1 min-w-0">
                                <h2 className="font-barlow-cond text-[22px] font-bold uppercase tracking-[0.04em] truncate italic">
                                    {user?.name || "GUEST"}
                                </h2>
                                <p className="font-mono text-[10px] text-[#222] tracking-widest uppercase opacity-60 truncate">{user?.email}</p>
                                <div className="inline-flex items-center gap-[6px] bg-[#E8A020]/10 border border-[#E8A020]/20 rounded-full px-3 py-1 mt-3">
                                    <span className="font-barlow-cond text-[9px] font-black uppercase tracking-[0.14em] text-[#E8A230]">
                                        ⭐ TrueServe Member
                                    </span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* SETTINGS SECTIONS */}
                    {sections.map((section, si) => (
                        <section key={si} className="mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <h3 className="font-barlow-cond text-[11px] font-black uppercase tracking-[0.3em] text-[#333] italic pl-1">
                                    {section.label}
                                </h3>
                                <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
                            </div>
                            <div className="space-y-3">
                                {section.items.map((item, ii) => (
                                    <Link key={ii} href={item.href} className="
                                        flex items-center gap-4 p-5 
                                        bg-[#0d0d0d] border border-white/5 
                                        rounded-2xl transition-all duration-300
                                        hover:bg-[#111] hover:border-[#e8a230]/10 group active:scale-95
                                    ">
                                        <div className="text-[20px] w-6 flex justify-center grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all filter brightness-[0.4] group-hover:brightness-100">{item.icon}</div>
                                        <div className="flex-1">
                                            <div className="font-barlow-cond text-[16px] font-black uppercase tracking-[0.05em] text-white/90 group-hover:text-white transition-colors italic">{item.title}</div>
                                            <div className="text-[11px] font-medium text-[#444] mt-0.5 tracking-wide">{item.sub}</div>
                                        </div>
                                        {item.badge ? (
                                            <div className="bg-[#E8A020]/10 text-[#E8A020] font-barlow-cond text-[10px] font-black uppercase tracking-[0.1em] px-[10px] py-[4px] rounded-full">
                                                {item.badge}
                                            </div>
                                        ) : (
                                            <div className="text-[#222] group-hover:text-[#e8a230] group-hover:translate-x-1 transition-all text-sm">{item.right || "›"}</div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}

                    <div className="pt-8 mb-12">
                        <LogoutButton className="w-full bg-[#0d0d0d] border border-white/5 text-[#444] font-barlow-cond font-black text-[12px] uppercase tracking-[0.25em] py-5 rounded-2xl transition-all hover:bg-[#111] hover:text-[#e24b4a] active:scale-[0.98] italic" />
                    </div>

                    <div className="flex flex-col items-center opacity-10 pb-10">
                         <div className="w-12 h-12 flex items-center justify-center grayscale"><Logo size="sm" /></div>
                         <p className="font-barlow-cond text-[9px] font-black tracking-[0.4em] uppercase mt-4">TrueServe Protocol 2.6.0</p>
                    </div>

                </main>
            </div>
        </div>
    );
}
