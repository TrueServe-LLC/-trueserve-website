'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardProps {
  stats: {
    activeMerchants: number;
    activeDrivers: number;
    ordersToday: number;
    revenueToday: number;
  };
  recentActivity: Array<{
    id: string;
    message: string;
    timestamp: string;
    type: 'merchant' | 'driver' | 'order' | 'system';
  }>;
}

export default function AdminDashboard({ stats, recentActivity }: DashboardProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/cost-management', label: 'Cost Management', icon: '💰' },
    { href: '/admin/pricing', label: 'Pricing', icon: '💳' },
    { href: '/admin/feature-switches', label: 'Feature Switches', icon: '🔧' },
    { href: '/admin/team', label: 'Team', icon: '👥' },
    { href: '/admin/support', label: 'Support', icon: '🆘' },
    { href: '/admin/live-chats', label: 'Live Chats', icon: '💬' },
    { href: '/admin/content', label: 'Content', icon: '📝' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
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
        .adm-main {
          flex: 1 !important;
          margin-left: 200px !important;
          display: flex !important;
          flex-direction: column !important;
          min-height: 100vh !important;
          overflow: auto !important;
        }
        .adm-hero {
          padding: 24px 24px 8px !important;
          border-bottom: 1px solid #1e2420 !important;
        }
        .adm-hero h1 {
          font-size: 22px !important;
          font-weight: 600 !important;
          color: #fff !important;
          margin: 0 0 4px 0 !important;
        }
        .adm-hero p {
          font-size: 13px !important;
          color: #666 !important;
          margin: 0 !important;
        }
        .adm-stats {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 12px !important;
          padding: 16px 24px !important;
        }
        .adm-stat {
          background: #141a18 !important;
          border: 1px solid #1e2420 !important;
          border-radius: 8px !important;
          padding: 14px 16px !important;
        }
        .adm-stat-label {
          font-size: 12px !important;
          color: #777 !important;
          margin-bottom: 6px !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
        }
        .adm-stat-value {
          font-size: 26px !important;
          font-weight: 500 !important;
          color: #fff !important;
        }
        .adm-cards {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 12px !important;
          padding: 0 24px 16px !important;
        }
        .adm-card {
          background: #141a18 !important;
          border: 1px solid #1e2420 !important;
          border-radius: 8px !important;
          padding: 18px !important;
          text-decoration: none !important;
          display: block !important;
          transition: border-color 150ms !important;
        }
        .adm-card:hover {
          border-color: rgba(249,115,22,0.4) !important;
        }
        .adm-card-title {
          font-size: 15px !important;
          font-weight: 500 !important;
          color: #fff !important;
          margin-bottom: 6px !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        .adm-card-desc {
          font-size: 12px !important;
          color: #777 !important;
          line-height: 1.5 !important;
          margin-bottom: 12px !important;
        }
        .adm-card-link {
          font-size: 12px !important;
          color: #f97316 !important;
        }
        .adm-activity {
          margin: 0 24px 24px !important;
          background: #141a18 !important;
          border: 1px solid #1e2420 !important;
          border-radius: 8px !important;
          padding: 18px !important;
        }
        .adm-activity h2 {
          font-size: 15px !important;
          font-weight: 500 !important;
          color: #fff !important;
          margin: 0 0 10px 0 !important;
        }
        .adm-activity p {
          font-size: 13px !important;
          color: #555 !important;
          margin: 0 !important;
        }
        .adm-activity-item {
          display: flex !important;
          justify-content: space-between !important;
          padding: 10px 0 !important;
          border-bottom: 1px solid #1e2420 !important;
        }
        .adm-activity-item:last-child {
          border-bottom: none !important;
        }
        .adm-activity-msg {
          font-size: 13px !important;
          color: #ccc !important;
          margin: 0 !important;
        }
        .adm-activity-time {
          font-size: 12px !important;
          color: #555 !important;
          white-space: nowrap !important;
          margin: 0 !important;
          margin-left: 16px !important;
        }
        @media (max-width: 1024px) {
          .adm-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .adm-cards { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .adm-sidebar { width: 160px !important; min-width: 160px !important; }
          .adm-main { margin-left: 160px !important; }
          .adm-stats { grid-template-columns: repeat(2, 1fr) !important; padding: 12px !important; }
          .adm-cards { grid-template-columns: 1fr !important; padding: 0 12px 12px !important; }
          .adm-hero { padding: 16px 12px 8px !important; }
          .adm-activity { margin: 0 12px 12px !important; }
        }
      `}</style>

      <div className="adm-portal">
        {/* SIDEBAR */}
        <div className="adm-sidebar">
          <div className="adm-logo">📊 Admin Portal</div>
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

        {/* MAIN */}
        <div className="adm-main">
          <div className="adm-hero">
            <h1>Welcome to Admin Portal</h1>
            <p>Manage TrueServe operations and analytics</p>
          </div>

          <div className="adm-stats">
            {[
              { icon: '👨‍💼', label: 'Active Merchants', value: stats.activeMerchants },
              { icon: '🚗',   label: 'Active Drivers',   value: stats.activeDrivers },
              { icon: '📦',   label: 'Orders Today',     value: stats.ordersToday },
              { icon: '💵',   label: 'Revenue (Today)',  value: `$${stats.revenueToday.toLocaleString()}` },
            ].map((s, i) => (
              <div key={i} className="adm-stat">
                <div className="adm-stat-label"><span>{s.icon}</span>{s.label}</div>
                <div className="adm-stat-value">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="adm-cards">
            {[
              { icon: '💰', title: 'Cost Management',  desc: 'Track spending across all services (AWS, Google Cloud, Stripe, Supabase, Mailbox, Resend, Vonage)', href: '/admin/cost-management' },
              { icon: '📊', title: 'Analytics',        desc: 'Real-time metrics on orders, drivers, merchants, and platform health', href: '/admin/analytics' },
              { icon: '👥', title: 'User Management',  desc: 'Manage drivers, merchants, and customer accounts', href: '/admin/users' },
            ].map((c, i) => (
              <Link key={i} href={c.href} className="adm-card">
                <div className="adm-card-title"><span>{c.icon}</span>{c.title}</div>
                <div className="adm-card-desc">{c.desc}</div>
                <span className="adm-card-link">View →</span>
              </Link>
            ))}
          </div>

          <div className="adm-activity">
            <h2>Recent Activity</h2>
            {recentActivity.length === 0 ? (
              <p>No recent activity</p>
            ) : recentActivity.map((a) => (
              <div key={a.id} className="adm-activity-item">
                <p className="adm-activity-msg">{a.message}</p>
                <p className="adm-activity-time">{a.timestamp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
