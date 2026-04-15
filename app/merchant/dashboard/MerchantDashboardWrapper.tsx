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
          Merchant Portal
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
            Merchant Dashboard
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
            {restaurantName}
          </p>
        </div>

        {/* CONTENT AREA */}
        <div style={{ padding: '32px', overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
