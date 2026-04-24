'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/auth/actions';

interface DriverPortalWrapperProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function DriverPortalWrapper({ children, pageTitle, pageSubtitle }: DriverPortalWrapperProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/driver/dashboard', label: 'Dashboard', icon: '📊', tour: 'driver-nav-dashboard' },
    { href: '/driver/dashboard/earnings', label: 'Settlements', icon: '💰', tour: 'driver-nav-earnings' },
    { href: '/driver/dashboard/ratings', label: 'Reputation', icon: '⭐', tour: 'driver-nav-ratings' },
    { href: '/driver/dashboard/compliance', label: 'Compliance', icon: '✅', tour: 'driver-nav-compliance' },
    { href: '/driver/dashboard/account',   label: 'Profile',   icon: '👤', tour: 'driver-nav-account'   },
    { href: '/driver/dashboard/disputes',  label: 'Disputes',  icon: '🚨', tour: 'driver-nav-disputes'  },
    { href: '/driver/dashboard/help',      label: 'Help',      icon: '🆘', tour: 'driver-nav-help'      },
  ];

  return (
    <>
      <style>{`
        .drv-layout {
          display: flex !important;
          min-height: 100vh !important;
          background: #0a0c09 !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
          color: #e0e0e0 !important;
          font-size: 13px !important;
        }
        .drv-sidebar {
          width: 200px !important;
          min-width: 200px !important;
          max-width: 200px !important;
          background: #0f1210 !important;
          border-right: 1px solid #1e2420 !important;
          display: flex !important;
          flex-direction: column !important;
          padding: 16px 0 !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          height: 100vh !important;
          overflow-y: auto !important;
          z-index: 100 !important;
        }
        .drv-logo {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          padding: 0 16px 16px !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          color: #fff !important;
          border-bottom: 1px solid #1e2420 !important;
          margin-bottom: 8px !important;
        }
        .drv-nav-item {
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          padding: 9px 16px !important;
          font-size: 13px !important;
          color: #999 !important;
          text-decoration: none !important;
          border-left: 2px solid transparent !important;
          transition: background 0.15s, color 0.15s !important;
          white-space: nowrap !important;
          background: transparent !important;
          width: 100% !important;
        }
        .drv-nav-item:hover {
          background: rgba(249,115,22,0.06) !important;
          color: #f97316 !important;
        }
        .drv-nav-item.drv-active {
          color: #f97316 !important;
          background: rgba(249,115,22,0.08) !important;
          border-left-color: #f97316 !important;
        }
        .drv-nav-emoji {
          font-size: 13px !important;
          flex-shrink: 0 !important;
        }
        .drv-sidebar-footer {
          margin-top: auto !important;
          padding: 12px 16px 0 !important;
          border-top: 1px solid #1e2420 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 8px !important;
        }
        .drv-tutorial-btn {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          background: #141a18 !important;
          border: 1px solid #1e2420 !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          color: #bbb !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          cursor: pointer !important;
          width: 100% !important;
          transition: background 0.15s, color 0.15s, border-color 0.15s !important;
          font-family: inherit !important;
        }
        .drv-tutorial-btn:hover {
          background: rgba(249,115,22,0.06) !important;
          color: #f97316 !important;
          border-color: rgba(249,115,22,0.35) !important;
        }
        .drv-tutorial-icon {
          width: 16px !important;
          height: 16px !important;
          border-radius: 4px !important;
          border: 1.5px solid currentColor !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          flex-shrink: 0 !important;
        }
        .drv-logout-btn {
          display: flex !important;
          align-items: center !important;
          gap: 7px !important;
          background: transparent !important;
          border: none !important;
          padding: 7px 0 9px !important;
          color: #666 !important;
          font-size: 11px !important;
          cursor: pointer !important;
          width: 100% !important;
          font-family: inherit !important;
          font-weight: 700 !important;
          transition: color 0.15s !important;
        }
        .drv-logout-btn:hover { color: #f97316 !important; }
        .drv-main {
          flex: 1 !important;
          margin-left: 200px !important;
          padding: 20px 24px 40px !important;
          min-height: 100vh !important;
          overflow: auto !important;
          background: #0a0c09 !important;
        }
        .drv-main [class*="rounded-2xl"],
        .drv-main [class*="rounded-3xl"],
        .drv-main [class*="rounded-[18px]"],
        .drv-main [class*="rounded-[20px]"],
        .drv-main [class*="rounded-[22px]"],
        .drv-main [class*="rounded-[24px]"],
        .drv-main [class*="rounded-[28px]"],
        .drv-main [class*="rounded-[32px]"] {
          border-radius: 8px !important;
        }
        .drv-page-title {
          font-size: 20px !important;
          font-weight: 600 !important;
          color: #fff !important;
          margin-bottom: 4px !important;
          letter-spacing: -0.01em !important;
        }
        .drv-page-sub {
          font-size: 13px !important;
          color: #666 !important;
          margin-bottom: 18px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.08em !important;
          font-weight: 600 !important;
        }
        @media (max-width: 768px) {
          .drv-sidebar { width: 160px !important; min-width: 160px !important; }
          .drv-main { margin-left: 160px !important; padding: 16px !important; }
        }
      `}</style>

      <div className="drv-layout">
        <aside className="drv-sidebar">
          <div className="drv-logo">
            <img
              src="/logo.png"
              alt="TrueServe"
              width={26}
              height={26}
              style={{ borderRadius: '50%', boxShadow: '0 0 8px rgba(232,124,43,0.4)', flexShrink: 0 }}
            />
            <span style={{ color: '#fff', fontWeight: 700 }}>
              True<span style={{ color: '#f97316' }}>Serve</span>
            </span>
          </div>

          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/driver/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  data-tour={item.tour}
                  href={item.href}
                  className={`drv-nav-item${isActive ? ' drv-active' : ''}`}
                >
                  <span className="drv-nav-emoji">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="drv-sidebar-footer">
            <button
              className="drv-tutorial-btn"
              onClick={() => window.dispatchEvent(new CustomEvent('ts:portal-tour:open', { detail: { portal: 'DRIVER' } }))}
            >
              <span className="drv-tutorial-icon">?</span>
              Start tutorial
            </button>
            <form action={logout}>
              <button type="submit" className="drv-logout-btn">
                <span style={{ fontSize: 14 }}>→</span> Log Out
              </button>
            </form>
          </div>
        </aside>

        <main className="drv-main">
          {pageTitle || pageSubtitle ? (
            <>
              {pageTitle ? <div className="drv-page-title">{pageTitle}</div> : null}
              {pageSubtitle ? <div className="drv-page-sub">{pageSubtitle}</div> : null}
            </>
          ) : null}
          {children}
        </main>
      </div>
    </>
  );
}
