"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";

export default function DriverLoginPage() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const signInWithProvider = async (provider: 'google') => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
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

            <form
              className="mt-6"
              onSubmit={async (e) => {
                e.preventDefault();
                setIsLoading(true);
                setMessage(null);
                // Production-safe behavior: do not force-navigation into protected dashboard.
                // Drivers should authenticate through Google until SMS OTP is fully wired.
                await new Promise((resolve) => setTimeout(resolve, 500));
                setMessage("Use Google sign-in below to access your driver portal.");
                setIsLoading(false);
              }}
            >
              <div className="fg">
                <label>Mobile Identifier (US)</label>
                <input
                  type="tel"
                  placeholder="(336) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <button className="place-btn mt-4" disabled={isLoading}>
                {isLoading ? "Requesting Access..." : "Request Access Code"}
              </button>
            </form>

            <div className="login-or">or continue with</div>
            {message && (
              <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70">
                {message}
              </div>
            )}
            <div className="grid grid-cols-1 gap-3">
              <button className="social-btn" onClick={() => signInWithProvider('google')} disabled={isLoading}>
                <span style={{ fontSize: '16px' }}>G</span> Continue with Google
              </button>
            </div>

            <div className="login-foot">New to fleet? <Link href="/driver/signup">Apply for partnership</Link></div>
          </section>
        </div>
      </main>
    </div>
  );
}
