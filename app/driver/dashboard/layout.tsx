import { getAuthSession } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import ModeToggle from "@/components/ModeToggle";
import NotificationBell from "@/components/NotificationBell";
import SpotCheckTrigger from "@/components/SpotCheckTrigger";
import SupportWidget from "@/components/SupportWidget";

export const dynamic = 'force-dynamic';

export default async function DriverDashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuth, userId, role } = await getAuthSession();
    const cookieStore = await cookies();
    const cookieUserId = cookieStore.get("userId")?.value;
    
    const activeUserId = userId || cookieUserId;

    if (!activeUserId) {
        redirect('/driver/login?next=/driver/dashboard');
    }

    const { data: driver } = await supabaseAdmin
        .from('Driver')
        .select('*, user:User(*)')
        .eq('userId', activeUserId)
        .maybeSingle();

    if (!driver) {
        redirect('/driver');
    }

    const driverInitials = (driver as any).user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'DR';
    const balance = Number((driver as any).balance || 0);

    return (
        <div className="min-h-screen bg-black text-slate-200">
            {/* Standardized Top-Nav (Matches Discovery Dashboard) */}
            <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-black/60 border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-8 h-8 rounded-full border border-white/10 shadow-lg" />
                        <span className="text-xl font-black tracking-tighter text-white">True<span className="text-primary">Serve</span></span>
                    </Link>
                    <div className="h-6 w-px bg-white/10 mx-2"></div>
                    <nav className="flex items-center gap-1">
                        <Link href="/restaurants" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 transition-colors">🍴 Order Food</Link>
                        <Link href="/driver/dashboard" className="badge-subtle-primary text-[10px] py-1.5 border-none">🛵 Fleet Dashboard</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-4 mr-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                        <div className="flex flex-col items-end">
                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Available Balance</p>
                            <p className="text-emerald-400 text-[10px] font-black">${balance.toFixed(2)}</p>
                        </div>
                    </div>
                    {driver && <NotificationBell userId={(driver as any).userId} />}
                    <ModeToggle />
                    <SpotCheckTrigger />
                    <Link href="/driver/dashboard/account" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/10 hover:bg-white/10 transition-all font-black text-xs">
                        {driverInitials}
                    </Link>
                </div>
            </nav>

            {/* Secondary Sub-Nav for Driver Dashboard Sections */}
            <div className="bg-white/[0.02] border-b border-white/5 px-6 overflow-x-auto no-scrollbar scroll-smooth sticky top-[73px] z-40 backdrop-blur-md">
                <div className="container px-4">
                    <div className="flex items-center gap-8 h-12 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                        <Link href="/driver/dashboard" className="text-primary border-b border-primary h-full flex items-center">Home</Link>
                        <Link href="/driver/dashboard/earnings" className="text-slate-500 hover:text-white h-full flex items-center transition-colors">Earnings</Link>
                        <Link href="/driver/dashboard/ratings" className="text-slate-500 hover:text-white h-full flex items-center transition-colors">Ratings</Link>
                        <Link href="/driver/dashboard/preferences" className="text-slate-500 hover:text-white h-full flex items-center transition-colors">Preferences</Link>
                        <Link href="/driver/dashboard/account" className="text-slate-500 hover:text-white h-full flex items-center transition-colors">Account</Link>
                        <button className="text-slate-600 hover:text-red-400 h-full flex items-center transition-colors ml-auto">Exit Shift</button>
                    </div>
                </div>
            </div>

            <main className="">
                {children}
            </main>

            {/* AI Support Copilot */}
            <SupportWidget role="DRIVER" />
        </div>
    );
}
