import { getAuthSession } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

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
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";

    if (!isAuth && !isPreview) {
        redirect("/driver/login");
    }

    const supabase = await createClient();
    const { data: driverData } = isPreview
        ? { data: {
            name: "Pilot Driver",
            balance: 126.4,
            userId: "preview",
        } }
        : await supabase
            .from('Driver')
            .select('*')
            .eq('userId', userId)
            .maybeSingle();

    const balance = driverData?.balance || 0;
    const driverInitials = (name || driverData?.name || "Driver").split(" ").map((n: string) => n[0]).join("").toUpperCase();

    return (
        <div className="food-app-shell min-h-screen text-white">
            <header className="food-app-nav sticky top-0 z-50 border-b border-white/10">
                <div className="mx-auto flex w-[min(1240px,calc(100%-24px))] flex-wrap items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <Logo size="sm" />
                        <span className="hidden text-[10px] font-black uppercase tracking-[0.18em] text-[#68c7cc] md:inline-flex">
                            Driver Portal
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <div className="ts-pill-btn ts-pill-btn-sm hidden sm:inline-flex">
                            Balance ${balance.toFixed(2)}
                        </div>
                        <PortalTourButton portal="DRIVER" className="ts-pill-btn ts-pill-btn-sm" />
                        <div className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e8a230]/45 bg-[radial-gradient(circle_at_30%_30%,#f2c15f_0%,#e8a230_55%,#cb8611_100%)] text-[11px] font-black text-black shadow-[0_10px_24px_rgba(232,162,48,0.35)]">
                            {driverInitials}
                            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-black/50 bg-[#3dd68c]" />
                        </div>
                        <LogoutButton className="ts-pill-btn ts-pill-btn-sm" />
                    </div>
                </div>
                <div className="mx-auto flex w-[min(1240px,calc(100%-24px))] gap-2 overflow-x-auto pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <Link data-tour="driver-nav-dashboard" href="/driver/dashboard" className="ts-pill-chip ts-pill-chip-active">Dashboard</Link>
                    <Link data-tour="driver-nav-earnings" href="/driver/dashboard/earnings" className="ts-pill-chip">Settlements</Link>
                    <Link data-tour="driver-nav-ratings" href="/driver/dashboard/ratings" className="ts-pill-chip">Reputation</Link>
                    <Link data-tour="driver-nav-compliance" href="/driver/dashboard/compliance" className="ts-pill-chip">Compliance</Link>
                    <Link data-tour="driver-nav-account" href="/driver/dashboard/account" className="ts-pill-chip">Profile</Link>
                </div>
            </header>

            <main>{children}</main>
            <SupportWidget role="DRIVER" />
            <PortalTour portal="DRIVER" />
        </div>
    );
}
