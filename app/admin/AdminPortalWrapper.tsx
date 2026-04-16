'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/auth/actions';

interface AdminPortalWrapperProps {
  children: React.ReactNode;
}

export default function AdminPortalWrapper({ children }: AdminPortalWrapperProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/dashboard',        label: 'Dashboard',        icon: '📊' },
    { href: '/admin/cost-management',  label: 'Cost Management',  icon: '💰' },
    { href: '/admin/pricing',          label: 'Pricing',          icon: '💳' },
    { href: '/admin/feature-switches', label: 'Feature Switches', icon: '🔧' },
    { href: '/admin/team',             label: 'Team',             icon: '👥' },
    { href: '/admin/support',          label: 'Support',          icon: '🆘' },
    { href: '/admin/live-chats',       label: 'Live Chats',       icon: '💬' },
    { href: '/admin/content',          label: 'Content',          icon: '📝' },
    { href: '/admin/analytics',        label: 'Analytics',        icon: '📈' },
    { href: '/admin/users',            label: 'Users',            icon: '👤' },
    { href: '/admin/settings',         label: 'Settings',         icon: '⚙️' },
  ];

  return (
    <>
      <style>{`
        .adm-portal {
          display: flex !important;
          min-height: 100vh !important;
          background: #0a0c09 !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
          color: #e0e0e0 !important;
        }
        .adm-sidebar {
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
        .adm-logo {
          padding: 4px 16px 16px !important;
          border-bottom: 1px solid #1e2420 !important;
          margin-bottom: 8px !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          color: #fff !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        .adm-nav-section {
          flex: 1 !important;
        }
        .adm-link {
          color: #999 !important;
          text-decoration: none !important;
          font-size: 13px !important;
          padding: 9px 16px !important;
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 10px !important;
          border-left: 2px solid transparent !important;
          white-space: nowrap !important;
          transition: all 150ms !important;
          background: transparent !important;
          width: 100% !important;
          justify-content: flex-start !important;
          cursor: pointer !important;
          border-top: none !important;
          border-right: none !important;
          border-bottom: none !important;
        }
        .adm-link:hover {
          color: #f97316 !important;
          background: rgba(249,115,22,0.06) !important;
        }
        .adm-link.adm-active {
          color: #f97316 !important;
          border-left-color: #f97316 !important;
          background: rgba(249,115,22,0.08) !important;
        }
        .adm-icon {
          font-size: 14px !important;
          width: 18px !important;
          flex-shrink: 0 !important;
          display: inline-block !important;
        }
        .adm-logout-section {
          border-top: 1px solid #1e2420 !important;
          padding-top: 8px !important;
          margin-top: 8px !important;
        }
        .adm-main {
          flex: 1 !important;
          margin-left: 200px !important;
          display: flex !important;
          flex-direction: column !important;
          min-height: 100vh !important;
          overflow: auto !important;
        }
        .adm-page-header {
          padding: 20px 24px 16px !important;
          border-bottom: 1px solid #1e2420 !important;
        }
        .adm-page-header h1 {
          font-size: 20px !important;
          font-weight: 600 !important;
          color: #fff !important;
          margin: 0 0 4px 0 !important;
        }
        .adm-page-header p {
          font-size: 13px !important;
          color: #666 !important;
          margin: 0 !important;
        }
        .adm-page-body {
          padding: 20px 24px !important;
          flex: 1 !important;
        }
        .adm-card {
          background: #141a18 !important;
          border: 1px solid #1e2420 !important;
          border-radius: 8px !important;
          padding: 18px !important;
        }
        .adm-card-title {
          font-size: 14px !important;
          font-weight: 600 !important;
          color: #fff !important;
          margin: 0 0 12px 0 !important;
        }
        @media (max-width: 768px) {
          .adm-sidebar { width: 160px !important; min-width: 160px !important; }
          .adm-main { margin-left: 160px !important; }
          .adm-page-header { padding: 16px 12px 12px !important; }
          .adm-page-body { padding: 12px !important; }
        }
      `}</style>

      <div className="adm-portal">
        {/* SIDEBAR */}
        <div className="adm-sidebar">
          <div className="adm-logo">📊 Admin Portal</div>

          <div className="adm-nav-section">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`adm-link${pathname === item.href ? ' adm-active' : ''}`}
              >
                <span className="adm-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="adm-logout-section">
            <form action={logout}>
              <button type="submit" className="adm-link" style={{ color: '#f97316' }}>
                <span className="adm-icon">🚪</span>Log Out
              </button>
            </form>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="adm-main">
          {children}
        </div>
      </div>
    </>
  );
}
