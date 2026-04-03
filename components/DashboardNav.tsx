"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNav() {
    const pathname = usePathname();

    const links = [
        { href: "/driver/dashboard", label: "Home" },
        { href: "/driver/dashboard/earnings", label: "Earnings" },
        { href: "/driver/dashboard/ratings", label: "Ratings" },
        { href: "/driver/dashboard/preferences", label: "Preferences" },
        { href: "/driver/dashboard/account", label: "Account" },
    ];

    return (
        <div className="flex gap-2">
            {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`sub-link ${isActive ? 'active' : ''}`}
                    >
                        {link.label}
                    </Link>
                );
            })}
        </div>
    );
}
