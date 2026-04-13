import { getAuthSession } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import MerchantModeToggle from "@/components/MerchantModeToggle";
import SupportWidget from "@/components/SupportWidget";
import Logo from "@/components/Logo";
import PortalTour from "@/components/PortalTour";
import PortalTourButton from "@/components/PortalTourButton";

export const dynamic = 'force-dynamic';

export default async function MerchantDashboardLayout({ children }: { children: React.ReactNode }) {
    const { userId } = await getAuthSession();
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;

    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) {
        redirect('/login?role=merchant&next=/merchant/dashboard');
    }

    let restaurant: any = null;
    if (isPreview) {
        restaurant = { name: "Pilot Kitchen" };
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
        <div className="food-app-shell min-h-screen">
            <header className="food-app-nav sticky top-0 z-50 border-b border-white/10">
                <div className="mx-auto flex w-[min(1240px,calc(100%-24px))] flex-wrap items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <Logo size="sm" />
                        <span className="hidden text-[10px] font-black uppercase tracking-[0.18em] text-[#68c7cc] md:inline-flex">
                            Merchant Portal
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <MerchantModeToggle />
                        <PortalTourButton
                            portal="MERCHANT"
                            className="ts-pill-btn ts-pill-btn-sm"
                        />
                        <div className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e8a230]/45 bg-[radial-gradient(circle_at_30%_30%,#f2c15f_0%,#e8a230_55%,#cb8611_100%)] text-[11px] font-black text-black shadow-[0_10px_24px_rgba(232,162,48,0.35)]">
                            {merchantInitials}
                            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-black/50 bg-[#3dd68c]" />
                        </div>
                        <LogoutButton className="ts-pill-btn ts-pill-btn-sm" />
                    </div>
                </div>
                <div className="mx-auto flex w-[min(1240px,calc(100%-24px))] gap-2 overflow-x-auto pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <Link data-tour="merchant-nav-dashboard" href="/merchant/dashboard" className="ts-pill-chip ts-pill-chip-active">Dashboard</Link>
                    <Link data-tour="merchant-nav-integrations" href="/merchant/dashboard/integrations" className="ts-pill-chip">Integrations</Link>
                    <Link data-tour="merchant-nav-compliance" href="/merchant/dashboard/compliance" className="ts-pill-chip">Compliance</Link>
                    <Link data-tour="merchant-nav-storefront" href="/merchant/dashboard/storefront" className="ts-pill-chip">Storefront</Link>
                </div>
            </header>
            <main>{children}</main>
            <SupportWidget role="MERCHANT" />
            <PortalTour portal="MERCHANT" />
        </div>
    );
}
