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
            <div className="food-auth-image" style={{ backgroundImage: "url('/diverse_drivers.png')" }} />
            <div className="food-auth-hero-inner">
              <div className="food-eyebrow">Driver onboarding</div>
              <div className="mt-5 space-y-4">
                <h1 className="food-heading !text-[56px]">Drive With TrueServe. <span className="accent">Earn More Per Hour.</span></h1>
                <p className="food-subtitle !max-w-[520px]">
                  The driver sign-up flow now follows the same visual language while using imagery and content made for delivery partners.
                </p>
              </div>
              <ul className="food-auth-list">
                <li>
                  <div className="food-auth-icon">1</div>
                  <div>
                    <div className="font-extrabold">Higher earning potential</div>
                    <div className="text-sm text-white/65">Competitive payouts with fair routing logic.</div>
                  </div>
                </li>
                <li>
                  <div className="food-auth-icon">2</div>
                  <div>
                    <div className="font-extrabold">Smart dispatch</div>
                    <div className="text-sm text-white/65">Fewer dead miles and better trip density.</div>
                  </div>
                </li>
                <li>
                  <div className="food-auth-icon">3</div>
                  <div>
                    <div className="font-extrabold">Flexible schedule</div>
                    <div className="text-sm text-white/65">Drive when it fits your day and cash out quickly.</div>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section className="food-panel food-auth-form">
            <Link href="/" className="su-back">← Back to Home</Link>
            <p className="food-kicker mb-3">Driver account</p>
            <h1 className="food-heading !text-[36px]">Join the Fleet</h1>
            <p className="lead mt-2">Apply in minutes and start delivering with confidence.</p>

            <div className="food-auth-gallery">
              <div className="food-auth-thumb"><img src="/diverse_drivers.png" alt="Friendly team of delivery drivers" /></div>
              <div className="food-auth-thumb"><img src="/driver_section.png" alt="Driver using delivery app" /></div>
              <div className="food-auth-thumb"><img src="/driver_login_bg_car.png" alt="Driver ready for deliveries" /></div>
            </div>
            
            <div className="prog mt-6">
              <div className={`prog-s ${step >= 1 ? 'on' : ''}`}></div>
              <div className={`prog-s ${step >= 2 ? 'on' : ''}`}></div>
              <div className={`prog-s ${step >= 3 ? 'on' : ''}`}></div>
              <span className="prog-label">{step < 4 ? `Step ${step} of 3` : 'Approved'}</span>
            </div>

            {step === 1 && (
              <div className="mb-8 p-6 bg-[#0f1219] border border-dashed border-[#1c1f28] rounded-2xl text-center">
                 <p className="text-[10px] uppercase font-black tracking-widest text-[#444] mb-4">Fast-Track Application</p>
                 <div className="grid grid-cols-1 gap-3">
                    <button className="social-btn" onClick={() => signInWithProvider('google')} disabled={isLoading} style={{ width: '100%', padding: '14px', background: '#0c0e13', border: '1px solid #1c1f28', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      <span style={{ fontSize: '14px', color: '#e8a230' }}>G</span> Google Sync
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
                <button className="place-btn" onClick={() => setStep(2)}>Next: Vehicle</button>
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
                  <button className="place-btn" onClick={() => setStep(3)}>Submit Application</button>
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
                  <button className="place-btn" onClick={() => router.push('/')}>Back to Home</button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
