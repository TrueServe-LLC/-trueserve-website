'use client';

import { useState } from 'react';
import Link from 'next/link';
import PickupPhotoForm from './PickupPhotoForm';
import CompleteDeliveryForm from './CompleteDeliveryForm';
import Logo from '@/components/Logo';

export default function MobileDriverDashboard({ driver, stats, myActiveOrders, availableOrders }: any) {
    const [isOnline, setIsOnline] = useState(true);

    return (
        <div className="lg:hidden noise-overlay font-dm-sans min-h-screen bg-[#0c0e13] flex flex-col">
            
            {/* DRIVER HERO */}
            <div className="h-[200px] bg-gradient-to-br from-[#0a1a12] via-[#0c0e13] to-[#0c0e13] relative flex flex-col items-center justify-center border-b border-[#1c1f28]">
                <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <Logo size="sm" />
                        <div className="bg-[#3dd68c]/15 text-[#3dd68c] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-[#3dd68c]/24">Fleet ID</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#131720] border border-[#2a2f3a] flex items-center justify-center">
                         <span className="text-xs">👤</span>
                    </div>
                </div>

                <div className="text-center mt-4">
                    <div className="text-[42px] font-bold text-white font-dm-mono leading-none tracking-tighter">
                        <span className="text-[#3dd68c] text-[24px] mr-1">$</span>{stats.totalEarnings.toFixed(2)}
                    </div>
                    <div className="text-[10px] font-bold text-[#555] uppercase tracking-[.2em] mt-1.5">Total Revenue Yield</div>
                </div>
            </div>

            {/* STATUS BAR */}
            <div className="px-5 py-4 bg-[#0f1219] border-b border-[#1c1f28] flex items-center justify-between">
                <div className="text-[12px] font-bold text-[#555] uppercase tracking-widest">{isOnline ? 'Reporting for Duty' : 'Awaiting Orders'}</div>
                <div 
                    className={`w-12 h-6.5 rounded-full p-1 relative cursor-pointer transition-colors ${isOnline ? 'bg-[#3dd68c]' : 'bg-[#1c1f28]'}`}
                    onClick={() => setIsOnline(!isOnline)}
                >
                    <div className={`w-4.5 h-4.5 bg-white rounded-full transition-transform ${isOnline ? 'translate-x-5.5' : 'translate-x-0'}`} />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-32">
                {/* STATS ROW */}
                <div className="grid grid-cols-4 gap-px bg-[#1c1f28] border-b border-[#1c1f28]">
                    <div className="bg-[#0c0e13] py-4.5 text-center">
                        <div className="text-[18px] font-bold text-white font-dm-mono mb-0.5">{myActiveOrders.length}</div>
                        <div className="text-[8px] font-bold text-[#444] uppercase tracking-widest">Active</div>
                    </div>
                    <div className="bg-[#0c0e13] py-4.5 text-center">
                        <div className="text-[18px] font-bold text-[#3dd68c] font-dm-mono mb-0.5">{stats.trips}</div>
                        <div className="text-[8px] font-bold text-[#444] uppercase tracking-widest">Complete</div>
                    </div>
                    <div className="bg-[#0c0e13] py-4.5 text-center">
                        <div className="text-[18px] font-bold text-white font-dm-mono mb-0.5">1.4k</div>
                        <div className="text-[8px] font-bold text-[#444] uppercase tracking-widest">Total</div>
                    </div>
                    <div className="bg-[#0c0e13] py-4.5 text-center">
                        <div className="text-[18px] font-bold text-[#e8a230] font-dm-mono mb-0.5">{stats.rating.toFixed(1)}</div>
                        <div className="text-[8px] font-bold text-[#444] uppercase tracking-widest">Rating</div>
                    </div>
                </div>

                {/* ACTIVE MISSIONS */}
                <div className="px-5 pt-8">
                    <div className="text-[10px] font-bold text-[#555] uppercase tracking-[.15em] mb-4">Active Mission Control</div>
                    {myActiveOrders.length === 0 ? (
                        <div className="bg-[#0f1219] border border-[#1c1f28] rounded-[24px] p-10 text-center">
                            <div className="text-4xl mb-3">📡</div>
                            <div className="text-[14px] font-bold text-white/40 italic uppercase tracking-widest">Scanning for Payloads...</div>
                        </div>
                    ) : (
                        myActiveOrders.map((order: any, i: number) => (
                             <div key={i} className="bg-[#0f1219] border border-[#1c1f28] rounded-[24px] overflow-hidden mb-6">
                                 <div className="p-5 border-b border-[#1c1f28] flex items-center justify-between">
                                     <div>
                                         <div className="text-[10px] font-bold text-[#3dd68c] uppercase tracking-widest mb-1.5 animate-pulse">● In Progress</div>
                                         <h3 className="font-barlow-cond text-2xl font-extrabold italic uppercase text-white leading-none">{order.restaurant?.name}</h3>
                                     </div>
                                     <div className="text-right">
                                         <div className="text-[9px] font-bold text-[#555] uppercase tracking-widest mb-1">Mission ID</div>
                                         <div className="text-[14px] font-bold text-[#e8a230] font-dm-mono">#{order.id.slice(-6).toUpperCase()}</div>
                                     </div>
                                 </div>
                                 <div className="p-5">
                                     {order.status === 'PICKED_UP' ? (
                                         <div className="space-y-4">
                                             <div className="bg-[#0c0e13] p-4 rounded-xl">
                                                 <div className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-1.5">Drop Vector</div>
                                                 <div className="text-[14px] font-bold text-[#ddd] leading-tight mb-1">{order.deliveryAddress}</div>
                                                 {order.customerName && <div className="text-[11px] text-[#3dd68c] font-bold italic">Recipient: {order.customerName}</div>}
                                             </div>
                                             <CompleteDeliveryForm 
                                                 orderId={order.id} 
                                                 customerName={order.customerName || order.customer?.name} 
                                                 deliveryInstructions={order.deliveryInstructions}
                                             />
                                         </div>
                                     ) : (
                                         <div className="space-y-4">
                                             <div className="bg-[#0c0e13] p-4 rounded-xl">
                                                 <div className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-1.5">Origin Station</div>
                                                 <div className="text-[14px] font-bold text-[#ddd] leading-tight">{order.restaurant?.address}</div>
                                             </div>
                                             <PickupPhotoForm orderId={order.id} restaurantName={order.restaurant?.name} />
                                         </div>
                                     )}
                                 </div>
                             </div>
                        ))
                    )}
                </div>

                {/* AVAILABLE OPPORTUNITIES */}
                <div className="px-5 pt-4">
                    <div className="text-[10px] font-bold text-[#555] uppercase tracking-[.15em] mb-4">Localized Opportunities</div>
                    {availableOrders.length === 0 ? (
                        <div className="text-center py-8">
                             <div className="text-[11px] font-bold text-[#333] uppercase tracking-widest">No available payloads in vicinity</div>
                        </div>
                    ) : (
                        availableOrders.map((order: any, i: number) => (
                             <div key={i} className="bg-[#0f1219] border border-[#1c1f28] p-4.5 rounded-[20px] mb-3 flex items-center justify-between">
                                 <div>
                                     <div className="text-[13px] font-bold text-[#ddd] mb-1">{order.restaurant?.name}</div>
                                     <div className="flex gap-2.5">
                                         <div className="text-[10px] font-bold text-[#3dd68c] uppercase tracking-widest">${(order.totalPay || order.total)?.toFixed(2)} Yield</div>
                                         <div className="text-[10px] font-bold text-[#555] uppercase tracking-widest">{(order.distance || 1.2).toFixed(1)} Mi</div>
                                     </div>
                                 </div>
                                 <button className="bg-[#e8a230] text-black text-[12px] font-bold uppercase py-2.5 px-6 rounded-xl active:scale-95 transition-all">Engage</button>
                             </div>
                        ))
                    )}
                </div>
            </div>

            {/* PORTAL TABS */}
            <div className="flex bg-[#0f1219] border-t border-[#1c1f28] pt-2.5 pb-8">
                <div className="flex-1 flex flex-col items-center gap-1 active:opacity-70">
                    <div className="w-5.5 h-5.5 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 8.5l7-6 7 6V17a1 1 0 01-1 1H4a1 1 0 01-1-1z" stroke="#3dd68c" strokeWidth="1.5"/><rect x="7.5" y="12" width="2.5" height="4" rx=".5" stroke="#3dd68c" strokeWidth="1.2"/></svg>
                    </div>
                    <div className="text-[9px] font-bold tracking-[.08em] uppercase text-[#3dd68c]">Terminal</div>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1 opacity-35">
                    <div className="w-5.5 h-5.5 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                    <div className="text-[9px] font-bold tracking-[.08em] uppercase text-[#555]">Missions</div>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1 opacity-35">
                    <div className="w-5.5 h-5.5 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="4" stroke="#888" strokeWidth="1.5"/><path d="M3 19c0-4 3-7 7-7s7 3 7 7" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                    <div className="text-[9px] font-bold tracking-[.08em] uppercase text-[#555]">Fleet ID</div>
                </div>
            </div>
        </div>
    );
}
