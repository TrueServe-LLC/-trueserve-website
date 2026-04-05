"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";

export default function DriverSignupPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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

      <main id="view-driver-signup" className="active">
        <div className="signup-page">
          {/* LEFT PANEL */}
          <div className="signup-left">
            <div className="signup-left-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80')" }}></div>
            <div className="signup-left-overlay"></div>
            <div className="signup-left-content">
              <div className="su-tag">For Our Drivers</div>
              <h2>Drive with TrueServe.<br />Earn on your terms.</h2>
              <p className="su-desc">Join the most driver-friendly fleet in the city. High pay, total flexibility, and a support team that actually answers.</p>
              <div className="su-perks">
                <div className="su-perk">
                  <div className="su-perk-ico">💵</div>
                  <div className="su-perk-text">
                    <div className="su-perk-title">Elite Pay Rates</div>
                    <div className="su-perk-desc">Earn 20-30% more than other platforms with our fair pay model.</div>
                  </div>
                </div>
                <div className="su-perk">
                  <div className="su-perk-ico">📍</div>
                  <div className="su-perk-text">
                    <div className="su-perk-title">Smart Dispatch</div>
                    <div className="su-perk-desc">AI-optimized routes mean less idling and more deliveries per hour.</div>
                  </div>
                </div>
                <div className="su-perk">
                  <div className="su-perk-ico">⚡️</div>
                  <div className="su-perk-text">
                    <div className="su-perk-title">Instant Cashout</div>
                    <div className="su-perk-desc">Get paid the same day you drive. No waiting for weekly deposits.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="signup-right">
            <Link href="/" className="su-back">← Back to Home</Link>
            <h1>Join the Fleet</h1>
            <p className="lead">5 minutes to apply. Approval usually within 24 hours.</p>
            
            <div className="prog">
              <div className={`prog-s ${step >= 1 ? 'on' : ''}`}></div>
              <div className={`prog-s ${step >= 2 ? 'on' : ''}`}></div>
              <div className={`prog-s ${step >= 3 ? 'on' : ''}`}></div>
              <span className="prog-label">{step < 4 ? `Step ${step} of 3` : '✓ Approved!'}</span>
            </div>

            {step === 1 && (
              <div className="mb-8 p-6 bg-[#0f1219] border border-dashed border-[#1c1f28] rounded-2xl text-center">
                 <p className="text-[10px] uppercase font-black tracking-widest text-[#444] mb-4">Fast-Track Application</p>
                 <div className="grid grid-cols-1 gap-3">
                    <button className="social-btn" onClick={() => signInWithProvider('google')} disabled={isLoading} style={{ width: '100%', padding: '14px', background: '#0c0e13', border: '1px solid #1c1f28', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      <span style={{ fontSize: '14px', color: '#e8a230' }}>G</span> Google Sync
                    </button>
                    <button className="social-btn" onClick={() => signInWithProvider('apple')} disabled={isLoading} style={{ width: '100%', padding: '14px', background: '#0c0e13', border: '1px solid #1c1f28', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      <span style={{ fontSize: '14px' }}></span> Apple Identity
                    </button>
                 </div>
                 <div className="login-or" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0', color: '#222', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <div style={{ flex: 1, height: '1px', background: '#1c1f28' }}></div>
                  or manual entry
                  <div style={{ flex: 1, height: '1px', background: '#1c1f28' }}></div>
                 </div>
              </div>
            )}

            {step === 1 && (
              <div id="ds-1" className="step active">
                <div className="sc">
                  <h3><span className="sn">1</span> Personal Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="fg"><label>First Name</label><input type="text" placeholder="Alex"/></div>
                    <div className="fg"><label>Last Name</label><input type="text" placeholder="Smith"/></div>
                  </div>
                  <div className="fg"><label>Email Address</label><input type="email" placeholder="alex@example.com"/></div>
                  <div className="fg"><label>Phone Number</label><input type="tel" placeholder="(555) 000-0000"/></div>
                  <div className="fg"><label>Create Password</label><input type="password" placeholder="At least 8 characters"/></div>
                </div>
                <button className="place-btn" onClick={() => setStep(2)}>Next: Vehicle →</button>
              </div>
            )}

            {step === 2 && (
              <div id="ds-2" className="step active">
                <div className="sc">
                  <h3><span className="sn">2</span> Vehicle & Zone</h3>
                  <div className="fg">
                    <label>What do you drive?</label>
                    <select className="w-full bg-[#0c0e13] border border-[#1c1f28] rounded-lg p-3">
                      <option>Car (Sedan/SUV)</option>
                      <option>Bicycle</option>
                      <option>Scooter / Moped</option>
                      <option>Motorcycle</option>
                    </select>
                  </div>
                  <div className="fg"><label>Primary Zone</label><input type="text" placeholder="e.g. Fayetteville, NC"/></div>
                  <div className="fg"><label>Referral Code (Optional)</label><input type="text" placeholder="XXXXXX"/></div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="place-btn" onClick={() => setStep(3)}>Submit Application →</button>
                  <button className="btn btn-ghost w-full" onClick={() => setStep(1)}>← Back</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div id="ds-3" className="step active">
                <div className="done-card">
                  <div className="done-ico">🚚</div>
                  <h3>Application Received!</h3>
                  <p>Thanks for applying! Our onboarding team will review your info and reach out via SMS within 24 hours.</p>
                  <button className="place-btn" onClick={() => router.push('/')}>Back to Home →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
