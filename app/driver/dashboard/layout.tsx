import { getAuthSession } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import ModeToggle from "@/components/ModeToggle";
import NotificationBell from "@/components/NotificationBell";
import SupportWidget from "@/components/SupportWidget";

export const dynamic = 'force-dynamic';

export default async function DriverDashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuth, userId, role } = await getAuthSession();
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;
    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) {
        redirect('/driver/login?next=/driver/dashboard');
    }

    let driverData: any = null;

    if (isPreview) {
        driverData = { 
            id: 'preview-driver', 
            userId: 'preview-user-id',
            balance: 125.50,
            user: { name: 'Preview Driver' } 
        };
    } else {
        const { data } = await supabaseAdmin
            .from('Driver')
            .select('*, user:User(*)')
            .eq('userId', activeUserId)
            .maybeSingle();
        
        if (!data) {
            redirect('/driver');
        }
        driverData = data;
    }

    const driverInitials = driverData?.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'DR';
    const balance = Number(driverData?.balance || 0);

    return (
        <>
            <style>{`
                .db { background: #0c0e13 !important; font-family: 'DM Sans', sans-serif; color: #fff !important; min-height: 100vh; }
                
                .db-nav { 
                    display: flex; align-items: center; justify-content: space-between; 
                    padding: 12px 16px; min-height: 52px; background: #0c0e13; border-bottom: 1px solid #1c1f28; 
                    position: sticky; top: 0; z-index: 50; flex-wrap: wrap; gap: 12px;
                }
                .db-nav-brand { display: flex; align-items: center; gap: 6px; font-size: 16px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.02em; }
                .db-nav-brand span { color: #e8a230; }
                
                .db-nav-links { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
                .db-nav-link { 
                    font-size: 10px; font-weight: 600; letter-spacing: 0.08em; color: #888; 
                    padding: 6px 10px; cursor: pointer; text-transform: uppercase; text-decoration: none; transition: color 0.2s;
                }
                .db-nav-link:hover { color: #fff; }
                .db-nav-link.active { color: #e8a230; border-bottom: 2px solid #e8a230; }

                .db-badge { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; padding: 4px 10px; text-transform: uppercase; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; }
                .db-badge-gray { background: #1a1c24; color: #666; border: 1px solid #2a2f3a; }
                
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                @media (max-width: 640px) {
                    .db-nav { padding: 12px; justify-content: center; }
                    .db-nav-links { justify-content: center; width: 100%; }
                    .db-nav-brand { width: 100%; justify-content: center; margin-bottom: 4px; }
                }
            `}</style>

            <div className="db min-h-screen">
            {/* Standardized Portal Nav (Matches Admin) */}
            <div className="db-nav">
                <div className="db-nav-brand">True <span>SERVE</span></div>
                <div className="db-nav-links font-sans">
                    <Link href="/restaurants" className="db-nav-link text-slate-500 hover:text-white transition-colors">Marketplace</Link>
                    <Link href="/driver/dashboard" className="db-nav-link active">Fleet Dashboard</Link>
                    <div className="flex items-center gap-3 ml-4">
                        <div className="hidden md:flex items-center gap-4 bg-white/5 px-4 py-1.5 border border-white/5 h-8">
                            <div className="flex flex-col items-end">
                                <p className="text-[7px] text-slate-500 uppercase font-black tracking-widest leading-none">Balance</p>
                                <p className="text-emerald-400 text-[10px] font-black leading-none">${balance.toFixed(2)}</p>
                            </div>
                        </div>
                        {driverData && <NotificationBell userId={driverData.userId} />}
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
        </>
    );
}
