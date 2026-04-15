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
    <div className="min-h-screen bg-[#0a0c09] flex">
      {/* SIDEBAR */}
      <div className="w-64 bg-[#0f1210] border-r border-white/10 min-h-screen sticky top-0">
        <div className="p-6">
          <h1 className="text-2xl font-black text-white mb-8">Merchant Portal</h1>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-orange-500 text-black font-bold'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1">
        {/* HEADER */}
        <div className="bg-[#0a0c09] border-b border-white/10 px-8 py-6">
          <h2 className="text-4xl font-black text-white mb-2">Merchant Dashboard</h2>
          <p className="text-white/60">{restaurantName}</p>
        </div>

        {/* CONTENT AREA */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
