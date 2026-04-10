"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import DriverLoginForm from "./DriverLoginForm";

export default function DriverLoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const signInWithProvider = async (provider: 'google') => {
    setIsLoading(true);
    const wantsTour =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("tour") === "1";
    const nextPath = wantsTour ? "/driver/dashboard?tour=1" : "/driver/dashboard";
    const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
            queryParams: {
                prompt: 'select_account',
            }
        }
    });

    if (error) {
        alert(`Failed to connect with ${provider}: ${error.message}`);
        setIsLoading(false);
    }
  };

  return (
    <div className="food-app-shell">
      <nav className="food-app-nav">
        <Logo size="sm" />
      </nav>

      <main className="food-auth-wrap">
        <div className="food-auth-grid">
          <section className="food-hero-card food-auth-hero">
            <div className="food-auth-image" style={{ backgroundImage: "url('/driver_login_bg_car.png')" }} />
            <div className="food-auth-hero-inner">
              <div className="food-eyebrow">Driver access</div>
              <div className="mt-5 space-y-4">
                <h1 className="food-heading !text-[56px]">Driver <span className="accent">Portal Login.</span></h1>
                <p className="food-subtitle !max-w-[520px]">
                  Access your delivery workspace, claim nearby routes, and manage active orders using the same linear design system as signup and customer flows.
                </p>
              </div>
              <ul className="food-auth-list">
                <li><div className="food-auth-icon">1</div><div><div className="font-extrabold">Active route board</div><div className="text-sm text-white/65">See mission-ready orders in real time.</div></div></li>
                <li><div className="food-auth-icon">2</div><div><div className="font-extrabold">Live navigation</div><div className="text-sm text-white/65">Use maps and heat zones for smarter driving.</div></div></li>
                <li><div className="food-auth-icon">3</div><div><div className="font-extrabold">Fast payout tools</div><div className="text-sm text-white/65">Track earnings and manage Stripe setup.</div></div></li>
              </ul>
            </div>
          </section>

          <section className="food-panel food-auth-form">
            <Link href="/" className="su-back">← Back to Home</Link>
            <p className="food-kicker mb-3">Driver account</p>
            <h1 className="food-heading !text-[36px]">Sign In</h1>
            <p className="lead mt-2">Secure mobile access to your driver dashboard.</p>

            <div className="mt-6">
              <DriverLoginForm />
            </div>

            <div className="login-or">or continue with</div>
            <div className="grid grid-cols-1 gap-3">
              <button className="social-btn" onClick={() => signInWithProvider('google')} disabled={isLoading}>
                <span style={{ fontSize: '16px' }}>G</span> Continue with Google
              </button>
            </div>

            <Link
              href="/driver/portal-preview"
              className="mt-3 inline-flex w-full items-center justify-center rounded-[12px] border border-[#e8a230]/45 bg-[#e8a230]/10 px-4 py-3 text-[12px] font-black uppercase tracking-[0.13em] text-[#f0bd63] transition-all hover:border-[#e8a230]/65 hover:bg-[#e8a230]/18 hover:text-[#ffd286]"
            >
              Preview Driver Portal Mock
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
