import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const SECTIONS = [
  { id: "agreement", title: "Your agreement with us" },
  { id: "eligibility", title: "Eligibility & accounts" },
  { id: "service-areas", title: "Service availability" },
  { id: "orders-payments", title: "Orders, payments & taxes" },
  { id: "cancellations-refunds", title: "Cancellations & refunds" },
  { id: "promotions", title: "Promotions, rewards & referrals" },
  { id: "driver-terms", title: "Driver-specific terms" },
  { id: "merchant-terms", title: "Merchant-specific terms" },
  { id: "acceptable-use", title: "Acceptable use" },
  { id: "intellectual-property", title: "Intellectual property" },
  { id: "third-parties", title: "Third-party services" },
  { id: "disclaimers", title: "Disclaimers & limitations" },
  { id: "disputes", title: "Disputes & arbitration" },
  { id: "termination", title: "Suspension & termination" },
  { id: "changes", title: "Changes to these terms" },
  { id: "contact", title: "Contact" },
];

export default function TermsPage() {
  return (
    <div className="ts-fig ts-fig-doc-page">
      <SiteHeader />

      <header className="ts-fig-doc-hero">
        <div className="ts-fig-doc-hero-inner">
          <span className="ts-fig-kicker">Terms of Service</span>
          <h1>
            The rules that keep TrueServe <span className="t">fair for everyone.</span>
          </h1>
          <p className="lead">
            By using TrueServe — as a customer, driver, or merchant — you agree to the terms below.
            We've written them to be readable, but they are a binding agreement. Please read them carefully.
          </p>
          <div className="ts-fig-doc-meta">
            <span className="ts-fig-doc-meta-chip">
              <span className="dot" />
              Effective May 1, 2026
            </span>
            <span>Last updated May 2026</span>
            <span aria-hidden>·</span>
            <Link href="/privacy">Read the Privacy Policy →</Link>
          </div>
        </div>
      </header>

      <main className="ts-fig-doc-body">
        <aside className="ts-fig-doc-toc" aria-label="On this page">
          <h3>On this page</h3>
          <ol>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ol>
        </aside>

        <div className="ts-fig-doc-content">
          <section id="agreement" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 01</span>
            <h2>Your agreement with us</h2>
            <p>
              These Terms of Service ("Terms") govern your use of TrueServe's website, apps, and delivery
              platform (the "Service"), operated by TrueServe LLC ("TrueServe," "we," or "us"). By creating
              an account, placing an order, accepting a trip, or onboarding a restaurant, you agree to these
              Terms and to our <Link href="/privacy">Privacy Policy</Link>.
            </p>
            <p>
              If you are accepting these Terms on behalf of a business (for example, as a restaurant owner or
              fleet manager), you represent that you have authority to bind that business.
            </p>
          </section>

          <section id="eligibility" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 02</span>
            <h2>Eligibility & accounts</h2>
            <p>
              You must be at least 18 years old to use TrueServe. Drivers must additionally meet local
              licensing, insurance, and vehicle requirements before going online. Each account is for a single
              person or single business — sharing credentials or operating under another person's account is
              not permitted.
            </p>
            <ul>
              <li>Keep your contact information current so we can reach you about orders.</li>
              <li>Use a strong, unique password and notify us promptly if you suspect unauthorized access.</li>
              <li>You are responsible for activity that happens under your account.</li>
            </ul>
          </section>

          <section id="service-areas" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 03</span>
            <h2>Service availability</h2>
            <p>
              Service areas, delivery windows, supported cuisines, and platform features vary by location and
              operational status. We may launch, pause, or modify availability for safety, weather,
              compliance, or reliability reasons. We aim to give advance notice when a market change affects
              an active order or partner.
            </p>
          </section>

          <section id="orders-payments" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 04</span>
            <h2>Orders, payments & taxes</h2>
            <p>
              Prices shown in the app include item totals, applicable fees, delivery charges, and estimated
              taxes. The merchant sets the menu price; TrueServe sets platform fees. You authorize the payment
              method on file to be charged for the total of any order you place, plus any tip you add at
              checkout or after delivery.
            </p>
            <h3>Tipping</h3>
            <p>
              100% of customer tips go to the driver who completed the delivery. Tip changes made after delivery
              are processed within 24 hours.
            </p>
            <h3>Receipts</h3>
            <p>
              Receipts are emailed at checkout and stored in your order history. For tax-deductible orders,
              you can download a CSV of your order history from your account page.
            </p>
          </section>

          <section id="cancellations-refunds" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 05</span>
            <h2>Cancellations & refunds</h2>
            <p>
              You may cancel an order at no charge until the restaurant accepts it. After acceptance, the
              refund outcome depends on how far the order has progressed: prepared food may not be refundable,
              but missing items, incorrect items, and order quality issues are eligible for refund or credit.
            </p>
            <ul>
              <li>Report issues from the order screen — proof photos speed up resolution.</li>
              <li>Refunds typically post back to your original payment method within 3–10 business days.</li>
              <li>Repeated unfounded refund claims may trigger a manual review of your account.</li>
            </ul>
            <div className="ts-fig-doc-callout">
              <strong>Driver was unable to deliver?</strong>
              <p>If a driver cannot complete a delivery after multiple contact attempts, the order is closed and any prepared food is forfeited. You can re-order from your history with one tap.</p>
            </div>
          </section>

          <section id="promotions" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 06</span>
            <h2>Promotions, rewards & referrals</h2>
            <p>
              TrueServe occasionally runs promotions, rewards tiers, and referral bonuses. Each program has
              its own terms posted in the app or on the corresponding marketing page. We may modify or end any
              promotion at any time, but we will honor any rewards that have already vested.
            </p>
            <p>
              TruePoints, anniversary credits, and referral credits have no cash value, are non-transferable,
              and expire if your account is inactive for 24 consecutive months.
            </p>
          </section>

          <section id="driver-terms" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 07</span>
            <h2>Driver-specific terms</h2>
            <p>
              Drivers are independent contractors, not employees of TrueServe. You decide when to go online,
              which trips to accept (within program rules), and how to operate your vehicle in accordance with
              local law.
            </p>
            <ul>
              <li>Maintain a valid driver's license, vehicle registration, and required insurance at all times.</li>
              <li>Comply with traffic laws and food-safety standards while completing deliveries.</li>
              <li>Earnings are paid daily based on the rates posted in the driver app at the time of each trip.</li>
              <li>Repeated cancellations, late arrivals, or safety violations may result in deactivation.</li>
            </ul>
          </section>

          <section id="merchant-terms" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 08</span>
            <h2>Merchant-specific terms</h2>
            <p>
              Merchants control their menus, pricing, hours of operation, and prep times within the TrueServe
              merchant dashboard. By onboarding as a merchant you authorize TrueServe to accept orders on
              your behalf, collect payment from customers, and remit the agreed payout to your linked bank
              account on the agreed schedule.
            </p>
            <ul>
              <li>Founding Partner rates are locked for the lifetime of the merchant account in good standing.</li>
              <li>You are responsible for food safety, allergen disclosures, and licensure for your kitchen.</li>
              <li>You agree to honor accepted orders and to update menu availability promptly when items go out of stock.</li>
            </ul>
          </section>

          <section id="acceptable-use" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 09</span>
            <h2>Acceptable use</h2>
            <p>You agree not to use TrueServe to:</p>
            <ul>
              <li>Order or deliver anything illegal, unsafe, or prohibited by the merchant.</li>
              <li>Defraud another user or the platform, including chargeback abuse.</li>
              <li>Harass, threaten, or harm another customer, driver, or merchant.</li>
              <li>Probe, scan, scrape, or otherwise interfere with the security or integrity of the Service.</li>
              <li>Misrepresent your identity, eligibility, or affiliation with another business.</li>
            </ul>
          </section>

          <section id="intellectual-property" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 10</span>
            <h2>Intellectual property</h2>
            <p>
              TrueServe, the TrueServe logo, and the design of our website and apps are owned by TrueServe
              LLC. You may not copy, reuse, or distribute our trademarks, design assets, or proprietary
              software without permission. Restaurants retain ownership of their menus, photos, and branding.
            </p>
          </section>

          <section id="third-parties" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 11</span>
            <h2>Third-party services</h2>
            <p>
              TrueServe integrates with third-party providers — including Stripe for payments, mapping
              providers for routing, and POS systems like Toast, Square, and Clover. Your use of those
              services through TrueServe is also subject to their own terms.
            </p>
          </section>

          <section id="disclaimers" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 12</span>
            <h2>Disclaimers & limitations</h2>
            <p>
              TrueServe provides the Service on an "as is" and "as available" basis. We do not warrant that
              the Service will be uninterrupted, error-free, or perfectly accurate. To the maximum extent
              permitted by law, TrueServe is not liable for indirect, incidental, or consequential damages
              arising out of your use of the Service.
            </p>
            <p>
              Nothing in these Terms limits liability that cannot be limited under applicable law, including
              liability for fraud or gross negligence.
            </p>
          </section>

          <section id="disputes" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 13</span>
            <h2>Disputes & arbitration</h2>
            <p>
              We want to resolve disputes quickly and fairly. Please contact{" "}
              <a href="mailto:support@trueservedelivery.com">support@trueservedelivery.com</a> first so we can
              try to fix the issue directly. If we can't resolve a dispute informally, you and TrueServe agree
              to resolve it through binding arbitration on an individual basis, except where prohibited by
              local law. You may opt out of arbitration within 30 days of creating your account by emailing us.
            </p>
          </section>

          <section id="termination" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 14</span>
            <h2>Suspension & termination</h2>
            <p>
              We may suspend or close accounts that violate these Terms, present a safety risk, or are
              required to be closed by law. You may delete your account at any time from your{" "}
              <Link href="/account">account page</Link>. Some provisions of these Terms survive termination,
              including payment obligations, dispute resolution, and intellectual-property terms.
            </p>
          </section>

          <section id="changes" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 15</span>
            <h2>Changes to these terms</h2>
            <p>
              We may update these Terms from time to time. When the change is material we'll update the
              effective date above and — for active users — notify you in the app or by email. Continued use
              of TrueServe after the effective date means you accept the updated Terms.
            </p>
          </section>

          <section id="contact" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 16</span>
            <h2>Contact</h2>
            <p>
              Questions about these Terms? Email{" "}
              <a href="mailto:support@trueservedelivery.com">support@trueservedelivery.com</a> or write to
              TrueServe LLC, Legal Team, Charlotte, NC.
            </p>
          </section>

          <div className="ts-fig-doc-foot">
            <div>
              <h4>Need help instead of legalese?</h4>
              <p>Visit the help center for order, payment, and account questions answered in plain English.</p>
            </div>
            <div className="ts-fig-doc-foot-actions">
              <Link href="/help" className="ts-fig-btn">Visit help center</Link>
              <Link href="/privacy" className="ts-fig-btn ts-fig-btn-ghost">Read privacy →</Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
