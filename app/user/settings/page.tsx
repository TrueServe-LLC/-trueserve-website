import Link from "next/link";
import ProfileAvatar from "@/components/ProfileAvatar";
import Logo from "@/components/Logo";
import { getAuthSession } from "@/app/auth/actions";
import WalletUI from "@/components/WalletUI";
import { supabaseAdmin } from "@/lib/supabase-admin";
import ReferralCard from "@/components/ReferralCard";

export const dynamic = "force-dynamic";

export default async function UserSettings() {
    const { isAuth, userId } = await getAuthSession();
    if (!isAuth || !userId) return null;

    const { data: user } = await supabaseAdmin.from('User').select('*').eq('id', userId).maybeSingle();

    if (!user) return null;

    return (
        <div className="food-app-shell">
            <nav className="food-app-nav">
                <div className="mx-auto flex items-center justify-between px-4 sm:px-0" style={{ width: "min(1180px, calc(100% - 32px))", padding: "14px 0" }}>
                    <Logo size="sm" />
                    <Link href="/" className="btn btn-ghost">← Back to Home</Link>
                </div>
            </nav>

            <main className="food-app-main">
                <section className="food-panel">
                    <div className="flex flex-col items-center gap-7 md:flex-row md:items-start">
                        <ProfileAvatar
                            userId={userId}
                            initialName={user?.name || ""}
                            initialColor={user?.avatarColor || "#E8A230"}
                            initialUrl={user?.avatarUrl}
                            className="h-32 w-32 md:h-36 md:w-36"
                        />
                        <div className="w-full text-center md:text-left">
                            <p className="food-kicker mb-3">Customer Profile</p>
                            <h1 className="food-heading">Account Settings</h1>
                            <p className="food-subtitle !max-w-none mt-2">{user?.email}</p>
                            <div className="food-chip-row mt-4">
                                <div className="food-chip"><span className="food-chip-dot" /> Click avatar to upload photo or choose a preset</div>
                                <div className="food-chip"><span className="food-chip-dot" /> Wallet and cards managed below</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid gap-6 md:grid-cols-2">
                    <article className="food-card">
                        <p className="food-kicker mb-2">Profile</p>
                        <h3 className="food-heading !text-[30px] mb-2">Personal Info</h3>
                        <p className="text-sm leading-7 text-white/70 mb-4">Update your name, phone, and address details.</p>
                        <Link href="/user/settings/info" className="btn btn-gold">Edit Info</Link>
                    </article>

                    <article className="food-card">
                        <p className="food-kicker mb-2">Security</p>
                        <h3 className="food-heading !text-[30px] mb-2">Password</h3>
                        <p className="text-sm leading-7 text-white/70 mb-4">Manage your account password and sign-in safety.</p>
                        <Link href="/update-password" className="btn btn-ghost">Update Password</Link>
                    </article>

                    <article className="food-card">
                        <p className="food-kicker mb-2">Payments</p>
                        <h3 className="food-heading !text-[30px] mb-2">Wallet</h3>
                        <p className="text-sm leading-7 text-white/70 mb-4">Add and remove saved cards for faster checkout.</p>
                        <a href="#wallet" className="btn btn-gold">Manage Wallet</a>
                    </article>

                    <article className="food-card">
                        <p className="food-kicker mb-2">Loyalty</p>
                        <h3 className="food-heading !text-[30px] mb-2">TrueServe Rewards</h3>
                        <p className="text-sm leading-7 text-white/70 mb-4">
                            Current tier: <span className="text-[#f97316] font-bold">{user.plan || "Basic"}</span>. Manage points and membership here.
                        </p>
                        <Link href="/rewards" className="btn btn-gold">Open Rewards</Link>
                    </article>

                    <ReferralCard userId={userId} />
                </section>

                <section id="wallet" className="mt-8">
                    <div className="food-panel">
                        <div className="food-section-head">
                            <div>
                                <p className="food-kicker mb-2">Payments</p>
                                <h2 className="food-heading">Saved Methods</h2>
                            </div>
                            <Link href="/restaurants" className="btn btn-ghost">Order Food</Link>
                        </div>
                        <WalletUI userId={userId} />
                    </div>
                </section>
            </main>
        </div>
    );
}
