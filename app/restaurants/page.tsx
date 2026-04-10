"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import LandingSearch from "@/components/LandingSearch";

function RestaurantFinderContent() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");
  const search = searchParams.get("search");
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const selectedArea = address || search || "your area";
  const hasLocationInput = Boolean((address || search || "").trim() || (latParam && lngParam));
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRestaurants() {
      const TEST_DATA_PATTERN = /\b(mock|test|demo|preview|sandbox|sample|qa|staging|seed)\b/i;
      const EXCLUDED_CITIES = new Set(["mount airy"]);
      const normalizeSearchText = (value: string) =>
        value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
      const isLiveRestaurant = (restaurant: any) => {
        const visibility = typeof restaurant.visibility === "string" ? restaurant.visibility.toUpperCase() : "";
        const searchableText = `${restaurant.name || ""} ${restaurant.address || ""} ${restaurant.city || ""} ${restaurant.description || ""}`;
        const isMock = restaurant.isMock === true;
        const isLikelyTestRecord =
          TEST_DATA_PATTERN.test(searchableText) ||
          searchableText.toLowerCase().includes("(mock)");
        const isExcludedCity = EXCLUDED_CITIES.has(String(restaurant.city || "").trim().toLowerCase());
        const isVisible = !visibility || visibility === "VISIBLE";
        const hasApprovalColumn = Object.prototype.hasOwnProperty.call(restaurant, "isApproved");
        const isApproved = !hasApprovalColumn || restaurant.isApproved !== false;

        return !isMock && !isLikelyTestRecord && !isExcludedCity && isVisible && isApproved;
      };

      const extractStateCode = (value: string) => {
        const match = value.toUpperCase().match(/\b([A-Z]{2})\b/);
        return match ? match[1] : null;
      };

      const targetRaw = (search || address || "").trim();
      const targetLat = latParam ? Number(latParam) : null;
      const targetLng = lngParam ? Number(lngParam) : null;
      const targetSearch = targetRaw.toLowerCase();
      const targetTokens = normalizeSearchText(targetRaw)
        .split(" ")
        .filter((token) => token.length > 2);
      const targetCityToken = normalizeSearchText(targetRaw.split(",")[0] || "");
      const targetState = extractStateCode(targetRaw);
      const shouldFilterByLocation = Boolean(targetRaw || (targetLat !== null && targetLng !== null));

      const { data, error } = await supabase
        .from('Restaurant')
        .select('*');
      
      if (!error && data) {
        const liveRestaurants = data.filter(isLiveRestaurant);

        const withDistance = liveRestaurants.map((restaurant: any) => {
          const hasCoords = typeof restaurant.lat === "number" && typeof restaurant.lng === "number";
          let distanceMiles: number | null = null;

          if (targetLat !== null && targetLng !== null && hasCoords) {
            const toRad = (value: number) => (value * Math.PI) / 180;
            const earthMiles = 3958.8;
            const dLat = toRad(restaurant.lat - targetLat);
            const dLng = toRad(restaurant.lng - targetLng);
            const a =
              Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(targetLat)) * Math.cos(toRad(restaurant.lat)) * Math.sin(dLng / 2) ** 2;
            distanceMiles = 2 * earthMiles * Math.asin(Math.sqrt(a));
          }

          return { ...restaurant, distanceMiles };
        });

        const filtered = withDistance
          .filter((restaurant: any) => {
            if (!shouldFilterByLocation) return false;

            if (targetLat !== null && targetLng !== null && restaurant.distanceMiles !== null) {
              return restaurant.distanceMiles <= 20;
            }

            if (targetState && (restaurant.state || "").toUpperCase() !== targetState) {
              return false;
            }

            if (!targetSearch) return true;

            const haystack = `${restaurant.name || ""} ${restaurant.city || ""} ${restaurant.state || ""} ${restaurant.address || ""}`.toLowerCase();
            const haystackNormalized = normalizeSearchText(haystack);

            if (haystack.includes(targetSearch)) return true;
            if (targetCityToken && haystackNormalized.includes(targetCityToken)) return true;
            if (targetTokens.length === 0) return true;

            const matchingTokens = targetTokens.filter((token) => haystackNormalized.includes(token)).length;
            const requiredMatches = Math.min(2, targetTokens.length);
            return matchingTokens >= requiredMatches;
          })
          .sort((a: any, b: any) => {
            if (a.distanceMiles === null || b.distanceMiles === null) return 0;
            return a.distanceMiles - b.distanceMiles;
          });

        setRestaurants(filtered);
      }
      setLoading(false);
    }
    fetchRestaurants();
  }, [address, latParam, lngParam, search]);

  return (
    <div className="food-app-shell">
      <nav className="food-app-nav">
        <Logo size="sm" />
      </nav>

      <main className="food-app-main">
        <div id="view-restaurants" className="active">
          <section className="food-panel rest-top">
            <Link href="/" className="back" style={{ marginBottom: '16px' }}>← Back</Link>
            <div className="food-eyebrow">Browse restaurants</div>
            <h2>Available Now</h2>
            <p className="lead">
              Showing restaurants for <span className="text-[#e8a230] font-bold">{selectedArea}</span>.
              Ratings and reviews are linked to Google so customers see external feedback, not platform-only scores.
            </p>
            <div className="mt-5">
              <LandingSearch initialValue={address || search || ""} isCompact />
            </div>
            {!hasLocationInput && (
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-white/55">
                Enter your delivery address above to see restaurants near you.
              </p>
            )}

            <div className="rest-filters">
              <button className="on">All Restaurants</button>
              <button>Fast Delivery</button>
              <button>Top Rated</button>
            </div>
          </section>

          {loading ? (
            <div className="food-panel text-center py-20 opacity-60 font-bold text-[#e8a230] animate-pulse">Loading nearby restaurants...</div>
          ) : (
            <div className="rest-grid">
              {restaurants.map(r => {
                const hasGHL = Boolean(r.ghlUrl);
                const googleQuery = encodeURIComponent(`${r.name || ""} ${r.address || ""} ${r.city || ""} ${r.state || ""}`);
                const menuQuery = (() => {
                  const params = new URLSearchParams();
                  const addressText = (address || search || "").trim();
                  if (addressText) params.set("address", addressText);
                  if (latParam && lngParam) {
                    params.set("lat", String(latParam));
                    params.set("lng", String(lngParam));
                  }
                  const qs = params.toString();
                  return qs ? `?${qs}` : "";
                })();
                return (
                  <Link key={r.id} href={`/restaurants/${r.id}${menuQuery}`} className="rest-card">
                    <div className="rc-img" style={{ backgroundImage: `url('${r.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80'}')` }}>
                      {hasGHL && (
                        <div style={{ position:'absolute', bottom:12, right:12, background:'rgba(12,14,19,.85)', color:'#fff', padding:'7px 10px', borderRadius:999, fontSize:9, fontWeight:900, display:'flex', alignItems:'center', gap:6, zIndex:1, border:'1px solid rgba(255,255,255,.08)', letterSpacing:'.12em' }}>
                          <span style={{ color: 'var(--gold)' }}>●</span> FAST ASSIST
                        </div>
                      )}
                    </div>
                    <div className="rc-info">
                      <div className="rc-name">{r.name}</div>
                      <div className="rc-meta">
                        <div className="rc-rating"><span>★</span> {r.rating || '4.9'}</div>
                        <div>•</div>
                        <div>
                          {typeof r.distanceMiles === "number" ? `${r.distanceMiles.toFixed(1)} mi` : "18-24 mins"}
                        </div>
                        <div>•</div>
                        <div>{r.city}, {r.state}</div>
                      </div>
                      <button
                        type="button"
                        className="mt-2 inline-flex text-[11px] uppercase tracking-[0.14em] font-bold text-[#e8a230] hover:text-white transition-colors"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          window.open(`https://www.google.com/search?q=${googleQuery}+reviews`, "_blank", "noopener,noreferrer");
                        }}
                      >
                        View Google Reviews
                      </button>
                    </div>
                  </Link>
                );
              })}
              {restaurants.length === 0 && (
                <div className="food-panel col-span-full text-center py-20 opacity-50">
                  {hasLocationInput ? "No restaurants matched that area yet." : "Add your address to start browsing restaurants."}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function RestaurantFinder() {
  return (
    <Suspense fallback={<div className="food-app-shell flex min-h-screen items-center justify-center text-[#e8a230] font-bold">Loading restaurants...</div>}>
      <RestaurantFinderContent />
    </Suspense>
  );
}
