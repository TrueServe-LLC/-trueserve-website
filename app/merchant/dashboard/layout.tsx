import { getAuthSession } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import MerchantModeToggle from "@/components/MerchantModeToggle";
import SupportWidget from "@/components/SupportWidget";
import Logo from "@/components/Logo";

export const dynamic = 'force-dynamic';

export default async function MerchantDashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuth, userId } = await getAuthSession();
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;

    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) {
        redirect('/login?role=merchant&next=/merchant/dashboard');
    }

    let restaurant: any = null;
    if (isPreview) {
        restaurant = { name: "Emerald Kitchen (Preview)" };
    } else {
        const supabase = await createClient();
        const { data } = await supabase
            .from('Restaurant')
            .select('*')
            .eq('ownerId', activeUserId)
            .maybeSingle();
        restaurant = data;
    }

    const merchantInitials = restaurant?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'M';

    return (
        <div className="min-h-screen bg-[#0a0d12] text-[#c8d8e8] font-['Nunito',sans-serif] selection:bg-[#e8a020]/30 selection:text-white">
            <div className="fixed inset-0 carbon-texture z-0 opacity-[0.02] pointer-events-none"></div>

            <header className="sticky top-0 z-[60] backdrop-blur-2xl bg-[#10151e]/80 border-b border-[#1e2c3a] shadow-2xl h-[72px]">
                <div className="max-w-[1920px] mx-auto h-full px-8 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <Logo size="sm" className="hover:scale-105 transition-transform" />
                        
                        <nav className="hidden lg:flex items-center gap-2">
                            <Link href="/merchant/dashboard" className="px-5 py-2.5 rounded-xl text-[12px] font-extrabold uppercase tracking-widest transition-all flex items-center gap-2 bg-[#e8a020]/5 text-[#e8a020] border border-[#e8a020]/20">
                                <span className="text-xl">📡</span> Live Terminal
                            </Link>
                            <Link href="/merchant/dashboard/menu" className="px-5 py-2.5 rounded-xl text-[12px] font-extrabold uppercase tracking-widest transition-all flex items-center gap-2 text-[#7a90a8] hover:text-white hover:bg-white/5">
                                <span className="text-xl">📦</span> Catalog Sync
                            </Link>
                            <Link href="/merchant/dashboard/integrations" className="px-5 py-2.5 rounded-xl text-[12px] font-extrabold uppercase tracking-widest transition-all flex items-center gap-2 text-[#7a90a8] hover:text-white hover:bg-white/5">
                                <span className="text-xl">⛓️</span> Node Sync
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Status Telemetry */}
                        <div className="hidden md:flex items-center gap-6 px-6 py-2.5 bg-[#161d2a] border border-[#1e2c3a] rounded-full shadow-inner">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                                <span className="text-[10px] font-black tracking-[0.2em] text-[#22c55e] uppercase italic">Network Uplink Active</span>
                            </div>
                            <div className="w-px h-3 bg-[#1e2c3a]"></div>
                            <div className="text-[9px] font-bold text-[#3a5060] uppercase tracking-widest italic">
                                POS-SYNC: <span className="text-white">SYNCHRONIZED (34ms)</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <MerchantModeToggle />
                            <div className="w-px h-8 bg-[#1e2c3a]"></div>
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end">
                                    <span className="text-[11px] font-black text-white uppercase tracking-widest leading-none mb-1.5">{restaurant?.name || 'Authorized Merchant'}</span>
                                    <div className="text-[10px] font-extrabold text-[#3a5060] tracking-widest uppercase italic hover:text-[#e8a020] transition-colors"><LogoutButton /></div>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e8a020] to-[#c87010] text-[#0a0d12] font-['Barlow_Condensed',sans-serif] font-black italic text-xl flex items-center justify-center shadow-lg shadow-[#e8a020]/20 hover:scale-105 transition-transform cursor-pointer">
                                    {merchantInitials}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative z-10 px-8 py-10 max-w-[1920px] mx-auto min-h-[calc(100vh-72px)]">
                {children}
            </main>

            <SupportWidget role="MERCHANT" />
        </div>
    );
}

