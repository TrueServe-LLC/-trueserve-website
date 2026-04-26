"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Share2, Menu, X } from "lucide-react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
import Logo from "@/components/Logo";
import LandingSearch from "@/components/LandingSearch";
import RestaurantCard from "@/app/restaurants/RestaurantCard";
import { supabase } from "@/lib/supabase";
import {
  buildHomeCollections,
  buildMenuMoments,
  getLiveRestaurants,
  summarizeRestaurantNetwork,
  type PublicRestaurantCollection,
  type MenuMomentCollection,
  type PublicRestaurantRecord,
} from "@/lib/public-restaurants";

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [hasAddress, setHasAddress] = useState(false);
  const [featuredRestaurants, setFeaturedRestaurants] = useState<PublicRestaurantRecord[]>([]);
  const [collections, setCollections] = useState<PublicRestaurantCollection[]>([]);
  const [menuMoments, setMenuMoments] = useState<MenuMomentCollection[]>([]);
  const [networkStats, setNetworkStats] = useState({
    totalRestaurants: 0,
    verifiedCount: 0,
    markets: 0,
    averageRating: null as number | null,
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const socialLinks = [
    {
      label: "Instagram",
      href: "https://www.instagram.com/trueserve_delivery/",
      icon: InstagramIcon,
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/share/1EHeS1jdoq/?mibextid=wwXIfr",
      icon: FacebookIcon,
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/112360123/admin/dashboard/",
      icon: Share2,
    },
  ];

  useEffect(() => {
    const match = document.cookie.match(new RegExp('(^| )userId=([^;]+)'));
    if (match) setUserId(match[2]);
    try {
      if (localStorage.getItem("ts.delivery.address")) setHasAddress(true);
    } catch {}

    Promise.all([
      supabase
        .from('Restaurant')
        .select('*, healthGrade, complianceStatus, complianceScore, createdAt')
        .limit(60),
      supabase
        .from('MenuItem')
        .select('id, restaurantId, name, category, price, status, isAvailable')
        .limit(200),
    ]).then(([restaurantsResult, menuResult]) => {
      if (restaurantsResult.error) {
        console.error('Restaurant fetch error:', JSON.stringify(restaurantsResult.error));
        return;
      }

      const restaurantData = restaurantsResult.data || [];
      const live = getLiveRestaurants(restaurantData);
      const sortedFeatured = [...live].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
      setFeaturedRestaurants(sortedFeatured.slice(0, 4));
      setCollections(buildHomeCollections(live));
      setNetworkStats(summarizeRestaurantNetwork(live));

      if (menuResult.error) {
        console.error('Menu item fetch error:', JSON.stringify(menuResult.error));
        setMenuMoments([]);
        return;
      }

      setMenuMoments(buildMenuMoments(live, menuResult.data || []));
    });
  }, []);

  return (
    <div className="food-app-shell home-shell">
      <nav className="food-app-nav">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden hamburger-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Open menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Logo size="sm" />
        </div>
        <div className="nav-links hidden md:flex">
          <Link href="/restaurants">Order Food</Link>
          <Link href="/rewards">Rewards</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/merchant/signup">For Merchants</Link>
          <Link href="/driver/signup">For Drivers</Link>
        </div>
        <div className="nav-r">
          {userId ? (
            <Link href="/user/settings" className="btn btn-ghost">Account</Link>
          ) : (
            <Link href="/login" className="btn btn-ghost">Sign In</Link>
          )}
        </div>

      </nav>

      {menuOpen && (
        <div
          style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)"}}
          onClick={() => setMenuOpen(false)}
        >
          <div
            style={{position:"absolute",top:0,left:0,right:0,background:"#0d0d10",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"0 16px 20px"}}
            onClick={e => e.stopPropagation()}
          >
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",height:62}}>
              <Logo size="sm" />
              <button onClick={() => setMenuOpen(false)} style={{display:"flex",alignItems:"center",justifyContent:"center",width:38,height:38,borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.8)",cursor:"pointer"}}>
                <X size={20} />
              </button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,paddingTop:8}}>
              {[
                { href:"/driver/signup", icon:"🚗", label:"For Drivers", sub:"Earn delivering food" },
                { href:"/merchant/signup", icon:"🍽️", label:"For Merchants", sub:"List your restaurant" },
                { href:"/restaurants", icon:"🛍️", label:"Order Food", sub:"Browse local restaurants" },
                { href:"/rewards", icon:"⭐", label:"Rewards", sub:"Earn points on every order" },
                { href:"/pricing", icon:"💲", label:"Pricing", sub:"Zero commission plans" },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  style={{display:"flex",alignItems:"center",gap:16,padding:"14px 16px",borderRadius:14,border:"1px solid rgba(255,255,255,0.07)",background:"rgba(255,255,255,0.03)",color:"#fff",textDecoration:"none"}}
                >
                  <span style={{display:"flex",alignItems:"center",justifyContent:"center",width:44,height:44,flexShrink:0,fontSize:22,borderRadius:12,background:"rgba(255,255,255,0.06)"}}>
                    {item.icon}
                  </span>
                  <div>
                    <div style={{fontWeight:700,fontSize:15,color:"#fff"}}>{item.label}</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:2}}>{item.sub}</div>
                  </div>
                </Link>
              ))}
              <div style={{marginTop:4,borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:12}}>
                <Link
                  href={userId ? "/user/settings" : "/login"}
                  onClick={() => setMenuOpen(false)}
                  style={{display:"block",textAlign:"center",padding:"13px",borderRadius:12,border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"#fff",fontWeight:700,fontSize:14}}
                >
                  {userId ? "Account" : "Sign In"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="food-app-main">
        <section className="food-hero-card">
          <div className="home-bg-img"></div>
          <div className="home-bg-grad"></div>
          <div className="food-hero-content">
            <div className="space-y-6 ts-animate-fade-up">
              <div className="space-y-3">
                <h1 className="food-title">What are you<br /><span className="accent">craving tonight?</span></h1>
                <p className="food-subtitle">
                  Browse local favorites, place your order in seconds, and watch your food travel from kitchen to doorstep in real time.
                </p>
              </div>

              <LandingSearch onAddressChange={setHasAddress} />

              <div className="food-chip-row">
                {[
                  "Local restaurants",
                  "Live tracking",
                  "Avg. 30 min",
                ].map((feature) => (
                  <div key={feature} className="food-chip">
                    <span className="food-chip-dot" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="food-panel food-hero-right flex-col gap-5 ts-animate-fade-up ts-animate-delay-1">
              <div className="space-y-4">
                <p className="food-kicker">Ready to eat?</p>
                <h2 className="food-heading">Pick a spot. <span className="accent">Dig in.</span></h2>
                <p className="food-subtitle !text-sm !max-w-none">
                  From breakfast burritos to late-night pizza — find what you're craving from local restaurants near you.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="food-stat">
                  <strong>Live</strong>
                  <span>Delivery ETAs update in real time</span>
                </div>
                <div className="food-stat">
                  <strong>Verified</strong>
                  <span>Restaurant reviews come from Google</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/restaurants" className="portal-btn-gold portal-btn-gold-block">
                  Start Ordering
                </Link>
                {!userId ? (
                  <Link
                    href="/signup"
                    className="portal-btn-outline portal-btn-outline-block"
                  >
                    Create Account
                  </Link>
                ) : (
                  <Link href="/orders" className="portal-btn-outline portal-btn-outline-block">
                    View Orders
                  </Link>
                )}
              </div>
              {!userId ? (
                <p className="text-center text-[11px] text-gray-400">
                  New here? Create an account to save addresses and track orders.
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {/* Trust bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", flexWrap:"wrap", gap:0, padding:"14px 24px 6px" }}>
          {([
            { icon:"📍", label:"Local Restaurants" },
            { icon:"📡", label:"Live Tracking" },
            { icon:"⚡", label:"Avg. 30 min" },
            { icon:"⭐", label:"Google Reviews" },
          ] as const).map((item, i, arr) => (
            <React.Fragment key={item.label}>
              <div style={{ display:"flex", alignItems:"center", gap:7, padding:"4px 18px", whiteSpace:"nowrap" }}>
                <span style={{ fontSize:14 }}>{item.icon}</span>
                <span style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.14em", color:"rgba(255,255,255,0.45)" }}>{item.label}</span>
              </div>
              {i < arr.length - 1 && <div style={{ width:1, height:14, background:"rgba(255,255,255,0.1)", flexShrink:0 }} />}
            </React.Fragment>
          ))}
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            {
              kicker: "Live network",
              value: networkStats.totalRestaurants ? `${networkStats.totalRestaurants}+` : "Growing",
              detail: "Approved restaurant partners live on TrueServe",
            },
            {
              kicker: "Verified kitchens",
              value: networkStats.verifiedCount ? `${networkStats.verifiedCount}` : "Reviewing",
              detail: "Operators showing strong health and compliance signals",
            },
            {
              kicker: "Local markets",
              value: networkStats.markets ? `${networkStats.markets}` : "Expanding",
              detail: "Distinct city markets with active restaurant coverage",
            },
            {
              kicker: "Average rating",
              value: networkStats.averageRating ? `${networkStats.averageRating.toFixed(1)}★` : "Trusted",
              detail: "Review average across live restaurants on the platform",
            },
          ].map((stat, index) => (
            <div
              key={stat.kicker}
              className="food-card ts-reveal transition-transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <p className="food-kicker mb-3">{stat.kicker}</p>
              <h2 className="food-heading !text-[38px] mb-3">{stat.value}</h2>
              <p className="text-sm leading-7">{stat.detail}</p>
            </div>
          ))}
        </section>


        {hasAddress && featuredRestaurants.length > 0 && (
          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="food-kicker mb-2">Now on TrueServe</p>
                <h2 className="food-heading">Featured <span className="accent">restaurants</span></h2>
              </div>
              <Link href="/restaurants" className="portal-btn-outline shrink-0" style={{width:"auto"}}>
                See All
              </Link>
            </div>
            <div className="rest-grid">
              {featuredRestaurants.map(r => (
                <RestaurantCard key={r.id} r={r} />
              ))}
            </div>
          </section>
        )}

        {hasAddress && (
          <section className="mt-10 food-panel">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="food-kicker mb-2">Explore by Cuisine</p>
                <h2 className="food-heading">What are you <span className="accent">craving?</span></h2>
              </div>
              <Link href="/restaurants" className="portal-btn-outline shrink-0" style={{width: "auto"}}>
                See All
              </Link>
            </div>
            <div className="cuisine-grid">
              {[
                { emoji: "🍕", label: "Pizza", cat: "pizza" },
                { emoji: "🍔", label: "Burgers", cat: "burgers" },
                { emoji: "🌮", label: "Tacos", cat: "tacos" },
                { emoji: "🍜", label: "Noodles", cat: "noodles" },
                { emoji: "🍣", label: "Sushi", cat: "sushi" },
                { emoji: "🥗", label: "Salads", cat: "salads" },
                { emoji: "🍗", label: "Chicken", cat: "chicken" },
                { emoji: "🥩", label: "Steaks", cat: "steaks" },
              ].map((c) => (
                <Link key={c.cat} href={`/restaurants?category=${c.cat}`} className="cuisine-card">
                  <span className="cuisine-emoji">{c.emoji}</span>
                  <span className="cuisine-label">{c.label}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {collections.length > 0 && networkStats.totalRestaurants >= 5 && (
          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="food-kicker mb-2">Pilot-ready discovery</p>
                <h2 className="food-heading">Shop with <span className="accent">real trust signals</span></h2>
              </div>
              <Link href="/restaurants" className="portal-btn-outline shrink-0" style={{ width: "auto" }}>
                Explore All
              </Link>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {collections.map((collection, index) => {
                const heroRestaurant = collection.restaurants[0];
                const isLastOdd = index === collections.length - 1 && collections.length % 2 !== 0;
                return (
                  <Link
                    key={collection.key}
                    href={collection.href}
                    className={`food-card ts-reveal transition-transform hover:-translate-y-1${isLastOdd ? " lg:col-span-2" : ""}`}
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div
                      style={{
                        height: 220,
                        borderRadius: 18,
                        backgroundImage: `linear-gradient(180deg, rgba(10,12,16,.12), rgba(10,12,16,.84)), url('${heroRestaurant?.imageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80"}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        padding: 18,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className="food-eyebrow">{collection.eyebrow}</div>
                      <div>
                        <h3 className="food-heading !text-[36px] mb-2">{collection.title}</h3>
                        <p className="text-sm leading-6 text-white/75 max-w-[32rem]">{collection.description}</p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3">
                      {collection.restaurants.map((restaurant) => (
                        <div
                          key={restaurant.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto",
                            gap: 12,
                            alignItems: "center",
                            padding: "14px 16px",
                            borderRadius: 16,
                            border: "1px solid rgba(255,255,255,0.08)",
                            background: "rgba(255,255,255,0.03)",
                          }}
                        >
                          <div>
                            <div className="text-sm font-black uppercase tracking-[0.12em] text-white">{restaurant.name}</div>
                            <div className="mt-1 text-xs uppercase tracking-[0.14em] text-white/45">
                              {[restaurant.city, restaurant.state].filter(Boolean).join(", ") || "Local partner"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-[#f97316]">
                              {Number(restaurant.rating || 0) > 0 ? `${Number(restaurant.rating).toFixed(1)}★` : "New"}
                            </div>
                            <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-white/45">
                              {restaurant.healthGrade ? `Grade ${restaurant.healthGrade}` : "Live now"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {menuMoments.length > 0 && (
          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="food-kicker mb-2">Menu-aware discovery</p>
                <h2 className="food-heading">Browse by <span className="accent">actual dishes</span></h2>
              </div>
              <Link href="/restaurants" className="portal-btn-outline shrink-0" style={{ width: "auto" }}>
                See Menus
              </Link>
            </div>
            <div className="grid gap-5 xl:grid-cols-3">
              {menuMoments.map((moment, index) => {
                const hero = moment.entries[0];
                return (
                  <Link
                    key={moment.key}
                    href={moment.href}
                    className="food-card ts-reveal transition-transform hover:-translate-y-1"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <div
                      style={{
                        height: 180,
                        borderRadius: 18,
                        backgroundImage: `linear-gradient(180deg, rgba(10,12,16,.1), rgba(10,12,16,.88)), url('${hero?.imageUrl || "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80"}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        padding: 18,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className="food-eyebrow">{moment.eyebrow}</div>
                      <div>
                        <h3 className="food-heading !text-[34px] mb-2">{moment.title}</h3>
                        <p className="text-sm leading-6 text-white/75">{moment.description}</p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3">
                      {moment.entries.map((entry) => (
                        <div
                          key={entry.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto",
                            gap: 12,
                            alignItems: "center",
                            padding: "14px 16px",
                            borderRadius: 16,
                            border: "1px solid rgba(255,255,255,0.08)",
                            background: "rgba(255,255,255,0.03)",
                          }}
                        >
                          <div>
                            <div className="text-sm font-black uppercase tracking-[0.12em] text-white">{entry.itemName}</div>
                            <div className="mt-1 text-xs uppercase tracking-[0.14em] text-white/45">
                              {entry.restaurantName} · {entry.cityLabel}
                            </div>
                          </div>
                          <div className="text-sm font-black text-[#f97316]">{entry.priceLabel}</div>
                        </div>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <footer className="mt-8 border-t border-white/5 px-2 pt-10 pb-12 text-center">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-6">
            <Logo size="md" />
            <div className="flex items-center justify-center gap-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/rewards" className="hover:text-[#f97316] transition-colors">Rewards</Link>
              <Link href="/pricing" className="hover:text-[#f97316] transition-colors">Pricing</Link>
              <Link href="/merchant/signup" className="hover:text-[#f97316] transition-colors">Merchants</Link>
              <Link href="/driver/signup" className="hover:text-[#f97316] transition-colors">Drivers</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
            <div className="flex items-center gap-5">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-500 transition-colors hover:text-[#f97316]"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              © {new Date().getFullYear()} TrueServe · Bringing local flavor to your doorstep.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
