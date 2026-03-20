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
        // Order Stats
        const total = filteredOrders.length;
        const cancelled = filteredOrders.filter(o => o.status === 'CANCELLED' || o.isRefunded).length;
        const completed = filteredOrders.filter(o => o.status === 'COMPLETED' || o.deliveredAt).length;
        
        // On-time Delivery
        const deliveredOrders = filteredOrders.filter(o => o.deliveredAt && o.estimatedETA);
        const onTimeCount = deliveredOrders.filter(o => new Date(o.deliveredAt) <= new Date(o.estimatedETA)).length;
        const onTimeRate = deliveredOrders.length > 0 ? (onTimeCount / deliveredOrders.length) * 100 : 100;

        // Prep-to-Pickup
        const pickedUpOrders = filteredOrders.filter(o => o.pickedUpAt && o.prepTimeEnd);
        const totalPrepToPickup = pickedUpOrders.reduce((acc, o) => {
            return acc + (new Date(o.pickedUpAt).getTime() - new Date(o.prepTimeEnd).getTime());
        }, 0);
        const avgPrepToPickup = pickedUpOrders.length > 0 ? (totalPrepToPickup / pickedUpOrders.length) / 60000 : 0; // in minutes

        // Revenue / Cost
        const totalPay = filteredOrders.reduce((acc, o) => acc + (Number(orderTotalPay(o)) || 0), 0);
        const Revenue = filteredOrders.reduce((acc, o) => acc + (Number(o.totalAmount || o.total) || 0), 0);

        // Merchant Stats
        const activeMerchants = restaurants.filter(r => r.isApproved).length;
        
        // Driver Stats
        const activeDrivers = drivers.filter(d => d.status === 'ONLINE').length;
        const approvedDrivers = drivers.filter(d => d.backgroundCheckStatus === 'CLEARED' && d.hasSignedAgreement).length;

        return {
            total,
            cancelRate: total > 0 ? (cancelled / total) * 100 : 0,
            onTimeRate,
            avgPrepToPickup: avgPrepToPickup.toFixed(1),
            totalRevenue: Revenue.toFixed(2),
            activeDrivers,
            totalMerchants: restaurants.length,
            activeMerchants,
            totalDrivers: drivers.length,
            approvedDrivers
        };
    }, [filteredOrders, drivers, restaurants]);

    function orderTotalPay(order: any) {
        return order.totalPay || (Number(order.basePay || 0) + Number(order.boostPay || 0));
    }

    const exportToCSV = () => {
        const headers = ['ID', 'Date', 'Status', 'Total', 'Driver Pay', 'Prep Time (min)', 'Pickup Time', 'Delivery Time'];
        const rows = filteredOrders.map(o => [
            o.id,
            new Date(o.createdAt).toLocaleString(),
            o.status,
            o.totalAmount || o.total,
            orderTotalPay(o),
            o.prepTimeEnd ? Math.round((new Date(o.prepTimeEnd).getTime() - new Date(o.prepTimeStart || o.createdAt).getTime()) / 60000) : 'N/A',
            o.pickedUpAt ? new Date(o.pickedUpAt).toLocaleTimeString() : 'N/A',
            o.deliveredAt ? new Date(o.deliveredAt).toLocaleTimeString() : 'N/A'
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `trueserve_kpi_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <section className="mb-16">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">KPI Dashboard (V1)</h2>
                <div className="flex items-center gap-4">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        {(['24h', '7d', '30d', 'all'] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setTimeRange(r)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                    timeRange === r ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'
                                }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard title="Order Volume" value={stats.total} subtext="Total Orders" color="primary" />
                <KPICard title="Platform Revenue" value={`$${stats.totalRevenue}`} subtext="Total Order Volume" color="emerald" />
                <KPICard title="Cancel Rate" value={`${stats.cancelRate.toFixed(1)}%`} subtext="Refunds/Cancellations" color="red" />
                <KPICard title="Prep-to-Pickup" value={`${stats.avgPrepToPickup}m`} subtext="Avg Dispatch Speed" color="blue" />
                
                <KPICard title="Merchants" value={stats.totalMerchants} subtext={`${stats.activeMerchants} Approved & Active`} color="yellow" />
                <KPICard title="Driver Pilots" value={stats.totalDrivers} subtext={`${stats.approvedDrivers} Approved Signups`} color="purple" />
                <KPICard title="Active Fleet" value={stats.activeDrivers} subtext="Drivers Currently Online" color="orange" />
                <KPICard title="On-Time Rate" value={`${stats.onTimeRate.toFixed(1)}%`} subtext="vs Estimated ETA" color="pink" />
            </div>
        </section>
    );
}

function KPICard({ title, value, subtext, color }: { title: string, value: string | number, subtext: string, color: string }) {
    const colorClasses: Record<string, string> = {
        primary: 'group-hover:text-primary bg-primary/10',
        red: 'group-hover:text-red-400 bg-red-500/10',
        emerald: 'group-hover:text-emerald-400 bg-emerald-500/10',
        blue: 'group-hover:text-blue-400 bg-blue-500/10',
        yellow: 'group-hover:text-yellow-400 bg-yellow-500/10',
        purple: 'group-hover:text-purple-400 bg-purple-500/10',
        orange: 'group-hover:text-orange-400 bg-orange-500/10',
        pink: 'group-hover:text-pink-400 bg-pink-500/10',
    };

    return (
        <div className="card p-6 bg-white/5 border-white/10 hover:border-white/20 transition-all group relative overflow-hidden">
            <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all ${colorClasses[color].split(' ')[1]}`}></div>
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1 transition-colors">{title}</p>
            <p className="text-4xl font-bold mb-1 tracking-tighter">{value}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase">{subtext}</p>
        </div>
    );
}

