import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ProfileAvatar from "@/components/ProfileAvatar";
import Logo from "@/components/Logo";
import { getAuthSession } from "@/app/auth/actions";
import WalletUI from "@/components/WalletUI";

export const dynamic = "force-dynamic";

export default async function UserSettings() {
    const { isAuth, userId, name, role } = await getAuthSession();
    if (!isAuth || !userId) return null;

    const supabase = await createClient();
    const { data: user } = await supabase.from('User').select('*').eq('id', userId).single();

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0c0e13] text-[#F0EDE8] font-barlow overflow-x-hidden">
            <div>
                <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md px-6 sm:px-24 py-6 flex justify-between items-center">
                    <Logo size="sm" />
                    <Link href="/" className="text-sm font-medium hover:text-[#e8a230] transition-colors">← Back to Home</Link>
                </nav>
                <main className="max-w-4xl mx-auto py-12 sm:py-24 px-6 sm:px-12">
                    <div className="flex flex-col sm:flex-row items-center gap-10 mb-16 animate-slide-up">
                        <ProfileAvatar 
                            userId={userId} 
                            initialName={user?.name || ""} 
                            initialColor={user?.avatarColor || "#E8A230"} 
                            initialUrl={user?.avatarUrl} 
                            className="w-32 h-32 sm:w-40 sm:h-40 border-2 border-white/10 rounded-full flex items-center justify-center text-4xl shadow-2xl"
                        />
                        <div className="text-center sm:text-left">
                            <h1 className="text-4xl sm:text-5xl font-serif text-white mb-2 italic">Account Settings</h1>
                            <p className="zinc-500 font-medium text-lg leading-relaxed">{user?.email}</p>
                            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-white/55">
                                Click your avatar to upload a photo or change color.
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="p-8 sm:p-10 card-glass flex flex-col sm:flex-row items-center sm:items-start gap-8 hover:border-[#e8a230]/30 transition-all group">
                            <div className="w-16 h-16 bg-[#e8a230]/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shrinking-0">👤</div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-2xl font-serif text-white mb-3">Personal Information</h3>
                                <p className="zinc-500 text-sm leading-relaxed mb-6">Update your name and primary email address.</p>
                                <Link href="/user/settings/info" className="text-[#e8a230] font-bold text-sm tracking-widest uppercase hover:underline">Edit Records →</Link>
                            </div>
                        </div>
                        <div className="p-8 sm:p-10 card-glass flex flex-col sm:flex-row items-center sm:items-start gap-8 opacity-60 hover:border-[#e8a230]/30 transition-all group">
                            <div className="w-16 h-16 bg-[#e8a230]/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shrinking-0">🔐</div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-2xl font-serif text-white mb-3">Password & Security</h3>
                                <p className="zinc-500 text-sm leading-relaxed mb-6">Manage your password and security settings.</p>
                                <span className="zinc-600 font-bold text-xs tracking-widest uppercase">Encryption Active</span>
                            </div>
                        </div>
                        <div className="p-8 sm:p-10 card-glass flex flex-col sm:flex-row items-center sm:items-start gap-8 hover:border-[#e8a230]/30 transition-all group border-[#e8a230]/20">
                            <div className="w-16 h-16 bg-[#e8a230]/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shrinking-0">💳</div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-2xl font-serif text-white mb-3">Payment Methods</h3>
                                <p className="zinc-500 text-sm leading-relaxed mb-6">Add or remove payment methods for faster checkout.</p>
                                <a href="#wallet" className="text-[#e8a230] font-bold text-sm tracking-widest uppercase hover:underline">Manage Wallet →</a>
                            </div>
                        </div>
                        <div className="p-8 sm:p-10 card-glass flex flex-col sm:flex-row items-center sm:items-start gap-8 hover:border-[#e8a230]/30 transition-all group border-[#e8a230]/20">
                            <div className="w-16 h-16 bg-[#e8a230]/20 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shrinking-0">🤝</div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-2xl font-serif text-white mb-3">Partnerships</h3>
                                <p className="zinc-500 text-sm leading-relaxed mb-6">Grow with TrueServe by becoming a partner.</p>
                                <div className="flex flex-col sm:flex-row gap-4 items-center">
                                    <Link href="/merchant/login" className="text-[#e8a230] font-extrabold text-sm tracking-widest uppercase hover:underline">Merchant Portal</Link>
                                    <span className="zinc-700 hidden sm:inline">|</span>
                                    <Link href="/driver/login" className="text-[#e8a230] font-extrabold text-sm tracking-widest uppercase hover:underline">Driver Portal</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <section id="wallet" className="mt-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <WalletUI userId={userId} />
                    </section>
                </main>
            </div>
        </div>
    );
}
