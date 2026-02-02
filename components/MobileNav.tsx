"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
    const pathname = usePathname();

    // Hide on login code, or if we are in 'Work Mode' (Driver/Merchant/Admin)
    if (pathname === '/login' || pathname.startsWith('/driver') || pathname.startsWith('/merchant') || pathname.startsWith('/admin')) return null;

    const isActive = (path: string) => pathname === path || (pathname.startsWith(path) && path !== '/');

    return (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
            <nav className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 flex justify-between items-center text-xs font-medium text-slate-400">
                <Link
                    href="/restaurants"
                    className={`flex flex-col items-center gap-1 transition-colors ${isActive('/restaurants') ? 'text-primary' : 'hover:text-white'}`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    Home
                </Link>

                <Link
                    href="/restaurants"
                    className={`flex flex-col items-center gap-1 transition-colors ${isActive('/search') ? 'text-primary' : 'hover:text-white'}`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    Search
                </Link>

                <Link
                    href="/orders"
                    className={`flex flex-col items-center gap-1 transition-colors ${isActive('/orders') ? 'text-primary' : 'hover:text-white'}`}
                >
                    <div className="relative">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                        {/* <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-slate-900"></span> */}
                    </div>
                    Orders
                </Link>

                <Link
                    href="/user/settings"
                    className={`flex flex-col items-center gap-1 transition-colors ${isActive('/user') ? 'text-primary' : 'hover:text-white'}`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    Profile
                </Link>
            </nav>
        </div>
    );
}
