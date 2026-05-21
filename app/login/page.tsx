"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/client";
import { loginWithPassword } from "@/app/auth/actions";

// Show dev tools in local dev OR on non-production Vercel environments (preview/QA).
// Set NEXT_PUBLIC_APP_ENV=preview in Vercel's Preview environment variables to enable.
// Never set it on Production — those buttons must never appear on the live site.
const IS_DEV =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_APP_ENV === 'preview';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'customer' | 'merchant' | 'driver'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleDevBypass = async (demoEmail: string, demoPassword: string, label: string) => {
    setIsLoading(true);
    setErrorText('');
    const formData = new FormData();
    formData.set('email', demoEmail);
    formData.set('password', demoPassword);
    const result = await loginWithPassword(formData);
    if (result.error) {
      setErrorText(`Dev bypass failed for ${label}: ${result.message}`);
      setIsLoading(false);
      return;
    }
    const dbRole = result.role || 'CUSTOMER';
    if (dbRole === 'MERCHANT') router.push('/merchant/dashboard');
    else if (dbRole === 'DRIVER') router.push('/driver/dashboard');
    else if (dbRole === 'ADMIN' || dbRole === 'QA_TESTER') router.push('/admin/dashboard');
    else router.push('/');
    router.refresh();
  };

  const doLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setErrorText('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setErrorText('');

    // Use the server action — sets userId cookie + Supabase session properly
    const formData = new FormData();
    formData.set('email', email);
    formData.set('password', password);
    const result = await loginWithPassword(formData);

    if (result.error) {
      setErrorText(result.message);
      setIsLoading(false);
      return;
    }

    const dbRole = result.role || 'CUSTOMER';
    if (dbRole === 'MERCHANT') router.push('/merchant/dashboard');
    else if (dbRole === 'DRIVER') router.push('/driver/dashboard');
    else if (dbRole === 'ADMIN' || dbRole === 'QA_TESTER') router.push('/admin/dashboard');
    else {
      const redirectTo = new URLSearchParams(window.location.search).get('redirect');
      const safeRedirect = redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
        ? redirectTo
        : '/restaurants';
      router.push(safeRedirect);
    }

    router.refresh();
  };

  const signInWithProvider = async (provider: 'google') => {
    setIsLoading(true);
    setErrorText('');
    const supabase = createClient();
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
        setErrorText(`Failed to connect with ${provider}: ${error.message}`);
        setIsLoading(false);
    }
  };

  return (
    <div className="ts-fig ts-fig-auth-page">
      <SiteHeader />

      <main className="ts-fig-auth">
        <div className="ts-fig-auth-grid">
          <aside className="ts-fig-auth-side">
            <div
              className="ts-fig-auth-side-image"
              style={{ backgroundImage: "url('/community_section.png')" }}
              aria-hidden="true"
            />
            <div className="ts-fig-auth-side-inner">
              <span className="ts-fig-chip">
                <span className="ts-fig-chip-dot" />
                Welcome back
              </span>
              <h1>
                Sign in to <span className="o">your block.</span>
              </h1>
              <p className="ts-fig-auth-side-sub">
                Your saved addresses, rewards, and order history — right where you left them.
              </p>
              <ul className="ts-fig-auth-perks">
                {[
                  ["Order faster", "Save addresses, past orders, and checkout details."],
                  ["Track live", "Follow prep and delivery progress in one place."],
                  ["Switch roles", "Customer, merchant, and driver access stays organized."],
                ].map(([title, desc], index) => (
                  <li key={title}>
                    <span className="ts-fig-auth-perk-dot">{index + 1}</span>
                    <div>
                      <strong>{title}</strong>
                      <span>{desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <section className="ts-fig-auth-form">
            <span className="ts-fig-kicker">Account access</span>
            <h2>Sign in</h2>
            <p className="ts-fig-auth-form-sub">
              Access your TrueServe account and continue your order flow.
            </p>

            {errorText && (
              <div className="ts-fig-auth-error" role="alert">
                {errorText}
              </div>
            )}

            <div className="ts-fig-auth-roles" role="tablist" aria-label="Sign in as">
              <button
                type="button"
                role="tab"
                aria-selected={role === 'customer'}
                className={role === 'customer' ? 'is-active' : ''}
                onClick={() => { setRole('customer'); setErrorText(''); }}
              >
                Customer
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={role === 'merchant'}
                className={role === 'merchant' ? 'is-active' : ''}
                onClick={() => { setRole('merchant'); setErrorText(''); }}
              >
                Merchant
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={role === 'driver'}
                className={role === 'driver' ? 'is-active' : ''}
                onClick={() => { setRole('driver'); setErrorText(''); }}
              >
                Driver
              </button>
            </div>

            <form className="ts-fig-auth-fields" onSubmit={doLogin}>
              <label className="ts-fig-auth-field">
                <span>Email address</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorText(''); }}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </label>
              <label className="ts-fig-auth-field">
                <span>Password</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorText(''); }}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </label>

              <div className="ts-fig-auth-forgot">
                <Link href="/forgot-password">Forgot password?</Link>
              </div>

              <button
                type="submit"
                className="ts-fig-btn ts-fig-auth-submit"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>

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

            <p className="ts-fig-auth-foot">
              {role === 'customer' ? (
                <>Don&apos;t have an account? <Link href="/signup">Sign up free</Link></>
              ) : role === 'merchant' ? (
                <>No account yet? <Link href="/merchant/signup">Sign up as Merchant</Link></>
              ) : (
                <>No account yet? <Link href="/driver/signup">Sign up as Driver</Link></>
              )}
            </p>

            {IS_DEV && (
              <div className="ts-fig-auth-dev">
                <p>Dev / QA Only</p>
                <button type="button" onClick={() => handleDevBypass('customer@demo.test', 'password123', 'Demo Customer')} disabled={isLoading}>
                  Sign in as Demo Customer →
                </button>
                <button type="button" onClick={() => handleDevBypass('merchant@demo.test', 'password123', 'Demo Merchant')} disabled={isLoading}>
                  Sign in as Demo Merchant →
                </button>
                <button type="button" onClick={() => handleDevBypass('qa@trueserve.delivery', 'TrueServeQA_2026!', 'QA Tester')} disabled={isLoading}>
                  Sign in as QA Tester →
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
