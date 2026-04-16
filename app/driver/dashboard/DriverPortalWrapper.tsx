'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/auth/actions';

interface DriverPortalWrapperProps {
  children: React.ReactNode;
}

export default function DriverPortalWrapper({ children }: DriverPortalWrapperProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/driver/dashboard',            label: 'Dashboard',   icon: '📊', iconBg: '#2a1508', iconColor: '#f97316' },
    { href: '/driver/dashboard/earnings',   label: 'Settlements', icon: '💰', iconBg: '#1a2a1a', iconColor: '#4dca80' },
    { href: '/driver/dashboard/ratings',    label: 'Reputation',  icon: '⭐', iconBg: '#2a1a08', iconColor: '#f97316' },
    { href: '/driver/dashboard/compliance', label: 'Compliance',  icon: '✅', iconBg: '#0f2a1a', iconColor: '#4dca80' },
    { href: '/driver/dashboard/account',    label: 'Profile',     icon: '👤', iconBg: '#1a1a2a', iconColor: '#6b8ee8' },
    { href: '/driver/dashboard/help',       label: 'Help',        icon: '🆘', iconBg: '#2a1010', iconColor: '#e84040' },
  ];

  return (
    <>
      <style>{`
        .drv-layout {
          display: flex !important;
          min-height: 100vh !important;
          background: #0d0d0d !important;
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif !important;
          color: #ddd !important;
          font-size: 13px !important;
        }
        .drv-sidebar {
          width: 168px !important;
          min-width: 168px !important;
          max-width: 168px !important;
          background: #0f0f0f !important;
          border-right: 0.5px solid #242424 !important;
          display: flex !important;
          flex-direction: column !important;
          padding: 16px 0 !important;
          position: fixed !important;
          top: 0 !important; left: 0 !important;
          height: 100vh !important;
          overflow-y: auto !important;
          z-index: 100 !important;
        }
        .drv-logo {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          padding: 0 16px 20px !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          color: #fff !important;
          letter-spacing: -0.2px !important;
        }
        .drv-nav-item {
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          padding: 9px 16px !important;
          font-size: 12px !important;
          color: #888 !important;
          text-decoration: none !important;
          border-left: 2px solid transparent !important;
          transition: background 0.15s, color 0.15s !important;
        }
        .drv-nav-item:hover {
          background: #141414 !important;
          color: #ccc !important;
        }
        .drv-nav-item.drv-active {
          color: #fff !important;
          background: #1a1a1a !important;
          border-left-color: #f97316 !important;
        }
        .drv-nav-icon {
          width: 18px !important;
          height: 18px !important;
          border-radius: 5px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 11px !important;
          flex-shrink: 0 !important;
        }
        .drv-sidebar-footer {
          margin-top: auto !important;
          padding: 12px 16px !important;
          border-top: 0.5px solid #242424 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 4px !important;
        }
        .drv-tutorial-btn {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          background: #1a1a1a !important;
          border: 0.5px solid #2e2e2e !important;
          border-radius: 8px !important;
          padding: 9px 12px !important;
          color: #666 !important;
          font-size: 11px !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          width: 100% !important;
          font-family: inherit !important;
          transition: all 0.15s !important;
        }
        .drv-tutorial-btn:hover {
          background: #1f1f1f !important;
          color: #f97316 !important;
          border-color: #f97316 !important;
        }
        .drv-tutorial-icon {
          width: 16px !important; height: 16px !important;
          border-radius: 50% !important;
          border: 1.5px solid currentColor !important;
          display: flex !important; align-items: center !important; justify-content: center !important;
          font-size: 10px !important; font-weight: 700 !important; flex-shrink: 0 !important;
        }
        .drv-logout-btn {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          padding: 9px 4px !important;
          font-size: 12px !important;
          color: #444 !important;
          cursor: pointer !important;
          background: transparent !important;
          border: none !important;
          width: 100% !important;
          font-family: inherit !important;
          transition: color 0.15s !important;
        }
        .drv-logout-btn:hover { color: #888 !important; }
        .drv-main {
          flex: 1 !important;
          margin-left: 168px !important;
          padding: 26px 28px !important;
          min-height: 100vh !important;
          overflow: auto !important;
          background: #0d0d0d !important;
        }
        @media (max-width: 768px) {
          .drv-sidebar { width: 140px !important; min-width: 140px !important; }
          .drv-main { margin-left: 140px !important; padding: 16px !important; }
        }
      `}</style>

      <div className="drv-layout">
        <aside className="drv-sidebar">
          <div className="drv-logo">
            <img
              src="/logo.png"
              alt="TrueServe"
              width={28}
              height={28}
              style={{ borderRadius: '50%', boxShadow: '0 0 10px rgba(232,124,43,0.4)', flexShrink: 0 }}
            />
            <span>True<span style={{ color: '#f97316' }}>Serve</span></span>
          </div>

          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/driver/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`drv-nav-item${isActive ? ' drv-active' : ''}`}
                >
                  <span
                    className="drv-nav-icon"
                    style={{ background: item.iconBg }}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="drv-sidebar-footer">
            <button className="drv-tutorial-btn">
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
          {children}
        </main>
      </div>
    </>
  );
}
