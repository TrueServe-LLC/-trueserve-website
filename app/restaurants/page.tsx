"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

function RestaurantFinderContent() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");

  const restaurants = [
    { id: 1, name: "Dhan's Kitchen", rating: 4.9, time: "18 mins", type: "Caribbean", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80" },
    { id: 2, name: "Burgers & Beers", rating: 4.7, time: "22 mins", type: "American", img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80" },
    { id: 3, name: "The Gourmet Bistro", rating: 4.8, time: "25 mins", type: "French", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" }
  ];

  return (
    <div className="min-h-screen bg-[#0c0e13] text-white">
      <nav>
        <Logo size="sm" />
      </nav>

      <main id="view-restaurants" className="active">
        <div className="rest-top">
          <Link href="/" className="back" style={{ marginBottom: '16px' }}>← Back </Link>
          <h2>Restaurants near you</h2>
          <p className="lead">Showing results for <span className="text-[#e8a230] font-bold">{address || "Fayetteville, NC"}</span> sector</p>
          
          <div className="rest-filters">
            <button className="on">All</button>
            <button>Healthy</button>
            <button>Fast Food</button>
            <button>Offers</button>
          </div>
        </div>

        <div className="rest-grid">
          {restaurants.map(r => (
            <Link key={r.id} href={`/restaurants/${r.id}`} className="rest-card">
              <div className="rc-img" style={{ backgroundImage: `url('${r.img}')` }}>
                <div className="rc-badge">Free Delivery</div>
              </div>
              <div className="rc-info">
                <div className="rc-name">{r.name}</div>
                <div className="rc-meta">
                  <div className="rc-rating"><span>★</span> {r.rating}</div>
                  <div>•</div>
                  <div>{r.time}</div>
                  <div>•</div>
                  <div>{r.type}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
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
