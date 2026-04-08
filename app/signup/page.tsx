"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  return (
    <div className="food-app-shell">
      <nav className="food-app-nav">
        <Logo size="sm" />
      </nav>

      <main className="food-auth-wrap">
        <div className="food-auth-grid">
          <section className="food-hero-card food-auth-hero">
            <div
              className="food-auth-image"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1520201163981-8cc95007dd2e?w=1200&q=80')" }}
            />
            <div className="food-auth-hero-inner">
              <div className="food-eyebrow">Customer onboarding</div>
              <div className="mt-5 space-y-4">
                <h1 className="food-heading !text-[56px]">Make Ordering Feel <span className="accent">Easy.</span></h1>
                <p className="food-subtitle !max-w-[520px]">
                  Create your account, save your address, and move from sign-up to checkout in one clear, consistent experience.
                </p>
              </div>
              <ul className="food-auth-list">
                <li>
                  <div className="food-auth-icon">✓</div>
                  <div>
                    <div className="font-extrabold">Saved delivery details</div>
                    <div className="text-sm text-white/65">Reuse addresses and preferences on future orders.</div>
                  </div>
                </li>
                <li>
                  <div className="food-auth-icon">★</div>
                  <div>
                    <div className="font-extrabold">Faster reorders</div>
                    <div className="text-sm text-white/65">Keep favorites and order history ready to go.</div>
                  </div>
                </li>
                <li>
                  <div className="food-auth-icon">→</div>
                  <div>
                    <div className="font-extrabold">Seamless next step</div>
                    <div className="text-sm text-white/65">Continue straight into restaurant browsing once you finish.</div>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section className="food-panel food-auth-form">
            <Link href="/login" className="back">← Back to login</Link>
            <p className="food-kicker mb-3">Customer account</p>
            <h2 className="food-heading !text-[36px]">Sign Up</h2>
            <p className="lead mt-2">Create your account and start ordering from nearby restaurants.</p>

            <div className="prog mt-6">
              <div className={`prog-s ${step >= 1 ? 'on' : ''}`}></div>
              <div className={`prog-s ${step >= 2 ? 'on' : ''}`}></div>
              <span className="prog-label">{step === 1 ? "Step 1 of 2" : "Step 2 of 2"}</span>
            </div>

            {step === 1 && (
              <div className="step active">
                <div className="sc">
                  <h3><span className="sn">1</span> Account Basics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="fg"><label>First Name</label><input type="text" placeholder="Jordan" /></div>
                    <div className="fg"><label>Last Name</label><input type="text" placeholder="Lee" /></div>
                  </div>
                  <div className="fg"><label>Email Address</label><input type="email" placeholder="jordan@example.com" /></div>
                  <div className="fg"><label>Phone Number</label><input type="tel" placeholder="(555) 000-0000" /></div>
                  <div className="fg"><label>Create Password</label><input type="password" placeholder="At least 8 characters" /></div>
                </div>
                <button className="place-btn" onClick={() => setStep(2)}>Continue</button>
              </div>
            )}

            {step === 2 && (
              <div className="step active">
                <div className="sc">
                  <h3><span className="sn">2</span> Delivery Setup</h3>
                  <div className="fg"><label>Home Address</label><input type="text" placeholder="123 Main St, Apt 4B" /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="fg"><label>City</label><input type="text" placeholder="Charlotte" /></div>
                    <div className="fg"><label>ZIP Code</label><input type="text" placeholder="28202" /></div>
                  </div>
                  <div className="fg">
                    <label>Delivery Notes</label>
                    <textarea placeholder="Gate code, building entry, or leave at door." rows={3} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="place-btn" onClick={() => router.push("/restaurants")}>Create Account</button>
                  <button className="btn btn-ghost w-full" onClick={() => setStep(1)}>← Back</button>
                </div>
              </div>
            )}

            <div className="food-auth-note">
              Already have an account? <Link href="/login" className="text-[#e8a230] font-bold">Sign in</Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
