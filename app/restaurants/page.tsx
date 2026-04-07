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
      const { data, error } = await supabase
        .from('Restaurant')
        .select(`
            *,
            menuItems:MenuItem(id)
        `)
        .eq('visibility', 'VISIBLE');
      
      if (!error && data) {
        setRestaurants(data);
      }
      setLoading(false);
    }
    fetchRestaurants();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0d12] text-[#c8d8e8] font-['Nunito',sans-serif] selection:bg-[#e8a020]/30 selection:text-white relative">
      
      {/* TOPBAR */}
      <div className="topbar bg-[#10151e] border-b border-[#1e2c3a] px-8 md:px-12 flex justify-between items-center h-[68px] sticky top-0 z-50 shadow-[0_2px_16px_rgba(0,0,0,0.4)]">
        <Logo size="sm" />
        <div className="hidden md:flex items-center gap-6">
          <div className="text-[13px] font-bold text-[#7a90a8]">
            {address || "Locating nearest sector..."}
          </div>
          <div className="live-pill flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-1.5 text-[12px] font-bold text-[#22c55e]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse shadow-[0_0_6px_#22c55e]"></span> 
            Network Live
          </div>
        </div>
      </div>

      <main className="max-w-[1100px] mx-auto px-6 md:px-10 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 md:gap-14 items-start">
        
        <div className="left-col flex flex-col gap-6 md:gap-10">
          
          {/* HERO / HEADER */}
          <div className="bg-gradient-to-br from-[#0d1520] to-[#13200d] border border-[#1e2c3a] rounded-[24px] p-10 md:p-14 relative overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.5)] group">
             <div className="absolute right-10 top-10 text-9xl opacity-[0.03] transform rotate-12 pointer-events-none">🍴</div>
             <div className="inline-flex items-center gap-2 bg-[#e8a020]/10 border border-[#e8a020]/30 rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] text-[#e8a020] mb-8">
               🛡️ Operational Sectors
             </div>
             <h1 className="font-['Barlow_Condensed',sans-serif] text-[72px] md:text-[84px] font-extrabold italic uppercase leading-[0.9] tracking-tight mb-4">
                AVAILABLE<br /><span className="text-[#e8a020]">NOW.</span>
             </h1>
             <p className="text-[15px] font-semibold text-[#7a90a8] max-w-[340px] leading-relaxed">
               Verified restaurants in your current sector are ready for extraction. Select a node to initialize payload sequence.
             </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-[22px] font-black text-white italic uppercase tracking-tight">Verified Nodes</div>
              <div className="bg-[#e8a020]/10 border border-[#9b6a14] text-[#e8a020] text-[12px] font-black px-4 py-1.5 rounded-full uppercase italic tracking-widest">
                {restaurants.length} Total
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-6 opacity-40">
                <div className="w-12 h-12 border-4 border-[#e8a020]/20 border-t-[#e8a020] rounded-full animate-spin"></div>
                <div className="text-[12px] font-black uppercase tracking-[0.3em] text-[#e8a020]">Scanning Grid...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {restaurants.map(r => (
                  <Link key={r.id} href={`/restaurants/${r.id}`} className="bg-[#10151e] border border-[#1e2c3a] rounded-[18px] p-5 flex items-center gap-5 cursor-pointer hover:border-[#9b6a14] hover:shadow-[0_8px_30px_rgba(232,160,32,0.05)] transition-all group no-underline">
                    <div className="w-[60px] h-[60px] bg-[#161d2a] border border-[#1e2c3a] rounded-xl flex items-center justify-center text-[32px] flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden relative">
                      {r.imageUrl ? (
                        <img src={r.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt={r.name} />
                      ) : (
                        <span>🍴</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[18px] font-extrabold text-white truncate">{r.name}</div>
                      <div className="text-[13px] font-semibold text-[#7a90a8] truncate">{(r.menuItems || []).length} Menu Items · {r.city || "Local Sector"}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <div className="bg-green-500/10 border border-green-500/30 text-[#22c55e] text-[10px] font-black px-2.5 py-1 rounded-full uppercase italic tracking-tighter flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse"></span>
                        Live
                      </div>
                      <div className="font-['Barlow_Condensed',sans-serif] text-[24px] font-extrabold italic text-[#e8a020] leading-none">
                        {r.rating || "4.9"} ★
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="right-col flex flex-col gap-6">
           <div className="bg-[#10151e] border border-[#1e2c3a] rounded-[20px] p-8 shadow-lg">
              <div className="text-[18px] font-extrabold text-white mb-6 flex justify-between items-center">
                Sector Intelligence
                <span className="text-[10px] bg-[#1e2c3a] px-2 py-1 rounded">V.1</span>
              </div>
              
              <div className="flex flex-col gap-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#161d2a] border border-[#1e2c3a] flex items-center justify-center text-xl">🛰️</div>
                    <div>
                       <div className="text-[11px] font-black text-[#3a5060] uppercase tracking-widest mb-1">Grid Location</div>
                       <div className="text-[14px] font-bold text-white truncate max-w-[200px]">{address || "Universal"}</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#161d2a] border border-[#1e2c3a] flex items-center justify-center text-xl">⚡</div>
                    <div>
                       <div className="text-[11px] font-black text-[#3a5060] uppercase tracking-widest mb-1">Extraction Speed</div>
                       <div className="text-[14px] font-bold text-white">Under 24 Mins</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#161d2a] border border-[#1e2c3a] flex items-center justify-center text-xl">🛡️</div>
                    <div>
                       <div className="text-[11px] font-black text-[#3a5060] uppercase tracking-widest mb-1">Node Security</div>
                       <div className="text-[14px] font-bold text-white">Fully Verified</div>
                    </div>
                 </div>
              </div>
              
              <button className="w-full mt-8 bg-[#e8a020] text-[#0a0d12] font-['Barlow_Condensed',sans-serif] text-[20px] font-black italic tracking-widest py-4 rounded-xl shadow-[0_4px_20px_rgba(232,160,32,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all uppercase">
                 REFRESH SECTOR SCAN
              </button>
           </div>
           
           <div className="bg-gradient-to-br from-[#161d2a] to-[#0a0d12] border border-[#1e2c3a] rounded-[20px] p-8">
              <div className="text-[11px] font-black text-[#e8a020] uppercase tracking-[0.2em] mb-3">Partner Extraction</div>
              <h3 className="text-[20px] font-extrabold text-white leading-tight mb-4">Own a restaurant in this sector?</h3>
              <p className="text-[13px] font-semibold text-[#7a90a8] mb-6 leading-relaxed">
                 Stop losing margins to massive extraction platforms. Join the TrueServe independent node network.
              </p>
              <Link href="/merchant/signup" className="text-[12px] font-black uppercase tracking-widest text-[#e8a020] hover:translate-x-2 transition-transform inline-flex items-center gap-2 no-underline">
                 Establish Your Node <span>→</span>
              </Link>
           </div>
        </div>

      </main>

      <footer className="mt-20 py-16 border-t border-[#1e2c3a] opacity-30 text-center">
         <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#3a5060] italic">
            TrueServe // Tactical Logistics Terminal
         </div>
      </footer>
    </div>
  );
}

export default function RestaurantFinder() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-[#0c0e13] flex items-center justify-center">
             <div className="text-[#e8a230] font-bebas italic text-4xl uppercase tracking-[0.4em] animate-pulse shadow-glow">
                Linking To Hive...
             </div>
        </div>
    }>
      <RestaurantFinderContent />
    </Suspense>
  );
}
