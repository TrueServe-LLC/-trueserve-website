'use client';

import Link from 'next/link';
import { useState } from 'react';

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
    <div className="min-h-screen bg-[#0a0c09]">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#0f1210] border-r border-white/10 p-6 h-screen sticky top-0">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-white">
              Admin Portal
            </h1>
          </div>

          <nav className="space-y-3">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#e8a230] text-black font-bold transition-colors"
            >
              <span className="text-lg">📊</span>
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/cost-management"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="text-lg">💰</span>
              <span>Cost Management</span>
            </Link>

            <Link
              href="/admin/pricing"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="text-lg">💳</span>
              <span>Pricing</span>
            </Link>

            <Link
              href="/admin/feature-switches"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="text-lg">🔧</span>
              <span>Feature Switches</span>
            </Link>

            <Link
              href="/admin/team"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="text-lg">👥</span>
              <span>Team</span>
            </Link>

            <Link
              href="/admin/support"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="text-lg">🆘</span>
              <span>Support</span>
            </Link>

            <Link
              href="/admin/live-chats"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="text-lg">💬</span>
              <span>Live Chats</span>
            </Link>

            <Link
              href="/admin/content"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="text-lg">📝</span>
              <span>Content</span>
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="text-lg">⚙️</span>
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-10">
            <h2 className="text-4xl font-black text-white mb-2">Welcome to Admin Portal</h2>
            <p className="text-white/60">Manage TrueServe operations and analytics</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6 mb-10">
            <div className="bg-[#10131b] border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">👨‍💼</span>
                <p className="text-sm text-white/60 font-semibold">Active Merchants</p>
              </div>
              <p className="text-3xl font-black text-white">{stats.activeMerchants.toLocaleString()}</p>
            </div>

            <div className="bg-[#10131b] border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🚗</span>
                <p className="text-sm text-white/60 font-semibold">Active Drivers</p>
              </div>
              <p className="text-3xl font-black text-white">{stats.activeDrivers.toLocaleString()}</p>
            </div>

            <div className="bg-[#10131b] border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📦</span>
                <p className="text-sm text-white/60 font-semibold">Orders Today</p>
              </div>
              <p className="text-3xl font-black text-white">{stats.ordersToday.toLocaleString()}</p>
            </div>

            <div className="bg-[#10131b] border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">💵</span>
                <p className="text-sm text-white/60 font-semibold">Revenue (Today)</p>
              </div>
              <p className="text-3xl font-black text-white">${stats.revenueToday.toLocaleString()}</p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            <Link href="/admin/cost-management" className="bg-[#10131b] border border-white/10 rounded-lg p-6 hover:border-[#e8a230]/50 transition-colors group">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💰</span>
                <p className="text-lg font-bold text-white">Cost Management</p>
              </div>
              <p className="text-sm text-white/60 mb-4">
                Track spending across all services (AWS, Google Cloud, Stripe, Supabase, Mailbox, Resend, Vonage)
              </p>
              <p className="text-sm text-[#e8a230] font-bold group-hover:translate-x-1 transition-transform inline-block">
                View Dashboard →
              </p>
            </Link>

            <Link href="/admin/analytics" className="bg-[#10131b] border border-white/10 rounded-lg p-6 hover:border-[#e8a230]/50 transition-colors group">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📊</span>
                <p className="text-lg font-bold text-white">Analytics</p>
              </div>
              <p className="text-sm text-white/60 mb-4">
                Real-time metrics on orders, drivers, merchants, and platform health
              </p>
              <p className="text-sm text-[#e8a230] font-bold group-hover:translate-x-1 transition-transform inline-block">
                View Analytics →
              </p>
            </Link>

            <Link href="/admin/users" className="bg-[#10131b] border border-white/10 rounded-lg p-6 hover:border-[#e8a230]/50 transition-colors group">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">👥</span>
                <p className="text-lg font-bold text-white">User Management</p>
              </div>
              <p className="text-sm text-white/60 mb-4">
                Manage drivers, merchants, and customer accounts
              </p>
              <p className="text-sm text-[#e8a230] font-bold group-hover:translate-x-1 transition-transform inline-block">
                Manage Users →
              </p>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#10131b] border border-white/10 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-white/50 text-sm">No recent activity</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
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
