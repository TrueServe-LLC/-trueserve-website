import { getAuthSession } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import SupportWidget from "@/components/SupportWidget";
import Logo from "@/components/Logo";
import PortalTour from "@/components/PortalTour";
import PortalTourButton from "@/components/PortalTourButton";

export default async function DriverDashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuth, name, userId } = await getAuthSession();

    if (!isAuth) {
        redirect("/driver/login");
    }

    const supabase = await createClient();
    const { data: driverData } = await supabase
        .from('Driver')
        .select('*')
        .eq('userId', userId)
        .maybeSingle();

    const balance = driverData?.balance || 0;
    const driverInitials = (name || driverData?.name || "Driver").split(" ").map((n: string) => n[0]).join("").toUpperCase();

    return (
        <div className="food-app-shell min-h-screen text-white">
            <header className="food-app-nav sticky top-0 z-50 border-b border-white/10">
                <div className="mx-auto flex w-[min(1240px,calc(100%-24px))] items-center justify-between gap-4 py-3">
                    <div className="flex items-center gap-3">
                        <Logo size="sm" />
                        <span className="hidden text-[10px] font-black uppercase tracking-[0.18em] text-[#68c7cc] md:inline-flex">
                            Driver Portal
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden rounded-full border border-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-white/70 sm:inline-flex">
                            Balance ${balance.toFixed(2)}
                        </div>
                        <PortalTourButton portal="DRIVER" />
                        <div className="rounded-full bg-[#e8a230] px-3 py-1 text-xs font-black text-black">{driverInitials}</div>
                        <div className="text-xs uppercase tracking-[0.14em] text-white/70">
                            <LogoutButton />
                        </div>
                    </div>
                </div>
                <div className="mx-auto flex w-[min(1240px,calc(100%-24px))] gap-2 overflow-x-auto pb-3">
                    <Link data-tour="driver-nav-dashboard" href="/driver/dashboard" className="rounded-full border border-[#e8a230]/35 bg-[#e8a230]/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#e8a230]">Dashboard</Link>
                    <Link data-tour="driver-nav-earnings" href="/driver/dashboard/earnings" className="rounded-full border border-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70 hover:text-white">Settlements</Link>
                    <Link data-tour="driver-nav-ratings" href="/driver/dashboard/ratings" className="rounded-full border border-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70 hover:text-white">Reputation</Link>
                    <Link data-tour="driver-nav-account" href="/driver/dashboard/account" className="rounded-full border border-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70 hover:text-white">Profile</Link>
                </div>
            </header>

            <main>{children}</main>
            <SupportWidget role="DRIVER" />
            <PortalTour portal="DRIVER" />
        </div>
    );
}
