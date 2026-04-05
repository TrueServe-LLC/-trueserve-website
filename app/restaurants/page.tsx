"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";

function RestaurantFinderContent() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRestaurants() {
      // Fetch all approved restaurants with their menu item counts
      const { data, error } = await supabase
        .from('Restaurant')
        .select('*, menuItems:MenuItem(id)')
        .eq('isApproved', true);
      
      if (!error && data) {
        setRestaurants(data);
      }
      setLoading(false);
    }
    fetchRestaurants();
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0e13] text-white font-['Rajdhani',_sans-serif]">
      <nav className="p-6 border-b border-white/5 flex justify-between items-center backdrop-blur-xl sticky top-0 z-50 bg-[#0c0e13]/80">
        <Logo size="sm" />
        <div className="flex gap-4">
            <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Network Live</span>
            </div>
        </div>
      </nav>

      <main id="view-restaurants" className="p-8 max-w-7xl mx-auto">
        <div className="mb-12">
          <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors mb-4 inline-block">← Return to Perimeter</Link>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white leading-none mb-2">Available <span className="text-primary italic">Now.</span></h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Sector Intelligence: <span className="text-primary">{address || "Universal Access"}</span></p>
          
          <div className="flex gap-2 mt-8">
            <button className="px-6 py-2 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20">All Channels</button>
            <button className="px-6 py-2 bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/5 hover:text-white transition-all">Fast Pickup</button>
            <button className="px-6 py-2 bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/5 hover:text-white transition-all">Elite Verified</button>
          </div>
        </div>

        {loading ? (
             <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-50">
                <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <div className="font-black text-primary uppercase tracking-[0.3em] text-[10px] animate-pulse">Connecting to Hive Terminal...</div>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map(r => {
                const itemCount = (r.menuItems || []).length;
                return (
                  <Link key={r.id} href={`/restaurants/${r.id}`} className="group relative bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:shadow-2xl hover:shadow-primary/5">
                    <div className="relative h-64">
                         <img 
                            src={r.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80'} 
                            alt={r.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e13] via-transparent to-transparent"></div>
                         <div className="absolute top-6 left-6 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-[#e8a230] italic">
                            Elite Partner
                         </div>
                         <div className="absolute bottom-6 left-6 right-6">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-3xl font-black italic uppercase tracking-tight text-white leading-none">{r.name}</h3>
                                {r.isBusy && <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded font-black text-[8px] uppercase">Paused</span>}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span className="text-[#e8a230]">★ {r.rating || '4.9'}</span>
                                <span className="opacity-20">|</span>
                                <span>{itemCount} Assets Available</span>
                                <span className="opacity-20">|</span>
                                <span>{r.city}</span>
                            </div>
                         </div>
                    </div>
                  </Link>
                );
              })}
              {restaurants.length === 0 && (
                  <div className="col-span-full text-center py-40 bg-white/2 border border-white/5 border-dashed rounded-[3rem]">
                    <div className="text-4xl mb-6 opacity-20">📡</div>
                    <p className="bebas text-2xl italic tracking-widest text-white/20 uppercase">No active nodes detected in this coordinate</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#222] mt-2 italic">Onboarding protocols in progress...</p>
                  </div>
              )}
            </div>
        )}
      </main>
    </div>
  );
}

export default function RestaurantFinder() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0c0e13] flex items-center justify-center text-[#e8a230] font-bold">Connecting to Hive...</div>}>
      <RestaurantFinderContent />
    </Suspense>
  );
}
