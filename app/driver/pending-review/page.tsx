import Link from "next/link";
import { CheckCircle2, ChevronRight, Clock3, FileCheck2, ShieldCheck, Wallet } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const reviewSteps = [
  {
    label: "Application received",
    detail: "Your profile and vehicle details are saved.",
    state: "done",
    icon: CheckCircle2,
  },
  {
    label: "Documents in review",
    detail: "Driver Ops checks license, insurance, and registration.",
    state: "active",
    icon: FileCheck2,
  },
  {
    label: "Compliance decision",
    detail: "Admins move you to Ready for Review, Approved, or request updates.",
    state: "upcoming",
    icon: ShieldCheck,
  },
  {
    label: "Dashboard unlock",
    detail: "Approved drivers can sign in, see status, and prepare for live routes.",
    state: "upcoming",
    icon: Wallet,
  },
] as const;

export default function DriverPendingReviewPage() {
  return (
    <div className="driver-app-page driver-review-page">
      <SiteHeader />

      <main className="driver-review-main">
        <section className="driver-review-hero">
          <div className="driver-review-copy">
            <span className="driver-app-eyebrow">Driver application status</span>
            <h1>
              Your documents are <span>being reviewed.</span>
            </h1>
            <p>
              Your login can stay active while Driver Ops verifies your files. You are not cleared
              for deliveries until the admin portal marks your driver status as approved.
            </p>

            <div className="driver-review-actions">
              <Link href="/driver/login" className="driver-app-primary">
                Back to driver login
                <ChevronRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/driver/app" className="driver-app-secondary">
                Driver app hub
              </Link>
            </div>
          </div>

          <div className="driver-review-card" aria-label="Current approval status">
            <div className="driver-review-image" aria-hidden="true" />
            <div className="driver-review-card-body">
              <div className="driver-review-pill">
                <Clock3 size={16} aria-hidden="true" />
                Manual review active
              </div>
              <h2>What happens next</h2>
              <p>
                We send an email when your application is received, when more documents are needed,
                and when approval is complete. SMS is sent only if you opted in.
              </p>
            </div>
          </div>
        </section>

        <section className="driver-review-tracker" aria-label="Driver application approval tracker">
          <div className="driver-review-tracker-head">
            <div>
              <span className="driver-app-eyebrow">Approval tracker</span>
              <h2>Clear steps, no guessing</h2>
            </div>
            <span className="driver-review-progress">2 of 4</span>
          </div>

          <div className="driver-review-steps">
            {reviewSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.label} className={`driver-review-step is-${step.state}`}>
                  <div className="driver-review-step-icon">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{step.label}</h3>
                    <p>{step.detail}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="driver-review-help">
          <div>
            <h2>Need to update your files?</h2>
            <p>
              If your license, insurance, or registration changed, contact support so the team can
              reopen your document upload and keep the review moving.
            </p>
          </div>
          <div className="driver-review-help-actions">
            <Link href="/contact">Contact support</Link>
            <Link href="/driver/recover">Update login access</Link>
          </div>
        </section>
      </main>

      <SiteFooter />

      <style>{`
        .driver-review-main {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
          padding: 48px 0 72px;
        }
        .driver-review-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
          gap: clamp(24px, 5vw, 56px);
          align-items: stretch;
        }
        .driver-review-copy,
        .driver-review-card,
        .driver-review-tracker,
        .driver-review-help {
          border: 1px solid rgba(255,255,255,0.1);
          background: linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025));
          border-radius: 28px;
          box-shadow: 0 24px 70px rgba(0,0,0,0.24);
        }
        .driver-review-copy {
          padding: clamp(28px, 5vw, 54px);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .driver-review-copy h1 {
          margin: 18px 0 18px;
          max-width: 680px;
          color: #fff;
          font-family: var(--fig-serif, Fraunces, Georgia, serif);
          font-size: clamp(44px, 6vw, 76px);
          line-height: 0.98;
          letter-spacing: -0.04em;
        }
        .driver-review-copy h1 span {
          color: #ff6b35;
          display: block;
        }
        .driver-review-copy p,
        .driver-review-card-body p,
        .driver-review-help p,
        .driver-review-step p {
          color: rgba(255,255,255,0.66);
          line-height: 1.65;
        }
        .driver-review-copy p {
          max-width: 640px;
          font-size: 17px;
        }
        .driver-review-actions,
        .driver-review-help-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 28px;
        }
        .driver-review-card {
          overflow: hidden;
          min-height: 520px;
          display: grid;
          grid-template-rows: 1fr auto;
        }
        .driver-review-image {
          min-height: 320px;
          background:
            linear-gradient(180deg, rgba(6,13,24,0.05), rgba(6,13,24,0.86)),
            url('/driver-hero-delivery-car.png') center/cover;
        }
        .driver-review-card-body {
          padding: 26px;
        }
        .driver-review-pill,
        .driver-review-progress {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          border-radius: 999px;
          border: 1px solid rgba(20,184,166,0.32);
          background: rgba(20,184,166,0.12);
          color: #69e7d9;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 900;
        }
        .driver-review-card h2,
        .driver-review-tracker h2,
        .driver-review-help h2 {
          margin: 14px 0 8px;
          color: #fff;
          font-family: var(--fig-serif, Fraunces, Georgia, serif);
          font-size: clamp(28px, 3vw, 40px);
          line-height: 1.05;
        }
        .driver-review-tracker {
          margin-top: 24px;
          padding: clamp(22px, 4vw, 36px);
        }
        .driver-review-tracker-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 22px;
        }
        .driver-review-steps {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .driver-review-step {
          min-width: 0;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          background: rgba(0,0,0,0.16);
          padding: 18px;
        }
        .driver-review-step.is-active {
          border-color: rgba(255,107,53,0.42);
          background: rgba(255,107,53,0.08);
        }
        .driver-review-step.is-done {
          border-color: rgba(20,184,166,0.34);
          background: rgba(20,184,166,0.08);
        }
        .driver-review-step-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: rgba(255,255,255,0.08);
          color: #fff;
          margin-bottom: 16px;
        }
        .driver-review-step.is-active .driver-review-step-icon {
          color: #ff6b35;
        }
        .driver-review-step.is-done .driver-review-step-icon {
          color: #69e7d9;
        }
        .driver-review-step span {
          color: rgba(255,255,255,0.38);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.16em;
        }
        .driver-review-step h3 {
          margin: 8px 0 6px;
          color: #fff;
          font-size: 17px;
        }
        .driver-review-help {
          margin-top: 24px;
          padding: clamp(22px, 4vw, 34px);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }
        .driver-review-help a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff;
          padding: 0 18px;
          font-weight: 900;
          text-decoration: none;
        }
        @media (max-width: 980px) {
          .driver-review-hero,
          .driver-review-steps {
            grid-template-columns: 1fr;
          }
          .driver-review-card {
            min-height: 0;
          }
          .driver-review-help {
            align-items: flex-start;
            flex-direction: column;
          }
        }
        @media (max-width: 640px) {
          .driver-review-main {
            width: min(100% - 24px, 1180px);
            padding-top: 28px;
          }
          .driver-review-copy,
          .driver-review-card-body,
          .driver-review-tracker,
          .driver-review-help {
            border-radius: 22px;
          }
          .driver-review-actions > *,
          .driver-review-help-actions > * {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
