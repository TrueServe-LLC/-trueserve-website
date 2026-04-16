import { getAuthSession } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import SupportWidget from "@/components/SupportWidget";
import Logo from "@/components/Logo";
import PortalTour from "@/components/PortalTour";
import PortalTourButton from "@/components/PortalTourButton";
import DriverNavChips from "./DriverNavChips";

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
            name: "Driver",
            balance: 0,
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
            <style>{`
              .drv-nav-chip {
                display: inline-flex; align-items: center; justify-content: center;
                min-height: 34px; padding: 7px 14px; border-radius: 8px;
                border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03);
                color: rgba(255,255,255,0.45); font-size: 10px; font-weight: 700;
                letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap;
                text-decoration: none; transition: all 150ms;
              }
              .drv-nav-chip:hover { color: #f97316; border-color: rgba(249,115,22,0.3); background: rgba(249,115,22,0.06); }
              .drv-nav-chip.drv-active {
                border-color: rgba(249,115,22,0.45); background: rgba(249,115,22,0.12);
                color: #f97316; box-shadow: 0 0 0 2px rgba(249,115,22,0.2);
              }
              .drv-avatar {
                display: inline-flex; align-items: center; justify-content: center;
                height: 36px; width: 36px; border-radius: 50%; flex-shrink: 0;
                border: 1px solid rgba(249,115,22,0.45);
                background: radial-gradient(circle at 30% 30%, #fb923c 0%, #f97316 55%, #ea6c10 100%);
                font-size: 11px; font-weight: 900; color: #000; position: relative;
                box-shadow: 0 8px 20px rgba(249,115,22,0.35);
              }
              .drv-avatar-dot {
                position: absolute; right: -2px; top: -2px; width: 10px; height: 10px;
                border-radius: 50%; border: 1.5px solid rgba(0,0,0,0.5); background: #3dd68c;
              }
            `}</style>
            <header className="food-app-nav sticky top-0 z-50 border-b border-white/10">
                <div className="mx-auto flex w-[min(1240px,calc(100%-24px))] flex-wrap items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <Logo size="sm" />
                        <span className="hidden text-[10px] font-black uppercase tracking-[0.18em] text-[#f97316] md:inline-flex">
                            Driver Portal
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <div className="ts-pill-btn ts-pill-btn-sm hidden sm:inline-flex">
                            Balance ${balance.toFixed(2)}
                        </div>
                        <PortalTourButton portal="DRIVER" className="ts-pill-btn ts-pill-btn-sm" />
                        <div className="drv-avatar">
                            {driverInitials}
                            <span className="drv-avatar-dot" />
                        </div>
                        <LogoutButton className="ts-pill-btn ts-pill-btn-sm" />
                    </div>
                </div>
                <div className="mx-auto flex w-[min(1240px,calc(100%-24px))] gap-2 overflow-x-auto pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <DriverNavChips />
                </div>
            </header>

            <main>{children}</main>
            <SupportWidget role="DRIVER" />
            <PortalTour portal="DRIVER" />
        </div>
    );
}
