"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Stylized SVGs for the "Empire" Look - Focused on High-Fidelity App Aesthetics
const Icons = {
    Home: ({ active }: { active: boolean }) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#E8A020" : "none"} stroke="currentColor" strokeWidth={active ? "2.5" : "2"}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3.5m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3.5m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    Explore: ({ active }: { active: boolean }) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.8" : "2.2"}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
    Orders: ({ active }: { active: boolean }) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#E8A020" : "none"} stroke="currentColor" strokeWidth={active ? "2.5" : "2.2"}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
    ),
    Hub: ({ active }: { active: boolean }) => (
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${active ? 'bg-[#E8A020] shadow-[0_10px_35px_rgba(232,160,32,0.4)] rotate-45' : 'bg-[#141417] border border-white/5'}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "black" : "#E8A020"} strokeWidth="3" className={active ? "-rotate-45" : ""}>
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
        </div>
    ),
    Profile: ({ active }: { active: boolean }) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#E8A020" : "none"} stroke="currentColor" strokeWidth={active ? "2.5" : "2.2"}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    )
};

export default function MobileNav({ role }: { role?: string | null }) {
    const pathname = usePathname();

    const hideOnRoutes = ['/login', '/signup', '/onboarding', '/merchant/login', '/driver/login', '/merchant/dashboard', '/driver/dashboard'];
    if (hideOnRoutes.includes(pathname)) return null;

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    };

    const NavItem = ({ href, label, icon: Icon, active, special = false }: { href: string, label: string, icon: any, active: boolean, special?: boolean }) => (
        <Link href={href} className={`flex flex-col items-center flex-1 transition-all duration-500 relative ${active ? 'scale-110' : 'active:scale-95'}`}>
            <div className={`p-2 transition-all duration-500 ${active && !special ? 'text-[#E8A020] drop-shadow-[0_0_12px_rgba(232,160,32,0.4)]' : 'text-[#444]'}`}>
                <Icon active={active} />
            </div>
            
            {!special && (
                <span className={`font-barlow-cond text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 mt-0.5 ${active ? 'text-white' : 'text-[#333]'}`}>
                    {label}
                </span>
            )}
            
            {active && !special && (
                <div className="absolute -bottom-2 w-[4px] h-[4px] bg-[#E8A020] rounded-full shadow-[0_0_10px_#E8A020] animate-pulse" />
            )}
        </Link>
    );

    return (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-[100] pointer-events-none">
            <div className="
                w-full bg-[#0A0A0A]/85 backdrop-blur-3xl border border-white/5 
                rounded-[2.8rem] shadow-[0_30px_60px_rgba(0,0,0,0.85)] 
                p-2 px-1 flex justify-between items-center relative pointer-events-auto
            ">
                <NavItem href="/" label="Home" icon={Icons.Home} active={isActive('/')} />
                <NavItem href="/restaurants" label="Explore" icon={Icons.Explore} active={isActive('/restaurants')} />
                <NavItem href="/hub" label="Hubs" icon={Icons.Hub} active={isActive('/hub')} special />
                <NavItem href="/orders" label="Orders" icon={Icons.Orders} active={isActive('/orders')} />
                <NavItem href="/user/settings" label="Profile" icon={Icons.Profile} active={isActive('/user')} />
            </div>
        </div>
    );
}
