import Link from "next/link";
import DriverMobileNav from "@/components/DriverMobileNav";

export default function DriverDashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-black text-slate-200 pb-24 md:pb-0">
            <nav className="hidden md:block sticky top-0 z-50 bg-slate-900/50 backdrop-blur-md border-b border-white/10">
                <div className="container px-4 overflow-x-auto custom-scrollbar">
                    <div className="flex items-center gap-6 h-16 text-sm font-medium whitespace-nowrap">
                        <Link href="/driver/dashboard" className="text-white hover:text-primary transition-colors">Home</Link>
                        <Link href="/driver/dashboard/account" className="text-slate-400 hover:text-white transition-colors">Account</Link>
                        <Link href="/driver/dashboard/ratings" className="text-slate-400 hover:text-white transition-colors">Ratings</Link>
                        <Link href="/driver/dashboard/earnings" className="text-slate-400 hover:text-white transition-colors">Earnings</Link>
                        <Link href="/driver/dashboard/preferences" className="text-slate-400 hover:text-white transition-colors">Preferences</Link>
                        <Link href="/driver/dashboard/help" className="text-slate-400 hover:text-white transition-colors">Help</Link>
                    </div>
                </div>
            </nav>
            <main className="container py-8">{children}</main>
            <DriverMobileNav />
        </div>
    );
}
