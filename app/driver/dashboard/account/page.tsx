import { getDriverOrRedirect } from "@/lib/driver-auth";
import { createClient } from "@/lib/supabase/server";
import { createDriverStripeAccount } from "../../actions";
import { logout } from "@/app/auth/actions";
import Link from "next/link";
import DriverProfileForm from "@/components/DriverProfileForm";
import { getAuthSession } from "@/app/auth/actions";

export const dynamic = 'force-dynamic';

export default async function DriverAccount() {
    const driver = await getDriverOrRedirect();
    const { userId } = await getAuthSession();

    if (!userId) {
        return <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-xl">Authentication error.</div>;
    }
    
    // We need a user object for the UI (email, metadata)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fallback if Supabase user is missing but we have a driver record (e.g. mock login)
    const displayEmail = user?.email || "driver@mock.com";
    const displayName = user?.user_metadata?.displayName || "Demo Driver";

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold">Account</h1>

            <div className="card bg-white/5 border-white/10 p-6 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                {driver.photoUrl ? (
                    <img src={driver.photoUrl} alt="Driver" className="w-24 h-24 md:w-20 md:h-20 rounded-full object-cover border-4 border-primary/30 shadow-2xl" />
                ) : (
                    <div className="w-24 h-24 md:w-20 md:h-20 rounded-full bg-primary/20 flex items-center justify-center text-4xl md:text-3xl font-bold text-primary border-4 border-primary/30 shadow-2xl shrink-0">
                        {displayEmail.charAt(0).toUpperCase()}
                    </div>
                )}
                <div>
                    <h2 className="text-2xl md:text-xl font-black">{displayName}</h2>
                    <p className="text-slate-400 font-bold text-sm">Driver since • {new Date(driver.createdAt).toLocaleDateString()}</p>
                    {driver.aboutMe && (
                        <p className="mt-4 text-white italic max-w-lg">"{driver.aboutMe}"</p>
                    )}
                    <div className="flex justify-center md:justify-start gap-2 mt-4 md:mt-2">
                        <span className={`px-2 py-1 ${driver.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/20 text-slate-400'} text-[10px] font-black uppercase rounded tracking-widest`}>
                            {driver.status}
                        </span>
                        <span className="px-2 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase rounded tracking-widest border border-primary/20">Standard Tier</span>
                    </div>
                </div>
            </div>

            {/* Public Profile Settings */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold uppercase tracking-wider text-slate-500 text-[10px]">Public Profile</h3>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 font-black uppercase tracking-widest">Visible to Customers</span>
                </div>
                <DriverProfileForm driver={driver} />
            </section>

            {/* Payout Settings / Stripe Section */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold uppercase tracking-wider text-slate-500 text-[10px]">Payout Settings</h3>
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-black uppercase tracking-widest">Secure</span>
                </div>
                <div className="card bg-gradient-to-br from-white/5 to-transparent border-white/10 p-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-2xl shadow-lg border border-blue-600/30">💳</div>
                        <div className="flex-1 text-center md:text-left">
                            <h4 className="font-bold text-lg">Stripe Connect</h4>
                            <p className="text-xs text-slate-400 max-w-sm mt-1">
                                {(driver as any).stripeAccountId
                                    ? "Your account is linked. We use Stripe for all payouts and earnings."
                                    : "Connect your Stripe account to receive instant payouts for your deliveries."}
                            </p>
                        </div>
                        <form action={async () => {
                            "use server";
                            await createDriverStripeAccount();
                        }}>
                            <button className={`btn ${(driver as any).stripeAccountId ? 'btn-outline border-white/10 text-slate-400 pointer-events-none' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 border-none px-6 py-2.5'}`}>
                                {(driver as any).stripeAccountId ? 'Account Linked ✓' : 'Connect Stripe'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-slate-500 text-[10px]">Personal Details</h3>
                <div className="card bg-white/5 border-white/10 p-0 overflow-hidden divide-y divide-white/5">
                    <div className="p-4 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Email</span>
                        <span className="text-white text-sm font-semibold">{displayEmail}</span>
                    </div>
                    <div className="p-4 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Support Code</span>
                        <span className="text-white text-xs font-mono">{driver.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-slate-500 text-[10px]">Vehicle & Documents</h3>
                <div className="card bg-white/5 border-white/10 p-0 overflow-hidden divide-y divide-white/5">
                    <div className="p-4 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                        <div>
                            <p className="text-white font-semibold capitalize">{driver.vehicleType?.toLowerCase() || 'Vehicle'}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Registered Carrier</p>
                        </div>
                        <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">Approved</span>
                    </div>
                </div>
            </section>

            <form action={logout}>
                <button type="submit" className="w-full btn btn-outline border-red-500/20 text-red-500 hover:bg-red-500/10 py-4 font-black uppercase tracking-widest text-xs transition-all">Sign Out</button>
            </form>
        </div>
    );
}
