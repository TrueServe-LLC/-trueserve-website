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
    <div className={styles.portal}>
      {/* SIDEBAR */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span>🛍️ Merchant Portal</span>
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
          <h1>Merchant Dashboard</h1>
          <p>{restaurantName}</p>
        </div>

        {/* CONTENT AREA */}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
