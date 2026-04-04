"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'customer' | 'merchant' | 'driver'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const doLogin = async () => {
    if (!email || !password) {
      alert('Please enter your email and password.');
      return;
    }
    
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        alert(error.message);
        setIsLoading(false);
        return;
    }

    // Role-based routing
    if (role === 'merchant') router.push('/merchant/dashboard');
    else if (role === 'driver') router.push('/driver/dashboard');
    else router.push('/');
  };

  const signInWithProvider = async (provider: 'google' | 'apple') => {
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
    <div className="min-h-screen bg-[#0c0e13] text-white">
      <nav>
        <Logo size="sm" />
      </nav>

      <main id="view-login" className="active">
        <div className="home-bg-img"></div>
        <div className="home-bg-grad"></div>
        <div className="login-box">
          <Link href="/" className="back">← Home</Link>
          <h2>Welcome back</h2>
          <p className="lead">Sign in to your TrueServe account.</p>

          {/* Role selector */}
          <div className="role-tabs">
            <button 
              className={`role-tab ${role === 'customer' ? 'on' : ''}`} 
              onClick={() => setRole('customer')}
            >
              🍽 Customer
            </button>
            <button 
              className={`role-tab ${role === 'merchant' ? 'on' : ''}`} 
              onClick={() => setRole('merchant')}
            >
              🏪 Merchant
            </button>
            <button 
              className={`role-tab ${role === 'driver' ? 'on' : ''}`} 
              onClick={() => setRole('driver')}
            >
              🚗 Driver
            </button>
          </div>

          <div className="fg">
            <label>Email address</label>
            <input 
              type="email" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="fg" style={{ marginTop: '10px' }}>
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div style={{ textAlign: 'right', margin: '8px 0 16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--gold)', cursor: 'pointer' }}>
              Forgot password?
            </span>
          </div>

          <button 
            className="place-btn" 
            style={{ marginTop: 0 }} 
            onClick={doLogin}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In →"}
          </button>

          <div className="login-or">or continue with</div>
          
          <div className="grid grid-cols-1 gap-3">
              <button className="social-btn" onClick={() => signInWithProvider('google')} disabled={isLoading}>
                <span style={{ fontSize: '16px' }}>G</span> Continue with Google
              </button>
              <button className="social-btn" onClick={() => signInWithProvider('apple')} disabled={isLoading}>
                <span style={{ fontSize: '16px' }}></span> Continue with Apple
              </button>
          </div>

          <div className="login-foot">
            {role === 'customer' ? (
              <>Don't have an account? <Link href="/signup">Sign up</Link></>
            ) : role === 'merchant' ? (
              <>No account yet? <Link href="/merchant/signup">Sign up as Merchant</Link></>
            ) : (
              <>No account yet? <Link href="/driver/signup">Sign up as Driver</Link></>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
