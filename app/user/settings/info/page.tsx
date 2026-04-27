import Link from "next/link";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import { getAuthSession } from "@/app/auth/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAccountHomeHref, isCustomerRole } from "@/lib/account-routing";

export const dynamic = "force-dynamic";

export default async function PersonalInfoPage() {
    const { isAuth, userId, role } = await getAuthSession();
    if (!isAuth || !userId) redirect("/login");
    if (!isCustomerRole(role)) redirect(getAccountHomeHref(role));

    const { data: user } = await supabaseAdmin.from("User").select("*").eq("id", userId).maybeSingle();
    if (!user) redirect("/login");

    return (
        <div className="food-app-shell">
            <nav className="food-app-nav">
                <div className="mx-auto flex items-center justify-between px-4 sm:px-0" style={{ width: "min(1180px, calc(100% - 32px))", padding: "14px 0" }}>
                    <Logo size="sm" />
                    <Link href="/user/settings" className="btn btn-ghost">← Back to Settings</Link>
                </div>
            </nav>

            <main className="food-app-main">
                <section className="food-panel">
                    <p className="food-kicker mb-3">Profile Details</p>
                    <h1 className="food-heading">Personal Information</h1>
                    <p className="food-subtitle mt-3 !max-w-none">
                        Keep your account details current for smoother checkout, delivery updates, and support verification.
                    </p>
                </section>

                <section className="mt-8 food-panel">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="fg">
                            <label>Full Name</label>
                            <input type="text" value={user.name || ""} readOnly />
                        </div>
                        <div className="fg">
                            <label>Email Address</label>
                            <input type="email" value={user.email || ""} readOnly />
                        </div>
                        <div className="fg">
                            <label>Phone Number</label>
                            <input type="tel" value={user.phone || ""} readOnly />
                        </div>
                        <div className="fg">
                            <label>Delivery Address</label>
                            <input type="text" value={user.address || ""} readOnly />
                        </div>
                    </div>

                    <div className="food-auth-note mt-6">
                        Profile editing controls will be enabled in this same layout so design remains consistent across all account screens.
                    </div>
                </section>
            </main>
        </div>
    );
}
