'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MerchantDashboardWrapperProps {
  restaurantName: string;
  children: React.ReactNode;
}

export default function MerchantDashboardWrapper({ restaurantName, children }: MerchantDashboardWrapperProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/merchant/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/merchant/dashboard/compliance', label: 'Compliance', icon: '✅' },
    { href: '/merchant/dashboard/integrations', label: 'Integrations', icon: '🔗' },
    { href: '/merchant/dashboard/storefront', label: 'Storefront', icon: '🛍️' },
    { href: '/merchant/dashboard/franchise', label: 'Franchise', icon: '🏪' },
  ];

  return (
    <>
      <style>{`
        .mch-portal {
          display: flex !important;
          min-height: 100vh !important;
          background: #0a0c09 !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
          color: #e0e0e0 !important;
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
        .mch-link {
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
        }
        .mch-link:hover {
          color: #f97316 !important;
          background: rgba(249,115,22,0.06) !important;
        }
        .mch-link.mch-active {
          color: #f97316 !important;
          border-left-color: #f97316 !important;
          background: rgba(249,115,22,0.08) !important;
        }
        .mch-icon {
          font-size: 14px !important;
          width: 18px !important;
          flex-shrink: 0 !important;
          display: inline-block !important;
        }
        .mch-main {
          flex: 1 !important;
          margin-left: 200px !important;
          display: flex !important;
          flex-direction: column !important;
          min-height: 100vh !important;
          overflow: auto !important;
        }
        .mch-hero {
          padding: 24px 24px 8px !important;
          border-bottom: 1px solid #1e2420 !important;
        }
        .mch-hero h1 {
          font-size: 22px !important;
          font-weight: 600 !important;
          color: #fff !important;
          margin: 0 0 4px 0 !important;
        }
        .mch-hero p {
          font-size: 13px !important;
          color: #666 !important;
          margin: 0 !important;
        }
        .mch-content {
          padding: 16px 24px 24px !important;
          flex: 1 !important;
        }
        @media (max-width: 768px) {
          .mch-sidebar { width: 160px !important; min-width: 160px !important; }
          .mch-main { margin-left: 160px !important; }
          .mch-hero { padding: 16px 12px 8px !important; }
          .mch-content { padding: 12px !important; }
        }
      `}</style>

      <div className="mch-portal">
        {/* SIDEBAR */}
        <div className="mch-sidebar">
          <div className="mch-logo">🛍️ Merchant Portal</div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`mch-link${pathname === item.href ? ' mch-active' : ''}`}
            >
              <span className="mch-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* MAIN */}
        <div className="mch-main">
          <div className="mch-hero">
            <h1>Merchant Dashboard</h1>
            <p>{restaurantName}</p>
          </div>
          <div className="mch-content">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
