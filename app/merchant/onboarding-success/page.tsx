
import Link from "next/link";

export default function OnboardingSuccessPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            {/* Animated Background Gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 -z-10" />

            <div className="max-w-xl w-full">
                {/* Success Icon */}
                <div className="mb-8 relative inline-block">
                    <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                    <div className="relative w-24 h-24 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-4xl shadow-inner">
                        ✅
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                    Account <span className="text-emerald-400 font-serif italic">Verified</span>
                </h1>

                <p className="text-slate-400 text-lg mb-12 leading-relaxed">
                    Welcome to the TrueServe Partner Network! Your Stripe account is now connected and you're officially ready to accept orders and receive payouts.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="text-xl mb-2">🍔</div>
                        <h3 className="font-bold text-sm mb-1">Set Menu</h3>
                        <p className="text-[10px] text-slate-500">Ensure your prices and photos are up to date.</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="text-xl mb-2">🏷️</div>
                        <h3 className="font-bold text-sm mb-1">Live Status</h3>
                        <p className="text-[10px] text-slate-500">Your restaurant is now visible to nearby customers.</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="text-xl mb-2">💰</div>
                        <h3 className="font-bold text-sm mb-1">Payouts</h3>
                        <p className="text-[10px] text-slate-500">Funds from orders will hit your bank account daily.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/merchant/dashboard"
                        className="btn btn-primary px-8 py-3 text-lg shadow-xl shadow-primary/20"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        href="/merchant/dashboard?tab=menu"
                        className="btn btn-outline px-8 py-3 text-lg border-white/10 hover:bg-white/5"
                    >
                        Manage Menu
                    </Link>
                </div>
            </div>

            {/* Support Footer */}
            <p className="mt-20 text-slate-500 text-sm">
                Need help? Contact our <span className="text-white hover:underline cursor-pointer">Merchant Support Team</span>.
            </p>
        </div>
    );
}
