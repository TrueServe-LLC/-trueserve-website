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
        <div className="min-h-screen bg-[#0c0e13] text-[#F0EDE8] font-barlow-cond selection:bg-[#e8a230]/30 selection:text-white">
            <style jsx global>{`
                :root {
                    --font-bebas: 'Bebas Neue', sans-serif;
                    --font-barlow-cond: 'Barlow Condensed', sans-serif;
                }
                
                .elite-link {
                    font-size: 10px; font-weight: 800; letter-spacing: 0.15em;
                    text-transform: uppercase; color: #5A5550; padding: 12px 16px;
                    display: flex; align-items: center; gap: 8px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative; overflow: hidden; border-radius: 0.75rem;
                }
                .elite-link:hover { color: #fff; background: rgba(255,255,255,0.03); }
                .elite-link.active { color: #e8a230; background: rgba(232, 162, 48, 0.05); }
                .elite-link.active::after {
                    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 2px;
                    background: #e8a230; box-shadow: 0 0 10px #e8a230;
                }
                
                .carbon-texture {
                    background-image: url('https://www.transparenttextures.com/patterns/carbon-fibre.png');
                    background-repeat: repeat; opacity: 0.03; pointer-events: none;
                }
            `}</style>

            <div className="fixed inset-0 carbon-texture z-0 pointer-events-none"></div>

            {/* HIGH-FIDELITY TOP HUD */}
            <header className="sticky top-0 z-[60] backdrop-blur-2xl bg-black/60 border-b border-white/5 shadow-2xl h-[72px]">
                <div className="max-w-[1920px] mx-auto h-full px-8 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <Logo size="sm" className="hover:scale-105 transition-transform" />
                        
                        <nav className="hidden lg:flex items-center gap-2">
                            <Link href="/merchant/dashboard" className="elite-link active">
                                <span className="text-xl">📡</span> Live Terminal
                            </Link>
                            <Link href="/merchant/dashboard/menu" className="elite-link">
                                <span className="text-xl">📦</span> Catalog Sync
                            </Link>
                            <Link href="/merchant/dashboard/integrations" className="elite-link">
                                <span className="text-xl">⛓️</span> Node Sync
                            </Link>
                            <Link href="/restaurants" target="_blank" className="elite-link opacity-40 hover:opacity-100">
                                <span className="text-xl">🛰️</span> Perimeter Sim
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Status Telemetry */}
                        <div className="hidden md:flex items-center gap-6 px-6 py-2 bg-white/[0.02] border border-white/10 rounded-full">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#3dd68c] animate-pulse shadow-[0_0_10px_#3dd68c]"></div>
                                <span className="text-[10px] font-black tracking-[0.2em] text-[#3dd68c] uppercase italic">Network Uplink Active</span>
                            </div>
                            <div className="w-px h-3 bg-white/10"></div>
                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">
                                POS-SYNC: <span className="text-white">SYNCHRONIZED (34ms)</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <MerchantModeToggle />
                            <div className="w-px h-8 bg-white/5"></div>
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">{restaurant?.name || 'Authorized Merchant'}</span>
                                    <div className="text-[9px] font-bold text-slate-600 tracking-widest uppercase italic"><LogoutButton /></div>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e8a230] to-[#f5b342] text-black font-bebas italic text-xl flex items-center justify-center shadow-lg shadow-[#e8a230]/20 hover:scale-110 transition-transform cursor-pointer">
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

