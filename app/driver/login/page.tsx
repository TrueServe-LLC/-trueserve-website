"use client";

import React, { useState } from "react";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { createClient } from "@/lib/supabase/client";
import DriverLoginForm from "./DriverLoginForm";
import { Clock3, DollarSign, MapPin, ShieldCheck, WalletCards } from "lucide-react";

export default function DriverLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const signInWithProvider = async (provider: 'google') => {
    setIsLoading(true);
    setErrorText("");
    const wantsTour =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("tour") === "1";
    const nextPath = wantsTour ? "/driver/dashboard?tour=1" : "/driver/dashboard";
    const supabase = createClient();
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
        setErrorText(`Failed to connect with ${provider}: ${error.message}`);
        setIsLoading(false);
    }
  };

  return (
    <div className="ts-fig ts-fig-auth-page ts-fig-driver-login-page">
      <SiteHeader />

      <main className="ts-fig-auth ts-fig-driver-login">
        <div className="ts-fig-auth-grid ts-fig-driver-login-grid">
          <aside className="ts-fig-auth-side ts-fig-driver-login-side">
            <div
              className="ts-fig-auth-side-image"
              style={{ backgroundImage: "url('/driver-hero-delivery-car.png')" }}
              aria-hidden="true"
            />
            <div className="ts-fig-driver-login-float">
              <span className="ts-system-pulse" aria-hidden="true" />
              <strong>$20/hr</strong>
              <span>Daily pay active</span>
            </div>
            <div className="ts-fig-auth-side-inner">
              <span className="ts-fig-chip">
                <span className="ts-fig-chip-dot" />
                Driver access
              </span>
              <h1>
                Pick up routes. <span className="o">Track pay.</span>
              </h1>
              <p className="ts-fig-auth-side-sub">
                Sign in to view available orders, update documents, and keep payout details ready before you start a shift.
              </p>
              <div className="ts-fig-driver-login-metrics" aria-label="Driver account highlights">
                <div>
                  <Clock3 size={16} aria-hidden="true" />
                  <strong>Daily pay</strong>
                  <span>Pay tracking</span>
                </div>
                <div>
                  <ShieldCheck size={16} aria-hidden="true" />
                  <strong>Docs</strong>
                  <span>Review status</span>
                </div>
                <div>
                  <MapPin size={16} aria-hidden="true" />
                  <strong>Routes</strong>
                  <span>Nearby orders</span>
                </div>
              </div>
            </div>
          </aside>

          <section className="ts-fig-auth-form ts-fig-driver-login-form">
            <Link href="/" className="ts-fig-auth-back">← Back to home</Link>

            <div className="ts-fig-driver-pay-card">
              <span className="ts-system-pulse" aria-hidden="true" />
              <div>
                <strong>$20.00/hr daily pay.</strong>
                <span>Route pay, tips, and payout status stay in one place.</span>
              </div>
              <DollarSign size={18} aria-hidden="true" />
            </div>

            <span className="ts-fig-kicker">Driver account</span>
            <h2>Sign in to drive</h2>
            <p className="ts-fig-auth-form-sub">
              Use the phone number tied to your approved driver application. We’ll text a secure code before opening your dashboard.
            </p>

            {errorText && (
              <div className="ts-fig-auth-error" role="alert">
                {errorText}
              </div>
            )}

            <DriverLoginForm />

            <div className="ts-fig-driver-wallet-preview">
              <WalletCards size={18} aria-hidden="true" />
              <div>
                <strong>Wallet and document status.</strong>
                <span>After sign-in, you can review route pay, submitted documents, and payout setup before going online.</span>
              </div>
            </div>

            <div className="ts-fig-driver-login-alt">
              <div className="ts-fig-auth-divider"><span>or continue with</span></div>
              <button
                type="button"
                className="ts-fig-auth-oauth"
                onClick={() => signInWithProvider('google')}
                disabled={isLoading}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
                </svg>
                Continue with Google
              </button>

              <Link
                href="/driver/tutorial-preview"
                className="ts-fig-auth-ghost"
              >
                View driver tutorial →
              </Link>
            </div>

            <p className="ts-fig-auth-foot">
              Changed numbers? <Link href="/driver/recover">Request a phone update</Link>
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
