"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth/actions";

export default function MobileNav() {
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
    return (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-[100]">
            <nav className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-3 flex justify-around items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <Link
                    href="/restaurants"
                    className={`flex flex-col items-center gap-1 flex-1 transition-all ${isActive('/restaurants') && !isActive('/orders') ? 'text-primary scale-110' : 'active:scale-95'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    <span>Browse</span>
                </Link>

                <Link
                    href="/restaurants"
                    className="flex flex-col items-center gap-1 flex-1 active:scale-95 transition-all"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <span>Search</span>
                </Link>

                <Link
                    href="/driver"
                    className={`flex flex-col items-center gap-1 flex-1 transition-all ${isActive('/driver') ? 'text-emerald-400' : 'active:scale-95'}`}
                >
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center -mt-8 border border-white/10 shadow-xl backdrop-blur-md">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </div>
                    <span className="mt-1">Drive</span>
                </Link>

                <Link
                    href="/orders"
                    className={`flex flex-col items-center gap-1 flex-1 transition-all ${isActive('/orders') ? 'text-primary scale-110' : 'active:scale-95'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                    <span>Orders</span>
                </Link>

                <button
                    onClick={() => logout()}
                    className="flex flex-col items-center gap-1 flex-1 active:scale-95 transition-all text-slate-600 hover:text-red-400"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    <span>Logout</span>
                </button>
            </nav>
        </div>
    );
}
