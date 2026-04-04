"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from "@/components/Logo";

export default function MerchantSignupPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0c0e13] text-white">
      <nav>
        <Logo size="sm" />
      </nav>

      <main id="view-merchant-signup" className="active">
        <div className="signup-page">
          {/* LEFT PANEL */}
          <div className="signup-left">
            <div className="signup-left-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80')" }}></div>
            <div className="signup-left-overlay"></div>
            <div className="signup-left-content">
              <div className="su-tag">For Restaurant Partners</div>
              <h2>Grow your restaurant with TrueServe</h2>
              <p className="su-desc">Join a platform built for local restaurants — not against them. Zero platform fees, real tools, real support.</p>
              <div className="su-perks">
                <div className="su-perk">
                  <div className="su-perk-ico">💸</div>
                  <div className="su-perk-text">
                    <div className="su-perk-title">Zero Platform Fees</div>
                    <div className="su-perk-desc">Keep 100% of your revenue. We earn when you earn.</div>
                  </div>
                </div>
                <div className="su-perk">
                  <div className="su-perk-ico">🤖</div>
                  <div className="su-perk-text">
                    <div className="su-perk-title">AI Menu Scanner</div>
                    <div className="su-perk-desc">Snap a photo of your menu and we build it for you instantly.</div>
                  </div>
                </div>
                <div className="su-perk">
                  <div className="su-perk-ico">🖥</div>
                  <div className="su-perk-text">
                    <div className="su-perk-title">POS Integration</div>
                    <div className="su-perk-desc">Works with Toast, Square, Clover and more — orders sync automatically.</div>
                  </div>
                </div>
              </div>
              <div className="su-quote">
                <p>"TrueServe helped us double our delivery orders in the first month — and we kept every dollar."</p>
                <div className="su-quoter">— Dhan Griffin, Dhan's Kitchen</div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="signup-right">
            <Link href="/" className="su-back">← Back to Home</Link>
            <h1>Partner with TrueServe</h1>
            <p className="lead">Set up your restaurant in minutes. No hidden fees, ever.</p>
            
            <div className="prog">
              <div className={`prog-s ${step >= 1 ? 'on' : ''}`}></div>
              <div className={`prog-s ${step >= 2 ? 'on' : ''}`}></div>
              <div className={`prog-s ${step >= 3 ? 'on' : ''}`}></div>
              <span className="prog-label">{step < 4 ? `Step ${step} of 3` : '✓ Complete!'}</span>
            </div>

            {step === 1 && (
              <div id="ms-1" className="step active">
                <div className="sc">
                  <h3><span className="sn">1</span> Restaurant Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="fg"><label>Restaurant Name</label><input type="text" placeholder="e.g. Dhan's Kitchen"/></div>
                    <div className="fg"><label>Cuisine Type</label><input type="text" placeholder="e.g. Caribbean"/></div>
                  </div>
                  <div className="fg"><label>Street Address</label><input type="text" placeholder="123 Main St, City, State"/></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="fg"><label>Phone</label><input type="text" placeholder="+1 (555) 000-0000"/></div>
                    <div className="fg"><label>Owner Name</label><input type="text" placeholder="Jane Doe"/></div>
                  </div>
                  <div className="fg"><label>Email Address</label><input type="text" placeholder="jane@restaurant.com"/></div>
                  <div className="fg"><label>Password</label><input type="password" placeholder="At least 8 characters"/></div>
                </div>
                <button className="place-btn" onClick={() => setStep(2)}>Continue →</button>
              </div>
            )}

            {step === 2 && (
              <div id="ms-2" className="step active">
                <div className="sc">
                  <h3><span className="sn">2</span> Business Details</h3>
                  <div className="fg"><label>EIN / Tax ID</label><input type="text" placeholder="XX-XXXXXXX"/></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="fg"><label>Opens at</label><input type="text" placeholder="11:00 AM"/></div>
                    <div className="fg"><label>Closes at</label><input type="text" placeholder="9:00 PM"/></div>
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
                  <button className="place-btn" onClick={() => setStep(3)}>Submit Application →</button>
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
                  <button className="place-btn" onClick={() => router.push('/merchant/dashboard')}>Go to Portal →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
