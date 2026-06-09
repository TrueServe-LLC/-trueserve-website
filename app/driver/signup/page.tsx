"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { submitDriverApplication } from "@/app/driver/actions";

export default function DriverSignupPage() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [vehicleType, setVehicleType] = useState("CAR");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [geoMessage, setGeoMessage] = useState("");
  const [stateData, formAction, isPending] = useActionState(submitDriverApplication, { message: "" });

  useEffect(() => {
    if (stateData?.success) {
      setStep(3);
    }
  }, [stateData?.success]);

  const useCurrentLocation = () => {
    setGeoMessage("");
    if (!navigator.geolocation) {
      setGeoMessage("Geolocation is not supported on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(String(position.coords.latitude));
        setLng(String(position.coords.longitude));
        setGeoMessage("Location captured.");
      },
      () => {
        setGeoMessage("Could not access location. You can still submit without it.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="ts-fig ts-fig-auth-page">
      <SiteHeader />

      <main className="ts-fig-auth">
        <div className="ts-fig-auth-grid">
          <aside className="ts-fig-auth-side">
            <div
              className="ts-fig-auth-side-image"
              style={{ backgroundImage: "url('/driver_hero_real.png')" }}
              aria-hidden="true"
            />
            <div className="ts-fig-auth-side-inner">
              <span className="ts-fig-chip">
                <span className="ts-fig-chip-dot" />
                Local driver routes
              </span>
              <h1>
                Drive your block. <span className="t">Keep every tip.</span>
              </h1>
              <p className="ts-fig-auth-side-sub">
                $20/hr base pay + 100% of tips. Daily payout. No schedules — go online whenever you want.
              </p>
              <ul className="ts-fig-auth-perks">
                <li>
                  <span className="ts-fig-auth-perk-dot">1</span>
                  <div>
                    <strong>Document upload</strong>
                    <span>License, insurance, and vehicle registration in one place.</span>
                  </div>
                </li>
                <li>
                  <span className="ts-fig-auth-perk-dot">2</span>
                  <div>
                    <strong>Smart dispatch</strong>
                    <span>Fewer dead miles and better trip density.</span>
                  </div>
                </li>
                <li>
                  <span className="ts-fig-auth-perk-dot">3</span>
                  <div>
                    <strong>Secure onboarding</strong>
                    <span>ID, insurance, registration, and agreement compliance included.</span>
                  </div>
                </li>
              </ul>
            </div>
          </aside>

          <section className="ts-fig-auth-form">
            <span className="ts-fig-kicker teal">Driver application</span>
            <h2>Start earning this week</h2>
            <p className="ts-fig-auth-form-sub">Submit your profile and documents — we approve most drivers within 24 hours.</p>

            {stateData?.message && (
              <div className={`ts-fig-auth-banner ${stateData.error ? "is-error" : "is-success"}`} role="alert">
                {stateData.message}
              </div>
            )}

            <div className="ts-fig-auth-steps" aria-label={step < 3 ? `Step ${step} of 3` : "Application submitted"}>
              <div className={`ts-fig-auth-step-dot${step >= 1 ? " is-on" : ""}`} />
              <div className={`ts-fig-auth-step-dot${step >= 2 ? " is-on" : ""}`} />
              <div className={`ts-fig-auth-step-dot${step >= 3 ? " is-on" : ""}`} />
              <span>{step === 1 ? "Profile" : step === 2 ? "Documents" : "Application sent"}</span>
            </div>

            <form action={formAction} className="ts-fig-auth-fields">
              <input type="hidden" name="name" value={fullName} />
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="phone" value={phone} />
              <input type="hidden" name="dob" value={dob} />
              <input type="hidden" name="address" value={address} />
              <input type="hidden" name="vehicleType" value={vehicleType} />
              <input type="hidden" name="vehicleMake" value={vehicleMake} />
              <input type="hidden" name="vehicleModel" value={vehicleModel} />
              <input type="hidden" name="vehicleColor" value={vehicleColor} />
              <input type="hidden" name="licensePlate" value={licensePlate} />
              <input type="hidden" name="lat" value={lat} />
              <input type="hidden" name="lng" value={lng} />

              {step === 1 && (
                <>
                  <label className="ts-fig-auth-field">
                    <span>Full name</span>
                    <input type="text" placeholder="Alex Smith" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" />
                  </label>
                  <div className="ts-fig-auth-row">
                    <label className="ts-fig-auth-field">
                      <span>Email</span>
                      <input type="email" placeholder="alex@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                    </label>
                    <label className="ts-fig-auth-field">
                      <span>Phone (US)</span>
                      <input type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required autoComplete="tel" />
                    </label>
                  </div>
                  <div className="ts-fig-auth-row">
                    <label className="ts-fig-auth-field">
                      <span>Date of birth</span>
                      <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
                    </label>
                    <label className="ts-fig-auth-field">
                      <span>Home address</span>
                      <input type="text" placeholder="123 Main St, Charlotte, NC" value={address} onChange={(e) => setAddress(e.target.value)} required />
                    </label>
                  </div>
                  <label className="ts-fig-auth-field">
                    <span>Vehicle type</span>
                    <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                      <option value="CAR">Car</option>
                      <option value="SCOOTER">Scooter / Moped</option>
                      <option value="MOTORCYCLE">Motorcycle</option>
                      <option value="BICYCLE">Bicycle</option>
                    </select>
                  </label>
                  <div className="ts-fig-auth-row ts-fig-auth-row-3">
                    <label className="ts-fig-auth-field">
                      <span>Make</span>
                      <input type="text" placeholder="Toyota" value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} required />
                    </label>
                    <label className="ts-fig-auth-field">
                      <span>Model</span>
                      <input type="text" placeholder="Corolla" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} required />
                    </label>
                    <label className="ts-fig-auth-field">
                      <span>Color</span>
                      <input type="text" placeholder="Black" value={vehicleColor} onChange={(e) => setVehicleColor(e.target.value)} required />
                    </label>
                  </div>
                  <label className="ts-fig-auth-field">
                    <span>License plate</span>
                    <input type="text" placeholder="ABC-1234" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} required />
                  </label>

                  <button
                    type="button"
                    className="ts-fig-btn ts-fig-btn-teal ts-fig-auth-submit"
                    onClick={() => setStep(2)}
                    disabled={isPending || !fullName || !email || !phone || !dob || !address || !vehicleMake || !vehicleModel || !vehicleColor || !licensePlate}
                  >
                    Next: Compliance →
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <label className="ts-fig-auth-field">
                    <span>Driver license image</span>
                    <input name="idDocument" type="file" accept="image/*,.pdf" required />
                  </label>
                  <label className="ts-fig-auth-field">
                    <span>Insurance document</span>
                    <input name="insuranceDocument" type="file" accept="image/*,.pdf" required />
                  </label>
                  <label className="ts-fig-auth-field">
                    <span>Vehicle registration</span>
                    <input name="registrationDocument" type="file" accept="image/*,.pdf" required />
                  </label>

                  <div className="ts-fig-auth-callout">
                    <strong>Optional precision location</strong>
                    <button type="button" className="ts-fig-auth-ghost" onClick={useCurrentLocation}>Use current location</button>
                    {geoMessage && <small>{geoMessage}</small>}
                  </div>

                  <label className="ts-fig-auth-consent">
                    <input name="hasSignedAgreement" type="checkbox" value="true" required />
                    <span>I confirm all provided information is accurate and I agree to the TrueServe driver terms.</span>
                  </label>
                  <label className="ts-fig-auth-consent">
                    <input name="smsConsent" type="checkbox" value="true" />
                    <span>
                      I agree to receive recurring SMS messages from TrueServe at the phone number provided about driver
                      onboarding, application status, account activity, and delivery/order notifications. Message frequency
                      varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent is not
                      required to apply or make a purchase.
                    </span>
                  </label>

                  <button className="ts-fig-btn ts-fig-btn-teal ts-fig-auth-submit" type="submit" disabled={isPending}>
                    {isPending ? "Submitting..." : "Submit application"}
                  </button>
                  <button className="ts-fig-auth-ghost" type="button" onClick={() => setStep(1)} disabled={isPending}>
                    ← Back
                  </button>
                </>
              )}

              {step === 3 && (
                <div className="ts-fig-auth-done">
                  <div className="ts-fig-auth-done-icon">✓</div>
                  <h3>Application received</h3>
                  <p>
                    Driver Ops will review your application and documents before activation. We sent next-step
                    instructions by email and, if you opted in, SMS. You’ll receive another email when your
                    status changes or when more information is needed.
                  </p>
                  <div className="ts-fig-auth-next-steps">
                    <span>Driver Ops reviews your application</span>
                    <span>Admins verify documents before activation</span>
                    <span>Approval updates are sent by email</span>
                  </div>
                  <Link href="/driver/login?tour=1" className="ts-fig-btn ts-fig-btn-teal">Go to driver login →</Link>
                </div>
              )}
            </form>

            <p className="ts-fig-auth-foot">
              Already a driver? <Link href="/driver/login">Sign in to portal</Link>
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
