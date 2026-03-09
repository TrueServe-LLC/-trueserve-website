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
    if (pathname.startsWith('/driver/dashboard')) {
        return (
            <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100]">
                <nav className="w-full bg-slate-900 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 px-6 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
                    <Link href="/driver/dashboard/account" className={`flex flex-col items-center gap-1 flex-1 transition-all ${isActive('/driver/dashboard/account') ? 'text-emerald-400 scale-110' : 'active:scale-95'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        <span>Account</span>
                    </Link>
                </nav>
            </div>
        );
    }

    // 2. Merchant Navigation Mode
    if (pathname.startsWith('/merchant/dashboard')) {
        return (
            <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100]">
                <nav className="w-full bg-slate-900 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 px-8 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <Link href="/merchant/dashboard" className={`flex flex-col items-center gap-1 flex-1 transition-all ${isActive('/merchant/dashboard') && !isActive('/merchant/menu') ? 'text-primary' : 'active:scale-95'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        <span>Orders</span>
                    </Link>
                    <Link href="/merchant/menu" className={`flex flex-col items-center gap-1 flex-1 transition-all ${isActive('/merchant/menu') ? 'text-primary' : 'active:scale-95'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        <span>Menu</span>
                    </Link>
                    <Link href="/merchant/dashboard" className={`flex flex-col items-center gap-1 flex-1 transition-all ${isActive('/merchant/dashboard') ? 'text-primary' : 'active:scale-95'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        <span>Profile</span>
                    </Link>
                </nav>
            </div>
        );
    }

    // 3. Default Customer Navigation
    if (role === 'ADMIN' || role === 'CUSTOMER' || !role) {
        return (
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] pb-safe">
                <nav className="w-full bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 pt-3 pb-6 px-6 flex justify-between items-center text-slate-500 relative">
                    {/* Optional: subtle top glow effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                    <Link
                        href="/restaurants"
                        className={`flex flex-col items-center gap-1.5 transition-all w-16 ${isActive('/restaurants') && !pathname.includes('#search') && !isActive('/orders') ? 'text-white scale-105' : 'hover:text-slate-300 active:scale-95'}`}
                    >
                        <svg className="w-6 h-6" fill={isActive('/restaurants') && !pathname.includes('#search') && !isActive('/orders') ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/restaurants') && !pathname.includes('#search') && !isActive('/orders') ? "1.5" : "2"} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-[10px] font-semibold tracking-wide">Home</span>
                    </Link>

                    <Link
                        href="/restaurants#search"
                        className={`flex flex-col items-center gap-1.5 transition-all w-16 ${pathname.includes('#search') ? 'text-white scale-105' : 'hover:text-slate-300 active:scale-95'}`}
                    >
                        <svg className="w-6 h-6" fill={pathname.includes('#search') ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname.includes('#search') ? "1.5" : "2"} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-[10px] font-semibold tracking-wide">Search</span>
                    </Link>

                    <Link
                        href="/orders"
                        className={`flex flex-col items-center gap-1.5 transition-all w-16 ${(isActive('/orders') || isActive('/orders/[id]')) ? 'text-white scale-105' : 'hover:text-slate-300 active:scale-95'}`}
                    >
                        <svg className="w-6 h-6" fill={(isActive('/orders') || isActive('/orders/[id]')) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={(isActive('/orders') || isActive('/orders/[id]')) ? "1.5" : "2"} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <span className="text-[10px] font-semibold tracking-wide">Orders</span>
                    </Link>

                    <Link
                        href="/user/settings"
                        className={`flex flex-col items-center gap-1.5 transition-all w-16 ${isActive('/user/settings') ? 'text-white scale-105' : 'hover:text-slate-300 active:scale-95'}`}
                    >
                        <svg className="w-6 h-6" fill={isActive('/user/settings') ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/user/settings') ? "1.5" : "2"} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-[10px] font-semibold tracking-wide">Profile</span>
                    </Link>
                </nav>
            </div>
        );
    }

    return null;
}
