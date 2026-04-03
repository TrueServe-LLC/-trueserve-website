"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Stylized SVGs for the "Empire" Look
const Icons = {
    Home: ({ active }: { active: boolean }) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3.5m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3.5m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    Explore: ({ active }: { active: boolean }) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
    Orders: ({ active }: { active: boolean }) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
    ),
    Hub: ({ active }: { active: boolean }) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"}>
            <rect x="3" y="3" width="7" height="7" rx="1" strokeLinecap="round" />
            <rect x="14" y="3" width="7" height="7" rx="1" strokeLinecap="round" strokeOpacity={active ? 1 : 0.4} />
            <rect x="3" y="14" width="7" height="7" rx="1" strokeLinecap="round" strokeOpacity={active ? 1 : 0.4} />
            <rect x="14" y="14" width="7" height="7" rx="1" strokeLinecap="round" fill={active ? "#e8a230" : "none"} stroke="#e8a230" />
        </svg>
    ),
    Profile: ({ active }: { active: boolean }) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    )
};

export default function MobileNav({ role }: { role?: string | null }) {
    const pathname = usePathname();

    const hideOnRoutes = ['/login', '/signup', '/onboarding', '/merchant/login', '/driver/login'];
    if (hideOnRoutes.includes(pathname)) return null;

    const isActive = (path: string) => pathname === path || (pathname.startsWith(path) && path !== '/');

    const NavItem = ({ href, label, icon: Icon, active }: { href: string, label: string, icon: any, active: boolean }) => (
        <Link href={href} className={`flex flex-col items-center gap-[6px] flex-1 group transition-all duration-300 ${active ? 'scale-105' : 'hover:scale-105'}`}>
            <div className={`
                flex items-center justify-center p-2 rounded-xl transition-all duration-300
                ${active ? 'text-[#e8a230] shadow-[0_0_20px_rgba(232,162,48,0.15)] bg-[#e8a230]/5' : 'text-[#444] group-hover:text-white/60'}
            `}>
                <Icon active={active} />
            </div>
            <span className={`
                font-barlow-cond font-black text-[9.5px] uppercase tracking-[0.18em] transition-all duration-300
                ${active ? 'text-white' : 'text-[#333] group-hover:text-[#555]'}
            `}>
                {label}
            </span>
            {active && (
                <div className="absolute -bottom-1.5 w-1 h-1 bg-[#e8a230] rounded-full shadow-[0_0_8px_rgba(232,162,48,0.8)]" />
            )}
        </Link>
    );

    // DETERMINING NAVIGATION CONTEXT
    const isProfessional = pathname.startsWith('/driver') || pathname.startsWith('/merchant') || role === 'DRIVER' || role === 'MERCHANT';
    
    // CUSTOMER NAV DEFAULT
    return (
        <div className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-[100] pb-8 px-6 bg-gradient-to-t from-[#000] via-[#000]/60 to-transparent pointer-events-none">
            <nav className="
                w-full bg-[#0d0d0d]/90 backdrop-blur-3xl border border-white/5 
                rounded-[2.4rem] shadow-[0_25px_60px_rgba(0,0,0,0.95)] 
                p-4 px-3 flex justify-between items-center relative pointer-events-auto
            ">
                <NavItem href="/" label="Home" icon={Icons.Home} active={pathname === '/'} />
                <NavItem href="/restaurants" label="Explore" icon={Icons.Explore} active={pathname === '/restaurants'} />
                <NavItem href="/hub" label="Hubs" icon={Icons.Hub} active={pathname === '/hub'} />
                <NavItem href="/orders" label="Orders" icon={Icons.Orders} active={pathname === '/orders'} />
                <NavItem href="/user/settings" label="Profile" icon={Icons.Profile} active={pathname.startsWith('/user')} />
            </nav>
        </div>
    );
}
