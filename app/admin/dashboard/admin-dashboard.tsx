'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './admin-dashboard.module.css';

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
    <div className={styles.portal}>
      {/* SIDEBAR */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span>📊 Admin Portal</span>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className={styles.main}>
        {/* HEADER */}
        <div className={styles.hero}>
          <h1>Welcome to Admin Portal</h1>
          <p>Manage TrueServe operations and analytics</p>
        </div>

        {/* STATS GRID */}
        <div className={styles.stats}>
          {[
            { icon: '👨‍💼', label: 'Active Merchants', value: stats.activeMerchants },
            { icon: '🚗', label: 'Active Drivers', value: stats.activeDrivers },
            { icon: '📦', label: 'Orders Today', value: stats.ordersToday },
            { icon: '💵', label: 'Revenue (Today)', value: `$${stats.revenueToday.toLocaleString()}` }
          ].map((card, idx) => (
            <div key={idx} className={styles.statCard}>
              <div className={styles.label}>
                <span>{card.icon}</span>
                {card.label}
              </div>
              <div className={styles.value}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* FEATURE CARDS */}
        <div className={styles.cards}>
          {[
            { icon: '💰', title: 'Cost Management', desc: 'Track spending across all services (AWS, Google Cloud, Stripe, Supabase, Mailbox, Resend, Vonage)', href: '/admin/cost-management' },
            { icon: '📊', title: 'Analytics', desc: 'Real-time metrics on orders, drivers, merchants, and platform health', href: '/admin/analytics' },
            { icon: '👥', title: 'User Management', desc: 'Manage drivers, merchants, and customer accounts', href: '/admin/users' }
          ].map((card, idx) => (
            <Link key={idx} href={card.href} className={styles.card}>
              <div className={styles.cardTitle}>
                <span>{card.icon}</span>
                {card.title}
              </div>
              <div className={styles.cardDesc}>{card.desc}</div>
              <a className={styles.cardLink}>View Dashboard →</a>
            </Link>
          ))}
        </div>

        {/* ACTIVITY */}
        <div className={styles.activity}>
          <h2>Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p>No recent activity</p>
          ) : (
            <div>
              {recentActivity.map((item) => (
                <div key={item.id}>
                  <p>{item.message}</p>
                  <p>{item.timestamp}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
