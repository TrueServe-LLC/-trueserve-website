'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './merchant-dashboard.module.css';

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
    <div className={styles.container}>
      {/* SIDEBAR */}
      <div className={styles.sidebar}>
        <h1 className={styles.sidebarTitle}>Merchant Portal</h1>
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
          <h2 className={styles.headerTitle}>Merchant Dashboard</h2>
          <p className={styles.headerSubtitle}>{restaurantName}</p>
        </div>

        {/* CONTENT AREA */}
        <div className={styles.contentArea}>
          {children}
        </div>
      </div>
    </div>
  );
}
