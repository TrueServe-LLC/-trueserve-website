import { getAuthSession } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import SupportWidget from "@/components/SupportWidget";
import { cookies } from "next/headers";
import DashboardNav from "@/components/DashboardNav";
import Logo from "@/components/Logo";

export default async function DriverDashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuth, name, userId } = await getAuthSession();
    
    // Auth Guard - Prioritize Preview Mode to end the loop
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    
    if (!isAuth && !isPreview) {
        redirect("/login");
    }

    // Fetch driver data for the balance/initials
    const supabase = await createClient();
    const { data: driverData } = isPreview ? { data: null } : await supabase
        .from('Driver')
        .select('*')
        .eq('userId', userId)
        .maybeSingle();

    const balance = isPreview ? 62.00 : (driverData?.balance || 0);
    const driverInitials = (name || driverData?.name || "Driver").split(" ").map((n: string) => n[0]).join("").toUpperCase();

    return (
        <div className="min-h-screen bg-[#080a0f] text-white selection:bg-[#e8a230]/30 selection:text-white">
            {/* ── ELITE FLEET HEADER ── */}
            <header className="sticky top-0 z-[100] bg-[#0c0e13]/80 backdrop-blur-3xl border-b border-white/5">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 sm:gap-10">
                        <Logo size="sm" />
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#3dd68c]/5 border border-[#3dd68c]/10 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3dd68c] animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#3dd68c] italic">Connection Stable</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-8">
                        <div className="text-right">
                            <p className="font-barlow-cond text-[9px] font-black uppercase tracking-widest text-[#444] mb-0.5 italic">Fleet Balance</p>
                            <p className="bebas text-2xl sm:text-3xl italic text-[#e8a230] leading-none">${balance.toFixed(2)}</p>
                        </div>
                        <div className="h-8 w-px bg-white/5 hidden sm:block"></div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-[#e8a230] border border-[#e8a230]/20 flex items-center justify-center text-[#080a0f] font-black italic text-sm shadow-[0_0_15px_rgba(232,162,48,0.2)]">
                                {driverInitials}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECONDARY ELITE NAV */}
                <div className="border-t border-white/5 bg-black/40 overflow-x-auto no-scrollbar">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-2 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto no-scrollbar">
                            <Link href="/driver/dashboard" className="barlow-cond text-[10px] font-black uppercase tracking-widest text-[#e8a230] bg-[#e8a230]/5 px-4 py-1.5 rounded-lg border border-[#e8a230]/20 italic">Dashboard</Link>
                            <Link href="/driver/dashboard/earnings" className="barlow-cond text-[10px] font-black uppercase tracking-widest text-[#555] hover:text-white px-4 py-1.5 rounded-lg italic">Settlements</Link>
                            <Link href="/driver/dashboard/ratings" className="barlow-cond text-[10px] font-black uppercase tracking-widest text-[#555] hover:text-white px-4 py-1.5 rounded-lg italic">Reputation</Link>
                            <Link href="/driver/dashboard/account" className="barlow-cond text-[10px] font-black uppercase tracking-widest text-[#555] hover:text-white px-4 py-1.5 rounded-lg italic">Profile</Link>
                        </div>
                        <div className="flex-shrink-0 barlow-cond text-[9px] font-black uppercase tracking-[0.2em] text-[#2a2f3a] hover:text-red-500/50 transition-colors">
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </header>

            <main className="main-content relative z-10">
                <style dangerouslySetInnerHTML={{ __html: `
                    .main-content::before {
                        content: ""; position: fixed; inset: 0; 
                        background-image: linear-gradient(rgba(16, 22, 34, .3) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 22, 34, .3) 1px, transparent 1px);
                        background-size: 40px 40px; pointer-events: none; opacity: 0.5; z-index: -1;
                    }
                ` }} />
                {children}
            </main>

            <SupportWidget role="DRIVER" />
        </div>
    );
}
