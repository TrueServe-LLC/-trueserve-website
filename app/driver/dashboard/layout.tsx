import { getAuthSession } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DriverDashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuth, userId, role } = await getAuthSession();
    const cookieStore = await cookies();
    const cookieUserId = cookieStore.get("userId")?.value;
    
    // DEMO BACKDOOR: Always allow this specific ID if matches cookie or session
    const DEMO_DRIVER_ID = "a18a0115-5238-4e82-a2e1-0020e2c40ba1";
    const activeUserId = userId || cookieUserId;

    console.log("[DriverLayout] isAuth:", isAuth, "userId:", userId, "cookieUserId:", cookieUserId);

    if (!activeUserId) {
        console.log("[DriverLayout] Redirecting: No userId in session or cookie");
        redirect('/driver/login?next=/driver/dashboard');
    }

    // Shield: Ensure only registered drivers can access these subpages
    // Use supabaseAdmin to bypass RLS since the user might only be 
    // authenticated via our custom cookie (e.g. mock login)
    const { data: driver } = await supabaseAdmin
        .from('Driver')
        .select('*, user:User(*)')
        .eq('userId', activeUserId)
        .maybeSingle();

    console.log("[DriverLayout] Driver record found:", !!driver);

    if (!driver) {
        // If they are logged in but not a driver, send them to the driver landing
        console.log("[DriverLayout] Redirecting to /driver: No driver record");
        redirect('/driver');
    }

    const driverInitials = (driver as any).user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'DR';
    const balance = Number((driver as any).balance || 0);

    return (
        <div className="min-h-screen bg-black text-slate-200 pb-24 md:pb-0">
            <nav className="hidden md:block sticky top-0 z-50 bg-slate-900/50 backdrop-blur-md border-b border-white/10">
                <div className="container px-4 overflow-x-auto custom-scrollbar">
                    <div className="flex items-center gap-6 h-16 text-sm font-medium whitespace-nowrap">
                        <Link href="/driver/dashboard" className="text-white hover:text-primary transition-colors">Home</Link>
                        <Link href="/driver/dashboard/account" className="text-slate-400 hover:text-white transition-colors">Account</Link>
                        <Link href="/driver/dashboard/ratings" className="text-slate-400 hover:text-white transition-colors">Ratings</Link>
                        <Link href="/driver/dashboard/earnings" className="text-slate-400 hover:text-white transition-colors">Earnings</Link>
                        <Link href="/driver/dashboard/preferences" className="text-slate-400 hover:text-white transition-colors">Preferences</Link>
                        <Link href="/driver/dashboard/help" className="text-slate-400 hover:text-white transition-colors">Help</Link>
                    </div>
                </div>
            </nav>

            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-40 bg-black/80 backdrop-blur-2xl border-b border-white/10 px-4 py-3 flex justify-between items-center">
                <Link href="/driver/dashboard" className="flex items-center gap-2">
                    <img src="/logo.png" alt="TS" className="w-8 h-8 rounded-full border border-white/10" />
                    <span className="text-lg font-black tracking-tight text-white uppercase tracking-widest text-[10px]">
                        Driver <span className="text-emerald-500">Board</span>
                    </span>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
                            <span className="text-[9px] uppercase font-black text-emerald-500">Online</span>
                        </div>
                        <span className="text-sm font-black text-white">${balance.toFixed(2)}</span>
                    </div>
                    <Link href="/driver/dashboard/account" className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                        {driverInitials}
                    </Link>
                </div>
            </div>
            <main className="container py-8">{children}</main>
        </div>
    );
}
