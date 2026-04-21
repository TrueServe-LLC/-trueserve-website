import { getAuthSession } from "@/app/auth/actions";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";
import SupportWidget from "@/components/SupportWidget";
import PortalTour from "@/components/PortalTour";
import PortalTourButton from "@/components/PortalTourButton";
import DriverPortalWrapper from "./DriverPortalWrapper";

export default async function DriverDashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuth } = await getAuthSession();
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";

    if (!isAuth && !isPreview) {
        redirect("/driver/login");
    }

    return (
        <DriverPortalWrapper pageTitle="Driver Dashboard" pageSubtitle="Route Board">
            {children}
            <SupportWidget role="DRIVER" />
            <PortalTour portal="DRIVER" />
        </DriverPortalWrapper>
    );
}
