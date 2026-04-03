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
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@400;500&family=Barlow+Condensed:ital,wght@0,700;0,800&display=swap" rel="stylesheet" />
            <style>{`
                .db { background: #0c0e13 !important; font-family: 'DM Sans', sans-serif; color: #fff !important; min-height: 100vh; }
                
                .db-main { padding: 40px 16px; max-width: 1400px; margin: 0 auto; }
                .db-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 40px; }
                @media (max-width: 1024px) { .db-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (max-width: 640px) { .db-grid { grid-template-columns: 1fr; } }
                
                .text-gold { color: #e8a230 !important; }
                .text-green { color: #3dd68c !important; }
                .text-white { color: #ffffff !important; }
                
                /* Cards */
                .db-stat-card { background: #11131a; border: 1px solid #1c1f28; padding: 24px; border-radius: 24px; position: relative; overflow: hidden; }
                .db-stat-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #666; letter-spacing: 0.1em; margin-bottom: 4px; }
                .db-stat-value { font-size: 42px; font-weight: 900; font-style: italic; letter-spacing: -0.02em; color: #fff; line-height: 1; }
                .db-card-icon { position: absolute; top: 12px; right: 12px; font-size: 32px; opacity: 0.1; }

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
                <div className="db-nav-links">
                    <Link href="/restaurants" className="db-nav-link text-slate-500 hover:text-white transition-colors">Marketplace</Link>
                    <Link href="/driver/dashboard" className="db-nav-link active">Dashboard</Link>
                    <Link href="/driver" className="db-nav-link">Order Food</Link>
                </div>
                <div className="flex items-center gap-4 ml-auto">
                    <div className="flex flex-col items-end mr-2">
                        <p className="text-[7px] text-[#444] uppercase font-black tracking-widest leading-none">Balance</p>
                        <p className="text-[#e8a230] text-[11px] font-mono font-black border-r border-[#1c1f28] pr-4 leading-none">${balance.toFixed(2)}</p>
                    </div>
                    {driverData && <NotificationBell userId={driverData.userId} />}
                    <div className="flex gap-[1px] bg-[#1c1f28] border border-[#1c1f28]">
                        <div className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-[#e8a230] text-black cursor-pointer">Delivery</div>
                        <div className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-[#131720] text-[#555] cursor-pointer">Pickup</div>
                    </div>
                    <Link href="/driver/dashboard/account" className="db-badge db-badge-gray !px-3 font-mono">
                        {driverInitials}
                    </Link>
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
