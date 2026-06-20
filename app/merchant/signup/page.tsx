"use client";

import React, { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { submitMerchantInquiry } from "@/app/merchant/actions";
import { ArrowRight, CheckCircle2, ChefHat, Clock3, Mail, ShieldCheck } from "lucide-react";

export default function MerchantSignupPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [zip, setZip] = useState("");
  const [plan, setPlan] = useState("Flex Options");
  const [posSystem, setPosSystem] = useState("Toast");
  const [posClientId, setPosClientId] = useState("");
  const [posClientSecret, setPosClientSecret] = useState("");
  const [ghlUrl, setGhlUrl] = useState("");
  const [stateData, formAction, isPending] = useActionState(submitMerchantInquiry, { message: "" });

  useEffect(() => {
    if (stateData?.success) {
      setStep(3);
    }
  }, [stateData?.success]);

  return (
    <div className="ts-fig ts-fig-merchant-signup-page">
      <SiteHeader />

      <main className="ts-fig-auth">
        <div className="ts-fig-auth-grid">
          <aside className="ts-fig-auth-side">
            <div
              className="ts-fig-auth-side-image"
              style={{ backgroundImage: "url('/merchant_hero.png')" }}
              aria-hidden="true"
            />
            <div className="ts-fig-auth-side-inner">
              <span className="ts-fig-chip">
                <span className="ts-fig-chip-dot" />
                Founding partner program
              </span>
              <h1>
                Grow your kitchen <span className="o">on fair terms.</span>
              </h1>
              <p className="ts-fig-auth-side-sub">
                Join as a Founding Partner — 30 days free, your rate locked forever, and lower commission than other platforms.
              </p>
              <ul className="ts-fig-auth-perks">
                <li>
                  <span className="ts-fig-auth-perk-dot">1</span>
                  <div>
                    <strong>30 days free</strong>
                    <span>No charge for your first month. Start taking orders risk-free.</span>
                  </div>
                </li>
                <li>
                  <span className="ts-fig-auth-perk-dot">2</span>
                  <div>
                    <strong>Rate locked forever</strong>
                    <span>Your founding rate never increases — even as TrueServe grows.</span>
                  </div>
                </li>
                <li>
                  <span className="ts-fig-auth-perk-dot">3</span>
                  <div>
                    <strong>15% commission, not 30%</strong>
                    <span>Keep more of every order. Build direct customer relationships.</span>
                  </div>
                </li>
              </ul>
            </div>
          </aside>

          <section className="ts-fig-auth-form">
            <span className="ts-fig-kicker">Restaurant application</span>
            <h2>Apply as a founding partner</h2>
            <p className="ts-fig-auth-form-sub">
              Apply in a few minutes. We review every restaurant before dashboard access opens, then email launch steps within one business day.
            </p>

            {stateData?.message && (
              <div className={`ts-fig-auth-banner ${stateData.error ? "is-error" : "is-success"}`} role="alert">
                {stateData.message}
              </div>
            )}

            <div className="ts-fig-auth-steps" aria-label={`Step ${step} of 3`}>
              <div className={`ts-fig-auth-step-dot${step >= 1 ? " is-on" : ""}`} />
              <div className={`ts-fig-auth-step-dot${step >= 2 ? " is-on" : ""}`} />
              <div className={`ts-fig-auth-step-dot${step >= 3 ? " is-on" : ""}`} />
              <span>{step < 3 ? `Step ${step} of 2` : "Complete"}</span>
            </div>

            {step < 3 && (
              <div className="ts-fig-auth-review-strip" aria-label="Merchant review process">
                <span><CheckCircle2 size={15} aria-hidden="true" /> Submit details</span>
                <span><ShieldCheck size={15} aria-hidden="true" /> Admin review</span>
                <span><Clock3 size={15} aria-hidden="true" /> Email update in 1 business day</span>
              </div>
            )}

            <form action={formAction} className="ts-fig-auth-fields">
              <input type="hidden" name="restaurantName" value={restaurantName} />
              <input type="hidden" name="cuisineType" value={cuisineType} />
              <input type="hidden" name="contactName" value={contactName} />
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="password" value={password} />
              <input type="hidden" name="address" value={address} />
              <input type="hidden" name="phone" value={phone} />
              <input type="hidden" name="city" value={city} />
              <input type="hidden" name="state" value={stateName} />
              <input type="hidden" name="zip" value={zip} />
              <input type="hidden" name="plan" value={plan} />
              <input type="hidden" name="posSystem" value={posSystem} />
              <input type="hidden" name="posClientId" value={posClientId} />
              <input type="hidden" name="posClientSecret" value={posClientSecret} />
              <input type="hidden" name="ghlUrl" value={ghlUrl} />

              {step === 1 && (
                <>
                  <div className="ts-fig-auth-row">
                    <label className="ts-fig-auth-field">
                      <span>Restaurant name</span>
                      <input type="text" placeholder="Your restaurant name" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} required />
                    </label>
                    <label className="ts-fig-auth-field">
                      <span>Cuisine type</span>
                      <input type="text" placeholder="Italian, Mexican, etc." value={cuisineType} onChange={(e) => setCuisineType(e.target.value)} />
                    </label>
                  </div>
                  <label className="ts-fig-auth-field">
                    <span>Street address</span>
                    <input type="text" placeholder="123 Main St" value={address} onChange={(e) => setAddress(e.target.value)} required />
                  </label>
                  <div className="ts-fig-auth-row">
                    <label className="ts-fig-auth-field">
                      <span>Phone</span>
                      <input type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </label>
                    <label className="ts-fig-auth-field">
                      <span>Owner name</span>
                      <input type="text" placeholder="Jane Doe" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
                    </label>
                  </div>
                  <label className="ts-fig-auth-field">
                    <span>Email address</span>
                    <input type="email" placeholder="jane@restaurant.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                  </label>
                  <label className="ts-fig-auth-field">
                    <span>Password</span>
                    <input type="password" placeholder="At least 8 characters" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
                  </label>

                  <button
                    type="button"
                    className="ts-fig-btn ts-fig-auth-submit"
                    onClick={() => setStep(2)}
                    disabled={isPending || !restaurantName || !contactName || !email || !password || !address || !phone}
                  >
                    Continue →
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="ts-fig-auth-row ts-fig-auth-row-3">
                    <label className="ts-fig-auth-field">
                      <span>City</span>
                      <input type="text" placeholder="Charlotte" value={city} onChange={(e) => setCity(e.target.value)} required />
                    </label>
                    <label className="ts-fig-auth-field">
                      <span>State</span>
                      <input type="text" placeholder="NC" value={stateName} onChange={(e) => setStateName(e.target.value)} required />
                    </label>
                    <label className="ts-fig-auth-field">
                      <span>ZIP</span>
                      <input type="text" placeholder="28202" value={zip} onChange={(e) => setZip(e.target.value)} required />
                    </label>
                  </div>
                  <label className="ts-fig-auth-field">
                    <span>Plan</span>
                    <select value={plan} onChange={(e) => setPlan(e.target.value)}>
                      <option value="Flex Options">Flex Options</option>
                      <option value="Pro Subscription">Pro Subscription</option>
                    </select>
                  </label>
                  <label className="ts-fig-auth-field">
                    <span>POS system</span>
                    <select value={posSystem} onChange={(e) => setPosSystem(e.target.value)}>
                      <option value="Toast">Toast</option>
                      <option value="Square">Square</option>
                      <option value="None">None</option>
                    </select>
                  </label>
                  <div className="ts-fig-auth-row">
                    <label className="ts-fig-auth-field">
                      <span>POS client ID (optional)</span>
                      <input type="text" placeholder="Client ID" value={posClientId} onChange={(e) => setPosClientId(e.target.value)} />
                    </label>
                    <label className="ts-fig-auth-field">
                      <span>POS client secret (optional)</span>
                      <input type="password" placeholder="Client secret" value={posClientSecret} onChange={(e) => setPosClientSecret(e.target.value)} />
                    </label>
                  </div>
                  <label className="ts-fig-auth-field">
                    <span>Go High Level (GHL) iframe URL (optional)</span>
                    <input id="m-ghl-url" type="text" placeholder="https://api.leadconnectorhq.com/widget/booking/..." value={ghlUrl} onChange={(e) => setGhlUrl(e.target.value)} />
                    <small>Pasting your GHL booking/ordering iframe URL here will enable direct widget ordering.</small>
                  </label>

                  <button className="ts-fig-btn ts-fig-auth-submit" type="submit" disabled={isPending || !city || !stateName || !zip}>
                    {isPending ? "Submitting..." : "Submit application"}
                  </button>
                  <button type="button" className="ts-fig-auth-ghost" onClick={() => setStep(1)} disabled={isPending}>
                    ← Back
                  </button>
                </>
              )}
            </form>

            {step === 3 && (
              <div className="ts-fig-auth-done">
                <div className="ts-fig-auth-done-icon">✓</div>
                <h3>Application received.</h3>
                <p>
                  TrueServe will review your restaurant details and email approval status within one business day.
                  After approval, you’ll receive dashboard access and a launch checklist for menu, Stripe, and POS setup.
                </p>
                <div className="ts-fig-auth-next-steps">
                  <span><Mail size={15} aria-hidden="true" /> Watch your inbox for approval</span>
                  <span><ShieldCheck size={15} aria-hidden="true" /> Admin review is required before going live</span>
                  <span><ChefHat size={15} aria-hidden="true" /> Menu setup starts after approval</span>
                </div>
                <button className="ts-fig-btn" onClick={() => router.push('/merchant')}>Back to merchant page <ArrowRight size={17} aria-hidden="true" /></button>
              </div>
            )}

            <p className="ts-fig-auth-foot">
              Already a partner? <Link href="/login">Sign in to dashboard</Link>
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
