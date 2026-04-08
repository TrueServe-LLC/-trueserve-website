"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function MerchantLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="food-app-shell">
      <nav className="food-app-nav">
        <Logo size="sm" />
      </nav>

      <main className="food-auth-wrap">
        <div className="food-auth-grid">
          <section className="food-hero-card food-auth-hero">
            <div className="food-auth-image" style={{ backgroundImage: "url('/merchant_login_bg_restaurant.png')" }} />
            <div className="food-auth-hero-inner">
              <div className="food-eyebrow">Merchant access</div>
              <div className="mt-5 space-y-4">
                <h1 className="food-heading !text-[56px]">Merchant <span className="accent">Portal Login.</span></h1>
                <p className="food-subtitle !max-w-[520px]">
                  Sign in to manage POS integrations, orders, restaurant settings, and operations in the same consistent interface used across the platform.
                </p>
              </div>
              <ul className="food-auth-list">
                <li><div className="food-auth-icon">1</div><div><div className="font-extrabold">Operational dashboard</div><div className="text-sm text-white/65">Monitor order flow, prep, and store status.</div></div></li>
                <li><div className="food-auth-icon">2</div><div><div className="font-extrabold">Integration control</div><div className="text-sm text-white/65">Manage Stripe, POS, and embedded ordering tools.</div></div></li>
                <li><div className="food-auth-icon">3</div><div><div className="font-extrabold">Support access</div><div className="text-sm text-white/65">Reach TrueServe AI support from inside the portal.</div></div></li>
              </ul>
            </div>
          </section>

          <section className="food-panel food-auth-form">
            <Link href="/" className="su-back">← Back to Home</Link>
            <p className="food-kicker mb-3">Restaurant account</p>
            <h1 className="food-heading !text-[36px]">Sign In</h1>
            <p className="lead mt-2">Secure merchant access for your partnership portal.</p>

            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
                setIsLoading(true);
                setTimeout(() => router.push("/merchant/dashboard"), 800);
              }}
            >
              <div className="fg">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="partner@yourplace.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="fg">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button className="place-btn mt-4" disabled={isLoading}>
                {isLoading ? "Authorizing..." : "Establish Session"}
              </button>
            </form>

            <div className="login-foot">New to network? <Link href="/merchant/signup">Apply for partnership</Link></div>
          </section>
        </div>
      </main>
    </div>
  );
}
