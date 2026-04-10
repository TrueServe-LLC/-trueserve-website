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
                <div className="portal-header-inner mx-auto w-[min(1240px,calc(100%-24px))] py-3">
                    <div className="portal-brand">
                        <Logo size="sm" />
                        <span className="hidden text-[10px] font-black uppercase tracking-[0.18em] text-[#68c7cc] md:inline-flex">
                            Driver Portal
                        </span>
                    </div>
                    <div className="portal-controls">
                        <div className="portal-btn-compact hidden sm:inline-flex">
                            Balance ${balance.toFixed(2)}
                        </div>
                        <PortalTourButton portal="DRIVER" className="portal-btn-compact" />
                        <div className="portal-avatar bg-[#e8a230] text-black">{driverInitials}</div>
                        <LogoutButton className="portal-btn-compact" />
                    </div>
                </div>
                <div className="portal-nav-row mx-auto w-[min(1240px,calc(100%-24px))]">
                    <Link data-tour="driver-nav-dashboard" href="/driver/dashboard" className="portal-pill portal-pill-active">Dashboard</Link>
                    <Link data-tour="driver-nav-earnings" href="/driver/dashboard/earnings" className="portal-pill">Settlements</Link>
                    <Link data-tour="driver-nav-ratings" href="/driver/dashboard/ratings" className="portal-pill">Reputation</Link>
                    <Link data-tour="driver-nav-account" href="/driver/dashboard/account" className="portal-pill">Profile</Link>
                </div>
            </header>

            <main>{children}</main>
            <SupportWidget role="DRIVER" />
            <PortalTour portal="DRIVER" />
        </div>
    );
}
