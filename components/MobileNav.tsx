"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth/actions";

export default function MobileNav({ role }: { role?: string | null }) {
    const pathname = usePathname();

    // Hide on specific pages where nav isn't appropriate
    const hideOnRoutes = ['/login', '/signup', '/onboarding'];
    if (hideOnRoutes.includes(pathname)) return null;

    const isActive = (path: string) => pathname === path || (pathname.startsWith(path) && path !== '/');

    // 1. Driver Navigation Mode
    if (pathname.startsWith('/driver')) {
        return (
            <div className="md:hidden fixed bottom-4 left-4 right-4 z-[100]">
                <nav className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-3 flex justify-around items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <Link href="/driver/dashboard" className={`flex flex-col items-center gap-1 flex-1 transition-all ${isActive('/driver/dashboard') ? 'text-emerald-400 scale-110' : 'active:scale-95'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        <span>Board</span>
                    </Link>
                    <Link href="/driver/dashboard" className={`flex flex-col items-center gap-1 flex-1 transition-all ${isActive('/driver/trips') ? 'text-emerald-400 scale-110' : 'active:scale-95'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        <span>Trips</span>
                    </Link>
                    <Link href="/driver/dashboard/earnings" className={`flex flex-col items-center gap-1 flex-1 transition-all ${isActive('/driver/dashboard/earnings') ? 'text-emerald-400 scale-110' : 'active:scale-95'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Pay</span>
                    </Link>
                    <button onClick={() => logout()} className="flex flex-col items-center gap-1 flex-1 active:scale-95 transition-all text-red-400/70">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        <span>Exit</span>
                    </button>
                </nav>
            </div>
        );
    }

    // 2. Merchant Navigation Mode
    if (pathname.startsWith('/merchant')) {
        return (
            <div className="md:hidden fixed bottom-4 left-4 right-4 z-[100]">
                <nav className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-3 flex justify-around items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <Link href="/merchant/dashboard" className={`flex flex-col items-center gap-1 flex-1 transition-all ${isActive('/merchant/dashboard') ? 'text-primary' : 'active:scale-95'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        <span>Orders</span>
                    </Link>
                    <Link href="/merchant/dashboard" className={`flex flex-col items-center gap-1 flex-1 transition-all ${isActive('/merchant/menu') ? 'text-primary' : 'active:scale-95'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        <span>Menu</span>
                    </Link>
                    <button onClick={() => logout()} className="flex flex-col items-center gap-1 flex-1 active:scale-95 transition-all text-red-500/50">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        <span>Log out</span>
                    </button>
                </nav>
            </div>
        );
    }

    // 3. Default Customer Navigation
    if (role === 'ADMIN' || role === 'CUSTOMER' || !role) {
        return (
            <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100]">
                <nav className="bg-slate-900 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 flex justify-between items-center px-6 text-slate-500">
                    <Link
                        href="/restaurants"
                        className={`flex flex-col items-center gap-1.5 transition-all ${isActive('/restaurants') && !isActive('/orders') ? 'text-secondary scale-110' : 'hover:text-slate-300 active:scale-95'}`}
                    >
                        <svg className="w-6 h-6" fill={isActive('/restaurants') && !isActive('/orders') ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/restaurants') && !isActive('/orders') ? "1" : "2"} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                        <span className="text-[10px] font-bold tracking-wide">Home</span>
                    </Link>

                    <Link
                        href="/restaurants"
                        className={`flex flex-col items-center gap-1.5 transition-all hover:text-slate-300 active:scale-95`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span className="text-[10px] font-bold tracking-wide">Nearby</span>
                    </Link>

                    <Link
                        href="/orders"
                        className={`flex flex-col items-center gap-1.5 transition-all ${isActive('/orders') ? 'text-secondary scale-110' : 'hover:text-slate-300 active:scale-95'}`}
                    >
                        <svg className="w-6 h-6" fill={isActive('/orders') ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/orders') ? "1" : "2"} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.35 2.7A1 1 0 006 17h12m-9 3A2 2 0 109 23a2 2 0 00-2-2zm7 0a2 2 0 109 23a2 2 0 00-2-2z"></path></svg>
                        <span className="text-[10px] font-bold tracking-wide">Cart</span>
                    </Link>

                    <Link
                        href="/user/settings"
                        className={`flex flex-col items-center gap-1.5 transition-all ${isActive('/user/settings') ? 'text-secondary scale-110' : 'hover:text-slate-300 active:scale-95'}`}
                    >
                        <svg className="w-6 h-6" fill={isActive('/user/settings') ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/user/settings') ? "1" : "2"} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        <span className="text-[10px] font-bold tracking-wide">Profile</span>
                    </Link>
                </nav>
            </div>
        );
    }

    return null;
}
