import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const SECTIONS = [
  { id: "information-we-collect", title: "Information we collect" },
  { id: "how-we-use-data", title: "How we use your data" },
  { id: "location-and-tracking", title: "Location & live tracking" },
  { id: "payments", title: "Payments & financial data" },
  { id: "communications", title: "Communications & support" },
  { id: "issue-reporting", title: "Issue reporting & proof photos" },
  { id: "sharing", title: "Who we share data with" },
  { id: "retention", title: "How long we keep data" },
  { id: "your-rights", title: "Your rights & choices" },
  { id: "security", title: "Security" },
  { id: "children", title: "Children's privacy" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "Contact us" },
];

export default function PrivacyPage() {
  return (
    <div className="ts-fig ts-fig-doc-page">
      <SiteHeader />

      <header className="ts-fig-doc-hero">
        <div className="ts-fig-doc-hero-inner">
          <span className="ts-fig-kicker">Privacy Policy</span>
          <h1>
            How we handle <span className="o">your data.</span>
          </h1>
          <p className="lead">
            TrueServe is a local delivery platform. This policy explains what we collect, why we collect it,
            and the controls you have over your information. We've written it in plain language because legal
            shouldn't read like fine print.
          </p>
          <div className="ts-fig-doc-meta">
            <span className="ts-fig-doc-meta-chip">
              <span className="dot" />
              Effective May 1, 2026
            </span>
            <span>Last updated May 2026</span>
            <span aria-hidden>·</span>
            <Link href="/terms">Read the Terms of Service →</Link>
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
          <section id="information-we-collect" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 01</span>
            <h2>Information we collect</h2>
            <p>
              We collect information you give us directly, information we generate as you use TrueServe,
              and a small amount of technical information from your device. Specifically:
            </p>
            <ul>
              <li><strong>Account details</strong> — name, email address, phone number, password, and the role you sign up under (customer, driver, or merchant).</li>
              <li><strong>Order data</strong> — items, totals, tips, delivery addresses, drop-off notes, and any photos you choose to add to your delivery profile.</li>
              <li><strong>Driver onboarding documents</strong> — driver license image, insurance, and vehicle registration, used only for compliance checks.</li>
              <li><strong>Merchant onboarding details</strong> — restaurant name, owner contact, POS credentials (if provided), and tax information.</li>
              <li><strong>Device & usage data</strong> — IP address, browser type, app version, and basic telemetry so we can debug crashes and detect fraud.</li>
            </ul>
          </section>

          <section id="how-we-use-data" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 02</span>
            <h2>How we use your data</h2>
            <p>
              We use your information to operate the platform — taking orders, dispatching drivers, settling
              payouts to restaurants, and supporting you when something goes wrong. We do not sell your personal
              information.
            </p>
            <h3>Operational purposes</h3>
            <p>
              Routing orders to drivers, matching customers with nearby restaurants, generating receipts,
              issuing refunds, and resolving disputes between parties.
            </p>
            <h3>Product improvements</h3>
            <p>
              Aggregated and anonymized data helps us improve ETA accuracy, dispatch quality, and search ranking.
              Where possible, we strip personal identifiers before any analytics work.
            </p>
            <h3>Safety & fraud prevention</h3>
            <p>
              We monitor for stolen cards, account takeovers, abusive behavior, and unusual delivery patterns.
              This sometimes requires reviewing order history or location traces in narrow, time-bound windows.
            </p>
          </section>

          <section id="location-and-tracking" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 03</span>
            <h2>Location & live tracking</h2>
            <p>
              Drivers share their location while they are online and during active deliveries so customers can
              see real-time ETAs and so dispatch can route trips fairly. Customers may optionally share
              precise location at checkout to improve drop-off accuracy.
            </p>
            <ul>
              <li>Driver location is only shared with the customer of the active order, never with other drivers or third parties.</li>
              <li>Location traces older than 90 days are downsampled and detached from your account identifier.</li>
              <li>You can turn off precision location any time in your device settings — the app falls back to your saved address.</li>
            </ul>
          </section>

          <section id="payments" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 04</span>
            <h2>Payments & financial data</h2>
            <p>
              Payments are processed by Stripe and other PCI-compliant providers. TrueServe never stores your
              full card number — we store a token that lets us charge that card again for future orders
              you approve. Driver and merchant payouts run on the same providers, with bank account details
              held by Stripe directly.
            </p>
            <div className="ts-fig-doc-callout">
              <strong>You stay in control</strong>
              <p>You can remove a payment method at any time from your account page. Removing it does not affect orders that have already been authorized.</p>
            </div>
          </section>

          <section id="communications" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 05</span>
            <h2>Communications & support</h2>
            <p>
              Order chat, support tickets, SMS notifications, and email confirmations are all stored so we can
              resolve disputes and improve service quality. Support may include AI-assisted responses; sensitive
              issues are routed to a human agent.
            </p>
            <p>
              You can opt out of marketing emails at any time using the unsubscribe link in those emails.
              Transactional messages (order confirmations, delivery updates, dispute responses) cannot be
              disabled while your account is active.
            </p>
          </section>

          <section id="issue-reporting" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 06</span>
            <h2>Issue reporting & proof photos</h2>
            <p>
              If you report a wrong, missing, or damaged item, you may optionally attach a proof photo.
              Those photos are stored with the order record and shared only with TrueServe support, the
              merchant who prepared the order, and (when relevant) the driver who delivered it.
            </p>
            <p>
              Photos are deleted 18 months after the order is closed unless we are legally required to
              retain them longer for an ongoing dispute or regulatory request.
            </p>
          </section>

          <section id="sharing" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 07</span>
            <h2>Who we share data with</h2>
            <p>We share the minimum data necessary with the following categories of recipients:</p>
            <ul>
              <li><strong>Restaurants</strong> — your name, order items, delivery address, and tip amount.</li>
              <li><strong>Drivers</strong> — your name, drop-off address, drop-off notes, and any uploaded drop-off photo.</li>
              <li><strong>Payment providers</strong> — order totals and a tokenized payment method.</li>
              <li><strong>Service providers</strong> — hosting (Vercel, Supabase), email delivery (SES, Resend), SMS (Twilio), and analytics, each under a data-processing agreement.</li>
              <li><strong>Legal requests</strong> — when we are compelled by valid legal process, or to prevent serious harm.</li>
            </ul>
          </section>

          <section id="retention" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 08</span>
            <h2>How long we keep data</h2>
            <p>
              We retain account information for as long as your account is active. When you delete your
              account, we remove personally-identifying fields within 30 days, except for records we must
              keep for tax, audit, or fraud-prevention reasons (typically 7 years for transaction records).
            </p>
          </section>

          <section id="your-rights" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 09</span>
            <h2>Your rights & choices</h2>
            <p>
              Depending on where you live, you may have the right to access, correct, export, or delete the
              personal information we hold about you. You can also object to certain processing and ask us
              to restrict it.
            </p>
            <ul>
              <li>Export a copy of your data from your account settings.</li>
              <li>Delete your account from <Link href="/account">your account page</Link> at any time.</li>
              <li>Email <a href="mailto:privacy@trueservedelivery.com">privacy@trueservedelivery.com</a> for any request we don't have an in-app control for yet.</li>
            </ul>
          </section>

          <section id="security" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 10</span>
            <h2>Security</h2>
            <p>
              We use TLS in transit, encrypted storage at rest, role-based access controls, and continuous
              monitoring on the backend. No system is perfectly secure, but we work hard to keep your data
              protected and we will notify you promptly if a breach affects your account.
            </p>
          </section>

          <section id="children" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 11</span>
            <h2>Children's privacy</h2>
            <p>
              TrueServe is intended for users 18 and older. We do not knowingly collect information from
              children under 13. If you believe a child has provided us information, please contact us so
              we can delete it.
            </p>
          </section>

          <section id="changes" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 12</span>
            <h2>Changes to this policy</h2>
            <p>
              When we make material changes, we update the effective date above and — when the change is
              significant — notify active users by email or in-app message. Continued use of TrueServe after
              the effective date means you accept the updated policy.
            </p>
          </section>

          <section id="contact" className="ts-fig-doc-section">
            <span className="ts-fig-doc-section-num">Section 13</span>
            <h2>Contact us</h2>
            <p>
              Questions, requests, or complaints? Email us at{" "}
              <a href="mailto:privacy@trueservedelivery.com">privacy@trueservedelivery.com</a> or write to
              TrueServe LLC, Privacy Team, Charlotte, NC.
            </p>
          </section>

          <div className="ts-fig-doc-foot">
            <div>
              <h4>Still reading? You're thorough.</h4>
              <p>Have a question this policy didn't answer? Our team is one click away.</p>
            </div>
            <div className="ts-fig-doc-foot-actions">
              <Link href="/help" className="ts-fig-btn">Visit help center</Link>
              <Link href="/terms" className="ts-fig-btn ts-fig-btn-ghost">Read terms →</Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
