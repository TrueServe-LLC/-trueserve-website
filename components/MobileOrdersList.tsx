'use client';

import Link from 'next/link';
import ProfileAvatar from '@/components/ProfileAvatar';
import Logo from '@/components/Logo';

export default function MobileOrdersList({ user, orders }: any) {
    const activeOrders = orders.filter((o: any) => ['PENDING', 'PREPARING', 'READY', 'READY_FOR_PICKUP', 'PICKED_UP'].includes(o.status));
    const pastOrders = orders.filter((o: any) => ['DELIVERED', 'CANCELLED'].includes(o.status));
    const totalSpent = orders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

    return (
        <div className="lg:hidden noise-overlay font-dm-sans min-h-screen bg-[#0c0e13] flex flex-col">
            
            {/* LOGO HEADER */}
            <div className="flex items-center justify-between px-5 pt-8 pb-4">
                <Logo size="sm" />
                <div className="w-8 h-8 rounded-full bg-[#131720] border border-[#2a2f3a] flex items-center justify-center">
                    <span className="text-xs">📜</span>
                </div>
            </div>

            {/* ORDERS TOP */}
            <div className="px-5 pt-8 pb-7 flex flex-col items-center border-b border-[#1c1f28]">
                <div className="w-20 h-20 bg-[#131720] border border-[#2a2f3a] rounded-[28px] p-1 flex items-center justify-center relative shadow-2xl mb-5">
                    <ProfileAvatar 
                        userId={user.id} 
                        initialName={user.name || ""} 
                        initialColor={user.avatarColor || "#E8A230"} 
                        initialUrl={user.avatarUrl} 
                        className="w-full h-full object-cover rounded-[24px]"
                    />
                </div>
                <h1 className="font-barlow-cond text-3xl font-extrabold italic uppercase text-white leading-none mb-1.5">Sector History</h1>
                <div className="text-[10px] font-bold text-[#555] uppercase tracking-[.25em]">Telemetry & Deployment Logs</div>
            </div>

            <div className="flex-1 overflow-y-auto pb-32">
                {/* GLOBAL STATS */}
                <div className="flex gap-2.5 px-5 pt-6 mb-8">
                    <div className="flex-1 bg-[#131720] border border-[#1c1f28] p-4 rounded-[20px] text-center">
                        <div className="text-[14px] font-bold text-white mb-0.5">{orders.length}</div>
                        <div className="text-[9px] font-bold text-[#e8a230] uppercase tracking-widest">Total Orders</div>
                    </div>
                    <div className="flex-1 bg-[#131720] border border-[#1c1f28] p-4 rounded-[20px] text-center">
                        <div className="text-[14px] font-bold text-white mb-0.5">${totalSpent.toFixed(2)}</div>
                        <div className="text-[9px] font-bold text-[#3dd68c] uppercase tracking-widest">Global yield</div>
                    </div>
                </div>

                {/* ACTIVE MISSIONS */}
                {activeOrders.length > 0 && (
                    <div className="px-5 mb-8">
                        <div className="text-[11px] font-bold text-[#3dd68c] uppercase tracking-widest mb-4 px-1 animate-pulse">● Active Deployments</div>
                        <div className="space-y-3">
                            {activeOrders.map((o: any, i: number) => (
                                <Link href={`/orders/${o.id}`} key={i} className="flex bg-[#0a1a12] border border-[#3dd68c]/20 p-4.5 rounded-[24px] active:scale-[0.98] transition-all">
                                    <div className="w-12 h-12 bg-[#13271b] border border-[#3dd68c]/24 rounded-[16px] flex items-center justify-center text-[18px]">🛸</div>
                                    <div className="flex-1 px-4">
                                        <div className="text-[15px] font-bold text-white leading-tight uppercase font-barlow-cond italic">{o.restaurant?.name || 'Kitchen'}</div>
                                        <div className="text-[10px] text-[#3dd68c] font-black uppercase tracking-widest mt-1 italic">{o.status.replace('_', ' ')}</div>
                                    </div>
                                    <div className="flex flex-col items-end justify-center">
                                        <div className="text-[15px] font-bold text-white font-dm-mono">${Number(o.total || 0).toFixed(2)}</div>
                                        <div className="text-[12px] text-[#555]">›</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* ARCHIVE */}
                <div className="px-5">
                    <div className="text-[11px] font-bold text-[#555] uppercase tracking-widest mb-4 px-1">Transmission Archive</div>
                    <div className="space-y-2">
                        {pastOrders.length === 0 ? (
                            <div className="py-12 border border-dashed border-[#1c1f28] rounded-[24px] text-center opacity-30">
                                <div className="text-[11px] font-bold uppercase tracking-widest">No prior transmissions detected</div>
                            </div>
                        ) : (
                            pastOrders.map((o: any, i: number) => (
                                <Link href={`/orders/${o.id}`} key={i} className="flex items-center bg-[#0f1219] p-4.5 rounded-[24px] border border-[#1c1f28] active:scale-[0.98] transition-all">
                                    <div className="w-11 h-11 bg-[#131720] border border-[#1c1f28] rounded-[14px] flex items-center justify-center text-[18px] grayscale opacity-40">📦</div>
                                    <div className="flex-1 px-4">
                                        <div className="text-[14px] font-bold text-[#ddd] leading-tight font-barlow-cond uppercase italic">{o.restaurant?.name || 'Kitchen'}</div>
                                        <div className="text-[10px] text-[#444] font-bold mt-1 uppercase tracking-widest">{new Date(o.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div className="flex flex-col items-end justify-center">
                                        <div className="text-[14px] font-bold text-[#ddd] font-dm-mono">${Number(o.total || 0).toFixed(2)}</div>
                                        <div className="text-[10px] text-[#e24b4a] font-bold uppercase tracking-widest mt-0.5">{o.status}</div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
            
            <div className="auth-link py-6 text-center border-t border-[#1c1f28]">
                <Link href="/hub" className="text-[#3dd68c] font-black uppercase text-[10px] tracking-[.3em] italic">Back to Operational Hub</Link>
            </div>
        </div>
    );
}
