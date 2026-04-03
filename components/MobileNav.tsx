"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav({ role }: { role?: string | null }) {
    const pathname = usePathname();

    // Hide on specific pages where nav isn't appropriate
    const hideOnRoutes = ['/login', '/signup', '/onboarding'];
    if (hideOnRoutes.includes(pathname)) return null;

    const isActive = (path: string) => pathname === path || (pathname.startsWith(path) && path !== '/');

    const NavContainer = ({ children }: { children: React.ReactNode }) => (
        <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100]">
            <nav className="w-full bg-[#131313]/90 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-4 px-6 flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.15em] text-[#5A5550] font-barlow-cond">
                {children}
            </nav>
        </div>
    );

    const NavItem = ({ href, label, icon, active, activeColor = "#e8a230" }: { href: string, label: string, icon: React.ReactNode, active: boolean, activeColor?: string }) => (
        <Link href={href} className={`flex flex-col items-center gap-1.5 flex-1 transition-all ${active ? 'scale-105' : 'active:scale-95'}`} style={{ color: active ? activeColor : undefined }}>
            <div className="w-6 h-6 flex items-center justify-center">
                {icon}
            </div>
            <span className={active ? 'text-white' : ''}>{label}</span>
        </Link>
    );

    // 1. Driver Navigation Mode
    if (pathname.startsWith('/driver/dashboard') || role === 'DRIVER') {
        const dPath = '/driver/dashboard';
        return (
            <NavContainer>
                <NavItem href={dPath} label="Board" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>} active={pathname === dPath} />
                <NavItem href={`${dPath}/earnings`} label="Pay" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>} active={pathname.includes('/earnings')} />
                <NavItem href={`${dPath}/account`} label="Account" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>} active={pathname.includes('/account')} />
            </NavContainer>
        );
    }

    // 2. Merchant Navigation Mode
    if (pathname.startsWith('/merchant/dashboard') || role === 'MERCHANT') {
        const mPath = '/merchant/dashboard';
        return (
            <NavContainer>
                <NavItem href={mPath} label="Orders" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>} active={pathname === mPath} />
                <NavItem href="/merchant/menu" label="Menu" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>} active={pathname.includes('/menu')} />
                <NavItem href={mPath} label="Profile" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>} active={false} />
            </NavContainer>
        );
    }

    // 3. Default Customer Navigation
    const isHome = pathname === '/' || pathname === '/restaurants';
    const isExplore = pathname.includes('explore') || pathname.includes('#search');
    const isOrders = pathname.startsWith('/orders') || pathname.startsWith('/user/orders');
    const isProfile = pathname.startsWith('/user/settings');

    return (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[100] pb-8 px-6 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none">
            <nav className="w-full bg-[#131313]/95 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-4 px-2 flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em] text-[#5A5550] font-barlow-cond pointer-events-auto">
                <NavItem href="/" label="Home" icon={<span className="text-xl">🏠</span>} active={isHome} />
                <NavItem href="/restaurants" label="Explore" icon={<span className="text-xl">🔍</span>} active={isExplore} />
                <NavItem href="/orders" label="Orders" icon={<span className="text-xl">📋</span>} active={isOrders} />
                <NavItem href="/user/settings" label="Profile" icon={<span className="text-xl">👤</span>} active={isProfile} />
            </nav>
        </div>
    );
}
