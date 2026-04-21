'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/auth/actions';

interface MerchantDashboardWrapperProps {
  restaurantName: string;
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function MerchantDashboardWrapper({ restaurantName, children, pageTitle, pageSubtitle }: MerchantDashboardWrapperProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/merchant/dashboard',             label: 'Dashboard',    icon: '📊', dotColor: '#f97316', tour: 'merchant-nav-dashboard' },
    { href: '/merchant/dashboard/compliance',  label: 'Compliance',   icon: '✅', dotColor: '#4dca80', tour: 'merchant-nav-compliance' },
    { href: '/merchant/dashboard/integrations',label: 'Integrations', icon: '🔗', dotColor: '#555', tour: 'merchant-nav-integrations' },
    { href: '/merchant/dashboard/storefront',  label: 'Storefront',   icon: '🛍️', dotColor: '#555', tour: 'merchant-nav-storefront' },
    { href: '/merchant/dashboard/franchise',   label: 'Franchise',    icon: '🏪', dotColor: '#555', tour: 'merchant-nav-franchise' },
  ];

    return (
      <>
      <style>{`
        .mch-layout {
          display: flex !important;
          min-height: 100vh !important;
          background: #0a0c09 !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
          color: #e0e0e0 !important;
          font-size: 13px !important;
        }
        .mch-sidebar {
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
        .mch-logo {
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
        .mch-nav-item {
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
        .mch-nav-item:hover {
          background: rgba(249,115,22,0.06) !important;
          color: #f97316 !important;
        }
        .mch-nav-item.mch-active {
          color: #f97316 !important;
          background: rgba(249,115,22,0.08) !important;
          border-left-color: #f97316 !important;
        }
        .mch-nav-emoji {
          font-size: 13px !important;
          flex-shrink: 0 !important;
        }
        .mch-sidebar-footer {
          margin-top: auto !important;
          padding: 12px 16px 0 !important;
          border-top: 1px solid #1e2420 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 8px !important;
        }
        .mch-tutorial-btn {
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
        .mch-tutorial-btn:hover {
          background: rgba(249,115,22,0.06) !important;
          color: #f97316 !important;
          border-color: rgba(249,115,22,0.35) !important;
        }
        .mch-tutorial-icon {
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
        .mch-logout-btn {
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
        .mch-logout-btn:hover { color: #f97316 !important; }
        .mch-main {
          flex: 1 !important;
          margin-left: 200px !important;
          padding: 20px 24px 40px !important;
          min-height: 100vh !important;
          overflow: auto !important;
          background: #0a0c09 !important;
        }
        .mch-page-title {
          font-size: 20px !important;
          font-weight: 600 !important;
          color: #fff !important;
          margin-bottom: 4px !important;
          letter-spacing: -0.01em !important;
        }
        .mch-page-sub {
          font-size: 13px !important;
          color: #666 !important;
          margin-bottom: 18px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.08em !important;
          font-weight: 600 !important;
        }
        .mch-main [class*="rounded-2xl"],
        .mch-main [class*="rounded-3xl"],
        .mch-main [class*="rounded-[18px]"],
        .mch-main [class*="rounded-[20px]"],
        .mch-main [class*="rounded-[22px]"],
        .mch-main [class*="rounded-[24px]"],
        .mch-main [class*="rounded-[28px]"],
        .mch-main [class*="rounded-[32px]"] {
          border-radius: 8px !important;
        }
        @media (max-width: 768px) {
          .mch-sidebar { width: 160px !important; min-width: 160px !important; }
          .mch-main { margin-left: 160px !important; padding: 16px !important; }
        }
      `}</style>

      <div className="mch-layout">
        {/* SIDEBAR */}
        <aside className="mch-sidebar">
          <div className="mch-logo">
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
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  data-tour={item.tour}
                  href={item.href}
                  className={`mch-nav-item${isActive ? ' mch-active' : ''}`}
                >
                  <span className="mch-nav-emoji">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mch-sidebar-footer">
            <button className="mch-tutorial-btn" onClick={() => window.dispatchEvent(new CustomEvent('ts:portal-tour:open', { detail: { portal: 'MERCHANT' } }))}>
              <span className="mch-tutorial-icon">?</span>
              Start tutorial
            </button>
            <form action={logout}>
              <button type="submit" className="mch-logout-btn">
                🚪 Log Out
              </button>
            </form>
          </div>
        </aside>

        {/* MAIN */}
        <main className="mch-main">
          <div className="mch-page-title">{pageTitle ?? "Merchant Dashboard"}</div>
          <div className="mch-page-sub">{pageSubtitle ?? restaurantName}</div>
          {children}
        </main>
      </div>
    </>
  );
}
