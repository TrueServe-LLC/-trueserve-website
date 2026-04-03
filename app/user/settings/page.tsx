import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import ProfileAvatar from "@/components/ProfileAvatar";
import Logo from "@/components/Logo";
import { getAuthSession } from "@/app/auth/actions";
import MobileUserSettings from "@/components/MobileUserSettings";

export const dynamic = "force-dynamic";

export default async function UserSettings() {
    const { isAuth, userId, name, role } = await getAuthSession();
    if (!isAuth || !userId) return null;

    const cookieStore = await cookies();
    const supabase = await createClient();
    const { data: user } = await supabase.from('User').select('*').eq('id', userId).single();

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0c0e13] text-[#F0EDE8] font-barlow overflow-x-hidden">
            
            {/* ── MOBILE APP VIEW ── */}
            <MobileUserSettings user={user} />

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
                            <p className="zinc-500 font-medium text-lg leading-relaxed">{user?.email}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="p-10 card-glass flex items-start gap-8 hover:border-primary/30 transition-all group">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">👤</div>
                            <div>
                                <h3 className="text-2xl font-serif text-white mb-3">Personal Information</h3>
                                <p className="zinc-500 text-sm leading-relaxed mb-6">Update your name and primary email address.</p>
                                <Link href="/user/settings/info" className="text-primary font-bold text-sm tracking-widest uppercase hover:underline">Edit Records →</Link>
                            </div>
                        </div>
                        <div className="p-10 card-glass flex items-start gap-8 opacity-60 hover:border-primary/30 transition-all group">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🔐</div>
                            <div>
                                <h3 className="text-2xl font-serif text-white mb-3">Password & Security</h3>
                                <p className="zinc-500 text-sm leading-relaxed mb-6">Manage your password and security settings.</p>
                                <span className="zinc-600 font-bold text-xs tracking-widest uppercase">Encryption Active</span>
                            </div>
                        </div>
                        <div className="p-10 card-glass flex items-start gap-8 opacity-60 hover:border-primary/30 transition-all group">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💳</div>
                            <div>
                                <h3 className="text-2xl font-serif text-white mb-3">Payment Methods</h3>
                                <p className="zinc-500 text-sm leading-relaxed mb-6">Add or remove payment methods for faster checkout.</p>
                                <span className="zinc-600 font-bold text-xs tracking-widest uppercase">Secure Wallet Ready</span>
                            </div>
                        </div>
                        <div className="p-10 card-glass flex items-start gap-8 hover:border-primary/30 transition-all group border-primary/20">
                            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🤝</div>
                            <div>
                                <h3 className="text-2xl font-serif text-white mb-3">Partnerships</h3>
                                <p className="zinc-500 text-sm leading-relaxed mb-6">Grow with TrueServe by becoming a partner.</p>
                                <div className="flex gap-4">
                                    <Link href="/merchant/login" className="text-primary font-extrabold text-sm tracking-widest uppercase hover:underline">Merchant Portal</Link>
                                    <span className="zinc-700">|</span>
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
