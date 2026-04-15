'use client';

import Link from 'next/link';

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
  return (
    <div className="min-h-screen bg-[#0a0c09] flex">
      {/* SIDEBAR */}
      <div className="w-64 bg-[#0f1210] border-r border-white/10 min-h-screen sticky top-0">
        <div className="p-6">
          <h1 className="text-2xl font-black text-white mb-8">Admin Portal</h1>

          <nav className="space-y-2">
            {[
              { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
              { href: '/admin/cost-management', label: 'Cost Management', icon: '💰' },
              { href: '/admin/pricing', label: 'Pricing', icon: '💳' },
              { href: '/admin/feature-switches', label: 'Feature Switches', icon: '🔧' },
              { href: '/admin/team', label: 'Team', icon: '👥' },
              { href: '/admin/support', label: 'Support', icon: '🆘' },
              { href: '/admin/live-chats', label: 'Live Chats', icon: '💬' },
              { href: '/admin/content', label: 'Content', icon: '📝' },
              { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.label === 'Dashboard'
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
          <h2 className="text-4xl font-black text-white mb-2">Welcome to Admin Portal</h2>
          <p className="text-white/60">Manage TrueServe operations and analytics</p>
        </div>

        {/* CONTENT AREA */}
        <div className="p-8 space-y-8">
          {/* KPI CARDS */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-[#10131b] border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">👨‍💼</span>
                <p className="text-sm text-white/60 font-semibold">Active Merchants</p>
              </div>
              <p className="text-4xl font-black text-white">{stats.activeMerchants.toLocaleString()}</p>
            </div>

            <div className="bg-[#10131b] border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🚗</span>
                <p className="text-sm text-white/60 font-semibold">Active Drivers</p>
              </div>
              <p className="text-4xl font-black text-white">{stats.activeDrivers.toLocaleString()}</p>
            </div>

            <div className="bg-[#10131b] border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📦</span>
                <p className="text-sm text-white/60 font-semibold">Orders Today</p>
              </div>
              <p className="text-4xl font-black text-white">{stats.ordersToday.toLocaleString()}</p>
            </div>

            <div className="bg-[#10131b] border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💵</span>
                <p className="text-sm text-white/60 font-semibold">Revenue (Today)</p>
              </div>
              <p className="text-4xl font-black text-white">${stats.revenueToday.toLocaleString()}</p>
            </div>
          </div>

          {/* FEATURE CARDS */}
          <div className="grid grid-cols-3 gap-6">
            <Link
              href="/admin/cost-management"
              className="bg-[#10131b] border border-white/10 rounded-lg p-6 hover:border-orange-500/50 transition-colors group"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">💰</span>
                <p className="text-lg font-bold text-white">Cost Management</p>
              </div>
              <p className="text-sm text-white/60 mb-4">
                Track spending across all services (AWS, Google Cloud, Stripe, Supabase, Mailbox, Resend, Vonage)
              </p>
              <p className="text-sm text-orange-500 font-bold group-hover:translate-x-1 transition-transform inline-block">
                View Dashboard →
              </p>
            </Link>

            <Link
              href="/admin/analytics"
              className="bg-[#10131b] border border-white/10 rounded-lg p-6 hover:border-orange-500/50 transition-colors group"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">📊</span>
                <p className="text-lg font-bold text-white">Analytics</p>
              </div>
              <p className="text-sm text-white/60 mb-4">
                Real-time metrics on orders, drivers, merchants, and platform health
              </p>
              <p className="text-sm text-orange-500 font-bold group-hover:translate-x-1 transition-transform inline-block">
                View Analytics →
              </p>
            </Link>

            <Link
              href="/admin/users"
              className="bg-[#10131b] border border-white/10 rounded-lg p-6 hover:border-orange-500/50 transition-colors group"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">👥</span>
                <p className="text-lg font-bold text-white">User Management</p>
              </div>
              <p className="text-sm text-white/60 mb-4">
                Manage drivers, merchants, and customer accounts
              </p>
              <p className="text-sm text-orange-500 font-bold group-hover:translate-x-1 transition-transform inline-block">
                Manage Users →
              </p>
            </Link>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="bg-[#10131b] border border-white/10 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-white/50 text-sm">No recent activity</p>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                  >
                    <p className="text-sm text-white/80">{activity.message}</p>
                    <p className="text-xs text-white/40">{activity.timestamp}</p>
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
