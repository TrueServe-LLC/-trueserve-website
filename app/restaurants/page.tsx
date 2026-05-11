"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import LandingSearch from "@/components/LandingSearch";
import RestaurantCard from "./RestaurantCard";
import { getFavorites } from "@/app/user/favorite-actions";
import {
  addDistanceMiles,
  extractStateCode,
  getLiveRestaurants,
  matchesRestaurantSearch,
  normalizeSearchText,
} from "@/lib/public-restaurants";

const FILTER_CHIPS = [
  { id: "all",       label: "All",       emoji: "🍽" },
  { id: "open",      label: "Open Now",  emoji: "🟢" },
  { id: "top",       label: "Top Rated", emoji: "⭐" },
  { id: "pizza",     label: "Pizza",     emoji: "🍕" },
  { id: "burgers",   label: "Burgers",   emoji: "🍔" },
  { id: "mexican",   label: "Mexican",   emoji: "🌮" },
  { id: "asian",     label: "Asian",     emoji: "🍜" },
  { id: "wings",     label: "Wings",     emoji: "🍗" },
  { id: "desserts",  label: "Desserts",  emoji: "🍦" },
];

function RestaurantFinderContent() {
  const shouldReduceMotion = useReducedMotion();
  const searchParams = useSearchParams();
  const address = searchParams.get("address");
  const search = searchParams.get("search");
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const selectedArea = address || search || "your area";
  const hasLocationInput = Boolean((address || search || "").trim() || (latParam && lngParam));
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRestaurantCount, setActiveRestaurantCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeChip, setActiveChip] = useState("all");
  const revealTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) {
        setUserId(data.user.id);
        getFavorites().then(setFavorites);
      }
    });
  }, []);

  useEffect(() => {
    async function fetchRestaurants() {
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
        .select('*, healthGrade, complianceStatus');

      if (!error && data) {
        const liveRestaurants = getLiveRestaurants(data);
        setActiveRestaurantCount(liveRestaurants.length);
        const withDistance = addDistanceMiles(liveRestaurants, targetLat, targetLng);

        const filtered = withDistance
          .filter((restaurant: any) => {
            if (!shouldFilterByLocation) return false;
            if (matchesRestaurantSearch(restaurant, targetRaw, targetCityToken, targetTokens)) return true;
            if (targetLat !== null && targetLng !== null && restaurant.distanceMiles !== null) {
              return restaurant.distanceMiles <= 20;
            }
            if (targetState && (restaurant.state || "").toUpperCase() !== targetState) return false;
            return Boolean(targetSearch);
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

  const filteredRestaurants = restaurants.filter((r) => {
    if (activeChip === "open") {
      const o = r.openTime?.slice(0, 5);
      const c = r.closeTime?.slice(0, 5);
      if (!o || !c) return true;
      const now = new Date().toTimeString().slice(0, 5);
      return now >= o && now <= c;
    }
    if (activeChip === "top") {
      return parseFloat(r.rating || "0") >= 4.5;
    }
    const cuisineMap: Record<string, string[]> = {
      pizza:    ["pizza"],
      burgers:  ["burger", "burgers", "smash"],
      mexican:  ["mexican", "taco", "tacos", "burrito"],
      asian:    ["asian", "chinese", "thai", "sushi", "ramen", "pho", "korean"],
      wings:    ["wings", "wing", "wingery"],
      desserts: ["dessert", "ice cream", "sweet", "cake", "bakery"],
    };
    if (cuisineMap[activeChip]) {
      const keywords = cuisineMap[activeChip];
      const text = `${r.name} ${r.cuisineType || ""} ${r.description || ""}`.toLowerCase();
      return keywords.some((k) => text.includes(k));
    }
    return true;
  });

  return (
    <div className="food-app-shell rest-shell">
      {/* ── Compact sticky nav ── */}
      <nav className="food-app-nav rest-nav">
        <Logo size="sm" />
      </nav>

      <main className="food-app-main rest-main">

        {/* ── Sticky search + chips ── */}
        <div className="rest-sticky-top">
          <div className="rest-search-area">
            <LandingSearch initialValue={address || search || ""} isCompact />
          </div>
          {/* Zero-fee trust badge — our differentiator vs. competitors */}
          <div className="rest-trust-strip">
            <span>✓ $0 hidden fees</span>
            <span className="rest-trust-divider" />
            <span>✓ 7% flat commission</span>
            <span className="rest-trust-divider" />
            <span>✓ Health-screened kitchens</span>
          </div>
          <div className="rest-chip-scroll">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip.id}
                className={`rest-filter-chip${activeChip === chip.id ? " active" : ""}`}
                onClick={() => setActiveChip(chip.id)}
              >
                <span>{chip.emoji}</span>
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results ── */}
        <div className="rest-results-wrap">
          {loading ? (
            <div className="rest-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rest-card rest-card-skeleton">
                  <div className="rc-img rc-img-skeleton" />
                  <div className="rc-info" style={{ gap: 10 }}>
                    <div className="skeleton-line" style={{ width: "70%", height: 20 }} />
                    <div className="skeleton-line" style={{ width: "50%", height: 13 }} />
                    <div className="skeleton-line" style={{ width: "35%", height: 11, marginTop: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredRestaurants.length > 0 && (
                <p className="rest-results-label">
                  {filteredRestaurants.length} {filteredRestaurants.length === 1 ? "spot" : "spots"} near{" "}
                  <span className="rest-results-area">{selectedArea}</span>
                </p>
              )}
              <motion.div layout className="rest-grid">
                <AnimatePresence mode="popLayout">
                  {filteredRestaurants.map((r, index) => (
                    <motion.div
                      key={r.id}
                      layout
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
                      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -14, scale: 0.98 }}
                      transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: Math.min(index * 0.04, 0.18) }}
                    >
                      <RestaurantCard
                        r={r}
                        address={address}
                        search={search}
                        latParam={latParam}
                        lngParam={lngParam}
                        userId={userId}
                        initialIsFavorited={favorites.includes(r.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredRestaurants.length === 0 && (
                  <div className="rest-empty col-span-full">
                    {hasLocationInput ? (
                      <>
                        <p className="food-kicker mb-3">Outside our current zone</p>
                        <h3 className="food-heading !text-[28px] mb-3">Not in your area <span className="accent">yet.</span></h3>
                        <p className="text-sm text-white/55 mb-6 max-w-sm mx-auto leading-relaxed">
                          We&apos;re actively onboarding partners across our launch footprint. Drop your email and we&apos;ll notify you when we&apos;re near you.
                        </p>
                        <form
                          onSubmit={(e) => { e.preventDefault(); const el = e.currentTarget.querySelector('input') as HTMLInputElement; if (el?.value) { el.value = ''; alert("You're on the list!"); } }}
                          className="rest-notify-form"
                        >
                          <input type="email" placeholder="your@email.com" required className="rest-notify-input" />
                          <button type="submit" className="portal-btn-gold" style={{ whiteSpace: 'nowrap' }}>Notify Me</button>
                        </form>
                      </>
                    ) : (
                      <>
                        <p className="food-kicker mb-3">Pilot launch</p>
                        <h3 className="food-heading !text-[28px] mb-3">
                          Live with <span className="accent">{activeRestaurantCount || "local"} partners</span>
                        </h3>
                        <p className="text-sm text-white/55 max-w-sm leading-relaxed">
                          Enter your address above to find restaurants near you.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function RestaurantFinder() {
  return (
    <Suspense fallback={<div className="food-app-shell flex min-h-screen items-center justify-center text-[#f97316] font-bold">Loading…</div>}>
      <RestaurantFinderContent />
    </Suspense>
  );
}
