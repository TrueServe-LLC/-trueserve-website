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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0c09' }}>
      {/* SIDEBAR */}
      <div style={{
        width: '256px',
        backgroundColor: '#0f1210',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        padding: '24px',
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'white', marginBottom: '32px' }}>
          Admin Portal
        </h1>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                transition: 'all 200ms',
                textDecoration: 'none',
                backgroundColor: pathname === item.href ? '#f97316' : 'transparent',
                color: pathname === item.href ? 'black' : 'rgba(255,255,255,0.7)',
                fontWeight: pathname === item.href ? 'bold' : 'normal'
              }}
              onMouseEnter={(e) => {
                if (pathname !== item.href) {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== item.href) {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span style={{ fontSize: '14px' }}>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* HEADER */}
        <div style={{
          backgroundColor: '#0a0c09',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '24px 32px',
        }}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>
            Welcome to Admin Portal
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
            Manage TrueServe operations and analytics
          </p>
        </div>

        {/* CONTENT AREA */}
        <div style={{ padding: '32px', overflow: 'auto' }}>
          {/* KPI CARDS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {[
              { icon: '👨‍💼', label: 'Active Merchants', value: stats.activeMerchants },
              { icon: '🚗', label: 'Active Drivers', value: stats.activeDrivers },
              { icon: '📦', label: 'Orders Today', value: stats.ordersToday },
              { icon: '💵', label: 'Revenue (Today)', value: `$${stats.revenueToday.toLocaleString()}` }
            ].map((card, idx) => (
              <div key={idx} style={{
                backgroundColor: '#10131b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '24px' }}>{card.icon}</span>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>
                    {card.label}
                  </p>
                </div>
                <p style={{ fontSize: '36px', fontWeight: 900, color: 'white' }}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {/* FEATURE CARDS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {[
              { icon: '💰', title: 'Cost Management', desc: 'Track spending across all services', href: '/admin/cost-management' },
              { icon: '📊', title: 'Analytics', desc: 'Real-time metrics on orders, drivers, merchants', href: '/admin/analytics' },
              { icon: '👥', title: 'User Management', desc: 'Manage drivers, merchants, and accounts', href: '/admin/users' }
            ].map((card, idx) => (
              <Link key={idx} href={card.href} style={{
                backgroundColor: '#10131b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '24px',
                textDecoration: 'none',
                transition: 'all 200ms',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(249,115,22,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '28px' }}>{card.icon}</span>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                    {card.title}
                  </p>
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                  {card.desc}
                </p>
                <p style={{ fontSize: '14px', color: '#f97316', fontWeight: 'bold' }}>
                  View →
                </p>
              </Link>
            ))}
          </div>

          {/* RECENT ACTIVITY */}
          <div style={{
            backgroundColor: '#10131b',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>
              Recent Activity
            </h3>
            <div>
              {recentActivity.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>No recent activity</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                      {activity.message}
                    </p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                      {activity.timestamp}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
