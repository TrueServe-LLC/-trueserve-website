import { getAuthSession } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import ModeToggle from "@/components/ModeToggle";

export const dynamic = 'force-dynamic';

export default async function MerchantDashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuth, userId, role } = await getAuthSession();
    const cookieStore = await cookies();
    const cookieUserId = cookieStore.get("userId")?.value;
    
    const activeUserId = userId || cookieUserId;

    if (!activeUserId) {
        redirect('/login?role=merchant&next=/merchant/dashboard');
    }

    const supabase = await createClient();
    const { data: restaurant } = await supabase
        .from('Restaurant')
        .select('*')
        .eq('ownerId', activeUserId)
        .maybeSingle();

    const merchantInitials = restaurant?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'M';

    return (
        <div className="min-h-screen bg-black text-slate-200">
            {/* Standardized Top-Nav */}
            <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-black/60 border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-8 h-8 rounded-full border border-white/10 shadow-lg" />
                        <span className="text-xl font-black tracking-tighter text-white">True<span className="text-primary">Serve</span></span>
                    </Link>
                    <div className="h-6 w-px bg-white/10 mx-2"></div>
                    <nav className="flex items-center gap-1">
                        <Link href="/restaurants" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 transition-colors">🍴 Order Food</Link>
                        <Link href="/merchant/dashboard" className="badge-subtle-primary text-[10px] py-1.5 border-none">📊 Merchant Hub</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-4 mr-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                        <div className="flex flex-col items-end">
                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Store Status</p>
                            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                Live Terminal
                            </p>
                        </div>
                    </div>
                    <ModeToggle />
                    <Link href="/merchant/dashboard/settings" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/10 hover:bg-white/10 transition-all font-black text-xs">
                        {merchantInitials}
                    </Link>
                </div>
            </nav>

            {/* Secondary Sub-Nav */}
            <div className="bg-white/[0.02] border-b border-white/5 px-6 overflow-x-auto no-scrollbar scroll-smooth sticky top-[73px] z-40 backdrop-blur-md">
                <div className="container px-4">
                    <div className="flex items-center gap-8 h-12 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                        <Link href="/merchant/dashboard" className="text-primary border-b border-primary h-full flex items-center">Command Center</Link>
                        <Link href="/merchant/dashboard/orders" className="text-slate-500 hover:text-white h-full flex items-center transition-colors">Order Logs</Link>
                        <Link href="/merchant/dashboard/menu" className="text-slate-500 hover:text-white h-full flex items-center transition-colors">Menu Architect</Link>
                        <Link href="/merchant/dashboard/analytics" className="text-slate-500 hover:text-white h-full flex items-center transition-colors">Analytics</Link>
                        <Link href="/merchant/dashboard/settings" className="text-slate-500 hover:text-white h-full flex items-center transition-colors">Operations</Link>
                        <a href="https://lcking992-1774309654202.atlassian.net/servicedesk/customer/portal/1" target="_blank" className="text-slate-600 hover:text-emerald-400 h-full flex items-center transition-colors ml-auto">Support Desk</a>
                    </div>
                </div>
            </div>

            <main className="">
                {children}
            </main>
        </div>
    );
}
