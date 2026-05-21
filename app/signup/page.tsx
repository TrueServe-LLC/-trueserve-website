"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState, Suspense } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { signupWithPassword } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { Camera, Home, Mail, MapPin, Moon, Phone, ShieldCheck, UserRound, UtensilsCrossed } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("foodie");
  const [locationPersona, setLocationPersona] = useState("home");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [stateData, formAction, isPending] = useActionState(signupWithPassword, { message: "" });

  const signInWithProvider = async (provider: "google" | "apple") => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/restaurants")}`,
        queryParams: provider === "google" ? { prompt: "select_account" } : undefined,
      },
    });
  };

  useEffect(() => {
    if (stateData?.success) {
      router.push("/restaurants");
      router.refresh();
    }
  }, [stateData?.success, router]);

  return (
    <div className="ts-fig ts-fig-auth-page">
      <SiteHeader />

      <main className="ts-fig-auth">
        <div className="ts-fig-auth-grid">
          <aside className="ts-fig-auth-side">
            <div
              className="ts-fig-auth-side-image"
              style={{ backgroundImage: "url('/hero_food_delivery.png')" }}
              aria-hidden="true"
            />
            <div className="ts-fig-auth-side-inner">
              <span className="ts-fig-chip">
                <span className="ts-fig-chip-dot" />
                Customer onboarding
              </span>
              <h1>
                Make ordering feel <span className="o">easy.</span>
              </h1>
              <p className="ts-fig-auth-side-sub">
                Save addresses, earn TruePoints from your first order, and unlock anniversary perks every year you stay.
              </p>
              <ul className="ts-fig-auth-perks">
                <li>
                  <span className="ts-fig-auth-perk-dot">1</span>
                  <div>
                    <strong>Delivery profile</strong>
                    <span>Save drop-off notes, location labels, and preferences.</span>
                  </div>
                </li>
                <li>
                  <span className="ts-fig-auth-perk-dot">2</span>
                  <div>
                    <strong>Driver clarity</strong>
                    <span>Add a permanent drop-off photo so drivers know the exact spot.</span>
                  </div>
                </li>
                <li>
                  <span className="ts-fig-auth-perk-dot">3</span>
                  <div>
                    <strong>Rewards ready</strong>
                    <span>Start earning TruePoints as soon as you place an order.</span>
                  </div>
                </li>
              </ul>
            </div>
          </aside>

          <section className="ts-fig-auth-form">
            <span className="ts-fig-kicker">Customer account</span>
            <h2>Create your profile</h2>
            <p className="ts-fig-auth-form-sub">Set up ordering, rewards, and delivery accuracy in two quick steps.</p>

            {refCode && (
              <div className="ts-fig-auth-banner is-info" role="status">
                Referral applied — your first delivery fee is on us.
              </div>
            )}

            {stateData?.message && (
              <div className={`ts-fig-auth-banner ${stateData.error ? "is-error" : "is-success"}`} role="alert">
                {stateData.message}
              </div>
            )}

            <div className="ts-fig-auth-steps" aria-label={`Step ${step} of 2`}>
              <div className={`ts-fig-auth-step-dot${step >= 1 ? " is-on" : ""}`} />
              <div className={`ts-fig-auth-step-dot${step >= 2 ? " is-on" : ""}`} />
              <span>Step {step} of 2</span>
            </div>

            <form action={formAction} className="ts-fig-auth-fields">
              <input type="hidden" name="role" value="CUSTOMER" />
              <input type="hidden" name="plan" value="Basic" />
              {refCode && <input type="hidden" name="referredBy" value={refCode} />}
              <input type="hidden" name="name" value={(email.split("@")[0] || phone || "TrueServe Customer").trim()} />
              <input type="hidden" name="address" value={[addressLine, city, zip].filter(Boolean).join(", ")} />
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="phone" value={phone} />
              <input type="hidden" name="password" value={password} />

              {step === 1 && (
                <>
                  <div className="ts-fig-auth-oauth-row">
                    <button type="button" className="ts-fig-auth-oauth" onClick={() => signInWithProvider("google")}>
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
                      </svg>
                      Google
                    </button>
                    <button type="button" className="ts-fig-auth-oauth" onClick={() => signInWithProvider("apple")}>
                      <UserRound size={16} aria-hidden="true" />
                      Apple
                    </button>
                  </div>

                  <div className="ts-fig-auth-divider"><span>or with email</span></div>

                  <label className="ts-fig-auth-field">
                    <span>Mobile number</span>
                    <input type="tel" placeholder="(555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required autoComplete="tel" />
                  </label>
                  <label className="ts-fig-auth-field">
                    <span>Email address</span>
                    <input type="email" placeholder="jordan@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                  </label>
                  <label className="ts-fig-auth-field">
                    <span>Create password</span>
                    <input type="password" placeholder="At least 8 characters" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
                  </label>

                  <button
                    type="button"
                    className="ts-fig-btn ts-fig-auth-submit"
                    onClick={() => setStep(2)}
                    disabled={!phone || !email || !password || isPending}
                  >
                    Continue →
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <fieldset className="ts-fig-auth-fieldset">
                    <legend>Avatar style</legend>
                    <div className="ts-fig-auth-pills">
                      {[
                        { id: "foodie", label: "The Foodie", icon: UtensilsCrossed },
                        { id: "night", label: "Night Owl", icon: Moon },
                        { id: "fresh", label: "Fresh Pick", icon: ShieldCheck },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={avatar === item.id ? "is-active" : ""}
                            onClick={() => setAvatar(item.id)}
                          >
                            <Icon size={14} aria-hidden="true" />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <fieldset className="ts-fig-auth-fieldset">
                    <legend>Saved location</legend>
                    <div className="ts-fig-auth-pills">
                      {[
                        { id: "home", label: "Home", icon: Home },
                        { id: "work", label: "Work", icon: MapPin },
                        { id: "night", label: "Night Out", icon: Moon },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={locationPersona === item.id ? "is-active" : ""}
                            onClick={() => setLocationPersona(item.id)}
                          >
                            <Icon size={14} aria-hidden="true" />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <label className="ts-fig-auth-field">
                    <span>Home address</span>
                    <input type="text" placeholder="123 Main St, Apt 4B" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} required />
                  </label>
                  <div className="ts-fig-auth-row">
                    <label className="ts-fig-auth-field">
                      <span>City</span>
                      <input type="text" placeholder="Charlotte" value={city} onChange={(e) => setCity(e.target.value)} required />
                    </label>
                    <label className="ts-fig-auth-field">
                      <span>ZIP code</span>
                      <input type="text" placeholder="28202" value={zip} onChange={(e) => setZip(e.target.value)} required />
                    </label>
                  </div>
                  <label className="ts-fig-auth-field">
                    <span>Delivery notes</span>
                    <textarea placeholder="Gate code, building entry, or leave at door." rows={3} />
                  </label>

                  <label className="ts-fig-auth-upload">
                    <Camera size={18} aria-hidden="true" />
                    <div>
                      <strong>Delivery drop-off photo</strong>
                      <span>Upload a permanent photo of the exact door, gate, porch, or handoff spot.</span>
                    </div>
                    <input type="file" accept="image/*" aria-label="Upload delivery drop-off photo" />
                  </label>

                  <button className="ts-fig-btn ts-fig-auth-submit" type="submit" disabled={isPending}>
                    {isPending ? "Creating account..." : "Create account"}
                  </button>
                  <button type="button" className="ts-fig-auth-ghost" onClick={() => setStep(1)} disabled={isPending}>
                    ← Back
                  </button>
                </>
              )}
            </form>

            <p className="ts-fig-auth-foot">
              Already have an account? <Link href="/login">Sign in</Link>
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
