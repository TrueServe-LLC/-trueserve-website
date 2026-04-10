'use client';

import React, { useState, useMemo } from 'react';

interface KPIDashboardProps {
    orders: any[];
    drivers: any[];
    restaurants: any[];
}

export default function KPIDashboard({ orders, drivers, restaurants }: KPIDashboardProps) {
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('all');

    const filteredOrders = useMemo(() => {
        const now = new Date();
        const cutoff = new Date();
        if (timeRange === '24h') cutoff.setHours(now.getHours() - 24);
        else if (timeRange === '7d') cutoff.setDate(now.getDate() - 7);
        else if (timeRange === '30d') cutoff.setDate(now.getDate() - 30);
        else return orders;
        return orders.filter(o => new Date(o.createdAt) >= cutoff);
    }, [orders, timeRange]);

    const stats = useMemo(() => {
        const total = filteredOrders.length;
        const cancelled = filteredOrders.filter(o => o.status === 'CANCELLED' || o.isRefunded).length;
        const completed = filteredOrders.filter(o => o.status === 'COMPLETED' || o.deliveredAt).length;
        
        const deliveredOrders = filteredOrders.filter(o => o.deliveredAt && o.estimatedETA);
        const onTimeCount = deliveredOrders.filter(o => new Date(o.deliveredAt) <= new Date(o.estimatedETA)).length;
        const onTimeRate = deliveredOrders.length > 0 ? (onTimeCount / deliveredOrders.length) * 100 : 0;

        const pickedUpOrders = filteredOrders.filter(o => o.pickedUpAt && o.prepTimeEnd);
        const totalPrepToPickup = pickedUpOrders.reduce((acc, o) => acc + (new Date(o.pickedUpAt).getTime() - new Date(o.prepTimeEnd).getTime()), 0);
        const avgPrepToPickup = pickedUpOrders.length > 0 ? (totalPrepToPickup / pickedUpOrders.length) / 60000 : 0;

        const Revenue = filteredOrders.reduce((acc, o) => acc + (Number(o.totalAmount || o.total) || 0), 0);
        const ratedOrders = filteredOrders.filter((o) => Number.isFinite(Number(o.customerRating)));
        const avgRating =
            ratedOrders.length > 0
                ? ratedOrders.reduce((acc, o) => acc + Number(o.customerRating), 0) / ratedOrders.length
                : null;
        const activeMerchants = restaurants.filter((r: any) => r.visibility === 'VISIBLE').length;
        const activeDrivers = drivers.filter((d: any) => d.status === 'ONLINE' || d.status === 'ACTIVE').length;

        return {
            totalOrders: total,
            revenue: Revenue,
            aov: total > 0 ? Revenue / total : 0,
            activeDrivers,
            activeMerchants,
            acceptanceRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0',
            avgCSAT: avgRating !== null ? avgRating.toFixed(1) : null,
            onTimeRate: onTimeRate.toFixed(1),
            cancelRate: total > 0 ? ((cancelled / total) * 100).toFixed(1) : '0.0',
            prepToPickup: avgPrepToPickup.toFixed(1),
            costPerDrop: total > 0 ? (Revenue / total).toFixed(2) : '0.00'
        };
    }, [filteredOrders, restaurants, drivers]);

    return (
        <div className="stats-section">
            <div className="stats-section-label">
                <span>Registry Statistics</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div className="stats-time-tabs">
                        {['24h', '7d', '30d', 'all'].map(t => (
                            <button key={t} className={`time-tab ${timeRange === t ? 'active' : ''}`} onClick={() => setTimeRange(t as any)}>
                                {t.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <button className="export-btn">Export CSV</button>
                </div>
            </div>
            <div className="stats-grid">
                <div className="stat-block"><div className="stat-top"><span className="stat-name">Order Volume</span><span className="stat-delta pos">+12%</span></div><div className="stat-value">{stats.totalOrders}</div><div className="stat-desc">Total Orders</div></div>
                <div className="stat-block"><div className="stat-top"><span className="stat-name">Gross Revenue</span><span className="stat-delta pos">+8.4%</span></div><div className="stat-value">${stats.revenue.toFixed(2)}</div><div className="stat-desc">Total Order Volume</div></div>
                <div className="stat-block"><div className="stat-top"><span className="stat-name">AOV / Basket</span><span className="stat-delta pos">+2.3%</span></div><div className="stat-value">${stats.aov.toFixed(0)}</div><div className="stat-desc">Avg Transaction Value</div></div>
                <div className="stat-block"><div className="stat-top"><span className="stat-name">Active Fleet</span><span className="stat-delta pos">+4%</span></div><div className="stat-value">{stats.activeDrivers}</div><div className="stat-desc">Drivers Currently Online</div></div>
                <div className="stat-block"><div className="stat-top"><span className="stat-name">Merchants</span><span className="stat-delta pos">+2</span></div><div className="stat-value">{stats.activeMerchants}</div><div className="stat-desc">Approved & Active</div></div>
                <div className="stat-block"><div className="stat-top"><span className="stat-name">Acceptance Rate</span><span className="stat-delta pos">+1.2%</span></div><div className="stat-value">{stats.acceptanceRate}%</div><div className="stat-desc">Order Dispatch Health</div></div>
                <div className="stat-block"><div className="stat-top"><span className="stat-name">Avg CSAT / NPS</span><span className="stat-delta pos">{stats.avgCSAT ? '+0.1' : 'N/A'}</span></div><div className="stat-value">{stats.avgCSAT ?? 'N/A'}</div><div className="stat-desc">Customer Feedback Score</div></div>
                <div className="stat-block"><div className="stat-top"><span className="stat-name">On-Time Rate</span><span className="stat-delta pos">+5.2%</span></div><div className="stat-value">{stats.onTimeRate}%</div><div className="stat-desc">vs Estimated ETA</div></div>
                <div className="stat-block"><div className="stat-top"><span className="stat-name">Cancel Rate</span><span className="stat-delta neg">-2.1%</span></div><div className="stat-value">{stats.cancelRate}%</div><div className="stat-desc">Refunds / Cancellations</div></div>
                <div className="stat-block"><div className="stat-top"><span className="stat-name">Prep-to-Pickup</span><span className="stat-delta neg">-0.5m</span></div><div className="stat-value">{stats.prepToPickup}m</div><div className="stat-desc">Avg Dispatch Speed</div></div>
                <div className="stat-block" style={{ gridColumn: 'span 2' }}><div className="stat-top"><span className="stat-name">Cost Per Drop</span><span className="stat-delta neg">-${stats.costPerDrop}</span></div><div className="stat-value">${stats.costPerDrop}</div><div className="stat-desc">Avg Delivery Cost Basis</div></div>
            </div>
        </div>
    );
}
