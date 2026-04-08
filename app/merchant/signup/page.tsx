"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from "@/components/Logo";

export default function MerchantSignupPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  return (
    <div className="food-app-shell">
      <nav className="food-app-nav">
        <Logo size="sm" />
      </nav>

      <main className="food-auth-wrap">
        <div className="food-auth-grid">
          <section className="food-hero-card food-auth-hero">
            <div className="food-auth-image" style={{ backgroundImage: "url('/merchant_hero.png')" }} />
            <div className="food-auth-hero-inner">
              <div className="food-eyebrow">Merchant onboarding</div>
              <div className="mt-5 space-y-4">
                <h1 className="food-heading !text-[56px]">Grow Your Restaurant <span className="accent">Without Losing Margin.</span></h1>
                <p className="food-subtitle !max-w-[520px]">
                  A merchant sign-up flow designed for owners and operators with clear setup steps and visuals tailored to restaurant partners.
                </p>
              </div>
              <ul className="food-auth-list">
                <li>
                  <div className="food-auth-icon">1</div>
                  <div>
                    <div className="font-extrabold">Zero platform fees</div>
                    <div className="text-sm text-white/65">Keep more from every order while growing online reach.</div>
                  </div>
                </li>
                <li>
                  <div className="food-auth-icon">2</div>
                  <div>
                    <div className="font-extrabold">Smart operations</div>
                    <div className="text-sm text-white/65">Connect POS, control prep time, and automate busy windows.</div>
                  </div>
                </li>
                <li>
                  <div className="food-auth-icon">3</div>
                  <div>
                    <div className="font-extrabold">Faster go-live</div>
                    <div className="text-sm text-white/65">Get approved quickly and begin accepting delivery orders.</div>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section className="food-panel food-auth-form">
            <Link href="/" className="su-back">← Back to Home</Link>
            <p className="food-kicker mb-3">Restaurant account</p>
            <h1 className="food-heading !text-[36px]">Partner with TrueServe</h1>
            <p className="lead mt-2">Set up your restaurant in minutes with no hidden fees.</p>
            
            <div className="food-auth-gallery">
              <div className="food-auth-thumb"><img src="/merchant_hero.png" alt="Restaurant kitchen operations" /></div>
              <div className="food-auth-thumb"><img src="/merchant_section.png" alt="Restaurant owner working" /></div>
              <div className="food-auth-thumb"><img src="/merchant_login_bg_restaurant.png" alt="Restaurant storefront and dining area" /></div>
            </div>
            
            <div className="prog mt-6">
              <div className={`prog-s ${step >= 1 ? 'on' : ''}`}></div>
              <div className={`prog-s ${step >= 2 ? 'on' : ''}`}></div>
              <div className={`prog-s ${step >= 3 ? 'on' : ''}`}></div>
              <span className="prog-label">{step < 4 ? `Step ${step} of 3` : 'Complete'}</span>
            </div>

            {step === 1 && (
              <div id="ms-1" className="step active">
                <div className="sc">
                  <h3><span className="sn">1</span> Restaurant Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="fg"><label>Restaurant Name</label><input type="text" placeholder="Your restaurant name"/></div>
                    <div className="fg"><label>Cuisine Type</label><input type="text" placeholder="Cuisine category"/></div>
                  </div>
                  <div className="fg"><label>Street Address</label><input type="text" placeholder="123 Main St, City, State"/></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="fg"><label>Phone</label><input type="text" placeholder="+1 (555) 000-0000"/></div>
                    <div className="fg"><label>Owner Name</label><input type="text" placeholder="Jane Doe"/></div>
                  </div>
                  <div className="fg"><label>Email Address</label><input type="text" placeholder="jane@restaurant.com"/></div>
                  <div className="fg"><label>Password</label><input type="password" placeholder="At least 8 characters"/></div>
                </div>
                <button className="place-btn" onClick={() => setStep(2)}>Continue</button>
              </div>
            )}

            {step === 2 && (
              <div id="ms-2" className="step active">
                <div className="sc">
                  <h3><span className="sn">2</span> Business Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="fg"><label>Opens at</label><input type="text" placeholder="11:00 AM"/></div>
                    <div className="fg"><label>Closes at</label><input type="text" placeholder="9:00 PM"/></div>
                  </div>
                  <div className="fg">
                    <label>Go High Level (GHL) Iframe URL (Optional)</label>
                    <input 
                      id="m-ghl-url"
                      type="text" 
                      placeholder="https://api.leadconnectorhq.com/widget/booking/..."
                    />
                    <p style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '4px' }}>
                      Pasting your GHL booking/ordering iframe URL here will enable direct widget ordering.
                    </p>
                  </div>
                  <div className="fg">
                    <label>How did you hear about us?</label>
                    <select className="w-full bg-[#0c0e13] border border-[#1c1f28] rounded-lg p-3">
                      <option>Social media</option>
                      <option>Word of mouth</option>
                      <option>Search engine</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="place-btn" onClick={() => setStep(3)}>Submit Application</button>
                  <button className="btn btn-ghost w-full" onClick={() => setStep(1)}>← Back</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div id="ms-3" className="step active">
                <div className="done-card">
                  <div className="done-ico">🎉</div>
                  <h3>You're in! Application Submitted.</h3>
                  <p>We'll review your application within 24 hours and send setup instructions straight to your inbox.</p>
                  <button className="place-btn" onClick={() => router.push('/merchant/dashboard')}>Go to Portal</button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
