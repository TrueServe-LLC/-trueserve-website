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
      // Filter for those specifically requested to show for pilot
      const { data, error } = await supabase
        .from('Restaurant')
        .select('*')
        .or('name.ilike.%Dhan%,name.ilike.%Krave%');
      
      if (!error && data) {
        setRestaurants(data);
      }
      setLoading(false);
    }
    fetchRestaurants();
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0e13] text-white">
      <nav>
        <Logo size="sm" />
      </nav>

      <main id="view-restaurants" className="active">
        <div className="rest-top">
          <Link href="/" className="back" style={{ marginBottom: '16px' }}>← Back </Link>
          <h2>Available Now</h2>
          <p className="lead">Showing infrastructure partners in your sector: <span className="text-[#e8a230] font-bold">{address || "All Sectors"}</span></p>
          
          <div className="rest-filters">
            <button className="on">All</button>
            <button>Fast Feedback</button>
            <button>Elite Fleet</button>
          </div>
        </div>

        {loading ? (
             <div className="text-center py-20 opacity-50 font-bold text-[#e8a230] animate-pulse">Connecting to Hive...</div>
        ) : (
            <div className="rest-grid">
              {restaurants.map(r => {
                const hasGHL = r.name.toLowerCase().includes('dhan') || r.ghlUrl;
                return (
                  <Link key={r.id} href={`/restaurants/${r.id}`} className="rest-card">
                    <div className="rc-img" style={{ backgroundImage: `url('${r.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80'}')` }}>
                      <div className="rc-badge">Pilot Partner</div>
                      {hasGHL && (
                          <div style={{ position:'absolute', bottom:10, right:10, background:'var(--gold)', color:'#000', padding:'4px 8px', borderRadius:5, fontSize:9, fontWeight:900, display:'flex', alignItems:'center', gap:4 }}>
                              🤖 AI ASSISTANT ACTIVE
                          </div>
                      )}
                    </div>
                    <div className="rc-info">
                      <div className="rc-name">{r.name}</div>
                      <div className="rc-meta">
                        <div className="rc-rating"><span>★</span> {r.rating || '4.9'}</div>
                        <div>•</div>
                        <div>18-24 mins</div>
                        <div>•</div>
                        <div>{r.city}, {r.state}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {restaurants.length === 0 && (
                  <div className="col-span-full text-center py-20 opacity-50">Zero restaurants found. Onboarding in progress...</div>
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
