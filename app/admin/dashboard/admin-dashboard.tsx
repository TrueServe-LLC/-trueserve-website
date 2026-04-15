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
    <div className={styles.container}>
      {/* SIDEBAR */}
      <div className={styles.sidebar}>
        <h1 className={styles.sidebarTitle}>Admin Portal</h1>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className={styles.mainContent}>
        {/* HEADER */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Welcome to Admin Portal</h2>
          <p className={styles.headerSubtitle}>Manage TrueServe operations and analytics</p>
        </div>

        {/* CONTENT AREA */}
        <div className={styles.contentArea}>
          {/* KPI CARDS */}
          <div className={styles.kpiGrid}>
            {[
              { icon: '👨‍💼', label: 'Active Merchants', value: stats.activeMerchants },
              { icon: '🚗', label: 'Active Drivers', value: stats.activeDrivers },
              { icon: '📦', label: 'Orders Today', value: stats.ordersToday },
              { icon: '💵', label: 'Revenue (Today)', value: `$${stats.revenueToday.toLocaleString()}` }
            ].map((card, idx) => (
              <div key={idx} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>{card.icon}</span>
                  <p className={styles.cardLabel}>{card.label}</p>
                </div>
                <p className={styles.cardValue}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* FEATURE CARDS */}
          <div className={styles.featureGrid}>
            {[
              { icon: '💰', title: 'Cost Management', desc: 'Track spending across all services', href: '/admin/cost-management' },
              { icon: '📊', title: 'Analytics', desc: 'Real-time metrics on orders, drivers, merchants', href: '/admin/analytics' },
              { icon: '👥', title: 'User Management', desc: 'Manage drivers, merchants, and accounts', href: '/admin/users' }
            ].map((card, idx) => (
              <Link key={idx} href={card.href} className={styles.featureCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.featureCardIcon}>{card.icon}</span>
                  <p className={styles.featureCardTitle}>{card.title}</p>
                </div>
                <p className={styles.featureCardDesc}>{card.desc}</p>
                <p className={styles.featureCardLink}>View →</p>
              </Link>
            ))}
          </div>

          {/* RECENT ACTIVITY */}
          <div className={styles.activityCard}>
            <h3 className={styles.activityTitle}>Recent Activity</h3>
            <div className={styles.activityList}>
              {recentActivity.length === 0 ? (
                <p className={styles.emptyState}>No recent activity</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className={styles.activityItem}>
                    <p className={styles.activityMessage}>{activity.message}</p>
                    <p className={styles.activityTime}>{activity.timestamp}</p>
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
