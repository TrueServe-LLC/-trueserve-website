"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DriverMobileNav() {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;

    const tabs = [
        { name: "Home", href: "/driver/dashboard", icon: "🏠" },
        { name: "Earnings", href: "/driver/dashboard/earnings", icon: "💰" },
        { name: "Ratings", href: "/driver/dashboard/ratings", icon: "⭐" },
        { name: "Account", href: "/driver/dashboard/account", icon: "👤" },
        { name: "Prefs", href: "/driver/dashboard/preferences", icon: "⚙️" },
        { name: "Help", href: "/driver/dashboard/help", icon: "❓" },
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 animate-fade-in-up">
            <nav className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 flex justify-between items-center text-[10px] font-medium text-slate-400 overflow-x-auto custom-scrollbar">
                {tabs.map((tab) => (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={`flex flex-col items-center gap-1 min-w-[50px] p-2 rounded-xl transition-all ${isActive(tab.href)
                                ? 'text-black bg-primary shadow-lg scale-105'
                                : 'hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <span className="text-lg">{tab.icon}</span>
                        <span>{tab.name}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
