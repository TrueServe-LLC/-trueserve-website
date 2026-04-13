"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Share2 } from "lucide-react";

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

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
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
    // Basic client-side check for userId cookie
    const match = document.cookie.match(new RegExp('(^| )userId=([^;]+)'));
    if (match) setUserId(match[2]);
  }, []);

  return (
    <div className="food-app-shell">
      <nav className="food-app-nav">
        <Logo size="sm" />
        <div className="nav-links hidden md:flex">
          <Link href="/restaurants">Order Food</Link>
          <Link href="/merchant/login">For Merchants</Link>
          <Link href="/driver/login">For Drivers</Link>
        </div>
        <div className="nav-r">
          {userId ? (
            <Link href="/user/settings" className="btn btn-ghost">Account</Link>
          ) : (
            <Link href="/login" className="btn btn-ghost">Sign In</Link>
          )}
          <Link href="/merchant/signup" className="btn btn-gold">Join Network</Link>
        </div>
      </nav>

      <main className="food-app-main">
        <section className="food-hero-card">
          <div className="home-bg-img"></div>
          <div className="home-bg-grad"></div>
          <div className="relative z-[2] grid gap-7 px-6 py-12 md:grid-cols-[minmax(0,1.1fr)_360px] md:gap-10 md:px-10 md:py-14">
            <div className="space-y-8 ts-animate-fade-up">
              <div className="food-eyebrow">Fresh meals. Fast drop-offs. One clear brand.</div>
              <div className="space-y-4">
                <h1 className="food-title">Food Delivery<br /><span className="accent">That Feels Premium.</span></h1>
                <p className="food-subtitle">
                  Browse local favorites, build your cart, and track every order with one polished TrueServe experience from homepage to doorstep.
                </p>
              </div>

              <LandingSearch />

              <div className="food-chip-row">
                {[
                  "Curated local restaurants",
                  "Real-time driver tracking",
                  "Checkout designed for speed",
                ].map((feature) => (
                  <div key={feature} className="food-chip">
                    <span className="food-chip-dot" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="food-panel flex flex-col gap-5 ts-animate-fade-up ts-animate-delay-1">
              <div className="space-y-4">
                <p className="food-kicker">Tonight's vibe</p>
                <h2 className="food-heading">Browse. Order. <span className="accent">Relax.</span></h2>
                <p className="food-subtitle !text-sm !max-w-none">
                  A calmer, more consistent customer journey for sign-up, login, restaurant discovery, and live order tracking.
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

        <section className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            { title: "Start ordering", desc: "Search by address, discover nearby restaurants, and jump straight into menu browsing.", link: "/restaurants" },
            { title: "Save your details", desc: "Keep addresses, payment details, and order history in one familiar interface.", link: "/restaurants" },
            { title: "Track every delivery", desc: "Follow prep, pickup, and arrival inside the same visual system.", link: "/orders" }
          ].map((card) => (
            <Link key={card.title} href={card.link} className="food-card transition-transform hover:-translate-y-1">
              <p className="food-kicker mb-3">Customer Flow</p>
              <h3 className="food-heading !text-[34px] mb-3">{card.title}</h3>
              <p className="text-sm leading-7">{card.desc}</p>
            </Link>
          ))}
        </section>

        <section className="mt-10 food-panel">
          <div className="food-section-head flex-col items-start md:flex-row md:items-end">
            <div>
              <p className="food-kicker mb-3">Built For Daily Orders</p>
              <h2 className="food-heading">A more <span className="accent">linear</span> experience.</h2>
            </div>
            <Link href="/restaurants" className="portal-btn-outline portal-btn-outline-block md:w-auto">
              Explore Restaurants
            </Link>
          </div>
          <div className="food-grid-2">
            <div className="space-y-4">
              <p className="food-subtitle !max-w-none">
                The customer journey now follows the same materials, rounded surfaces, typography, and CTA patterns across entry, account, restaurant discovery, menu selection, and order tracking.
              </p>
              <div className="food-chip-row">
                <div className="food-chip"><span className="food-chip-dot" /> Shared typography</div>
                <div className="food-chip"><span className="food-chip-dot" /> Shared cards and buttons</div>
                <div className="food-chip"><span className="food-chip-dot" /> Shared dark warm palette</div>
              </div>
            </div>
            <div className="food-card">
              <p className="food-kicker mb-3">Quick Access</p>
              <div className="grid gap-3 text-sm">
                <Link href="/restaurants" className="portal-btn-gold portal-btn-gold-block">
                  Order Food
                </Link>
                {userId ? (
                  <Link href="/orders" className="portal-btn-outline portal-btn-outline-block">
                    View Orders
                  </Link>
                ) : (
                  <div className="grid gap-2 rounded-xl border border-white/5 bg-white/0 px-4 py-3 text-center text-xs text-gray-400">
                    <div>
                      <Link href="/login" className="font-semibold text-gray-300 transition-colors hover:text-[#e8a230]">
                        Sign in
                      </Link>{" "}
                      to view past orders.
                    </div>
                    <div>
                      New?{" "}
                      <Link href="/signup" className="font-semibold text-gray-300 transition-colors hover:text-[#e8a230]">
                        Create an account
                      </Link>
                      .
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-8 border-t border-white/5 px-2 pt-12 text-center">
          <div className="mx-auto flex max-w-7xl flex-col items-center">
            <Logo size="md" className="mb-8" />
            <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">
                Social
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-300 transition-colors hover:border-[#e8a230] hover:text-white"
                      aria-label={social.label}
                    >
                      <Icon className="h-4 w-4" />
                      {social.label}
                    </a>
                  );
                })}
              </div>
            </div>
            <div className="mb-8 flex flex-wrap justify-center gap-10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/merchant/signup" className="hover:text-[#e8a230] transition-colors">Merchants</Link>
            <Link href="/driver/signup" className="hover:text-[#e8a230] transition-colors">Drivers</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              © {new Date().getFullYear()} TrueServe Platform. <br />
              Supporting Independent Culinary Infrastructure.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
