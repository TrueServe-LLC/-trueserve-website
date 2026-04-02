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
        <div className="db min-h-screen">
            {/* Standardized Portal Nav (Matches Admin) */}
            <div className="db-nav">
                <div className="db-nav-brand">True <span>SERVE</span></div>
                <div className="db-nav-links font-sans">
                    <Link href="/restaurants" className="db-nav-link">🍴 Order Food</Link>
                    <Link href="/driver/dashboard" className="db-nav-link active">Fleet Dashboard</Link>
                    <div className="flex items-center gap-3 ml-4">
                        <div className="hidden md:flex items-center gap-4 bg-white/5 px-4 py-1.5 border border-white/5 h-8">
                            <div className="flex flex-col items-end">
                                <p className="text-[7px] text-slate-500 uppercase font-black tracking-widest leading-none">Balance</p>
                                <p className="text-emerald-400 text-[10px] font-black leading-none">${balance.toFixed(2)}</p>
                            </div>
                        </div>
                        {driver && <NotificationBell userId={(driver as any).userId} />}
                        <ModeToggle />
                        <Link href="/driver/dashboard/account" className="db-badge db-badge-gray !px-3 font-mono">
                            {driverInitials}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Secondary Sub-Nav for Driver Dashboard Sections */}
            <div className="bg-[#0f1219] border-b border-[#1c1f28] px-6 overflow-x-auto no-scrollbar scroll-smooth sticky top-[52px] z-40 backdrop-blur-md">
                <div className="container mx-auto">
                    <div className="flex items-center gap-8 h-10 text-[10px] font-bold uppercase tracking-[0.12em] whitespace-nowrap">
                        <Link href="/driver/dashboard" className="text-[#e8a230] border-b border-[#e8a230] h-full flex items-center">Home</Link>
                        <Link href="/driver/dashboard/earnings" className="text-[#888] hover:text-white h-full flex items-center transition-colors">Earnings</Link>
                        <Link href="/driver/dashboard/ratings" className="text-[#888] hover:text-white h-full flex items-center transition-colors">Ratings</Link>
                        <Link href="/driver/dashboard/preferences" className="text-[#888] hover:text-white h-full flex items-center transition-colors">Preferences</Link>
                        <Link href="/driver/dashboard/account" className="text-[#888] hover:text-white h-full flex items-center transition-colors">Account</Link>
                        <button className="text-[#444] hover:text-red-400 h-full flex items-center transition-colors ml-auto">Exit Shift</button>
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
