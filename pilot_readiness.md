
# Pilot Readiness & Gap Analysis

Beyond the technical configuration in `production_checklist.md`, the following operational and user-facing elements are critical for a successful pilot launch.

## 1. Legal & Compliance (MANDATORY for Stripe/Twilio)
Twilio A2P 10DLC and Stripe Connect **require** valid URLs for Terms of Service and Privacy Policy. Currently, these pages do not exist.

*   [ ] **Create Terms of Service Page**: Define rules for drivers, merchants, and customers.
*   [ ] **Create Privacy Policy**: Explain data collection (location, phone numbers).
*   [ ] **Update Footer**: Link to these pages in the footer of `app/layout.tsx`.

## 2. Customer Support & Feedback
In a pilot, things *will* break. You need a way for users to report critical issues immediately.

*   [ ] **Support Page / Contact Form**: A simple page (`/support`) with an email link or form properly routed to your support email.
*   [ ] **Beta Feedback Widget**: A floating button (e.g., "Report Bug") visible to Pilot users to capture screenshots or feedback easily.

## 3. Email & Communication Reputation
*   [ ] **Custom Domain for Email**: You are currently using `onboarding@resend.dev`.
    *   **Action**: Verify your domain (e.g., `trueservedelivery.com`) in Resend credentials.
    *   **Update**: Change the `from` address in `lib/email.ts` to `no-reply@yourdomain.com`.
*   [ ] **SMS Brand Name**: Ensure your Twilio message service is configured to always prepend your brand name (already done in code manually, but cleaner via Service).

## 4. Analytics & Monitoring
You need to know if the pilot is working without waiting for users to complain.

*   [ ] **Error Tracking**: Install **Sentry** or **LogRocket**. This captures runtime errors (e.g., "Payment Failed") and sends you an alert.
*   [ ] **Product Analytics**: Install **PostHog** or **Google Analytics** to see if users are dropping off at checkout.

## 5. SEO & Indexing (Basic)
*   [ ] **Robots.txt**: Ensure you aren't accidentally blocking Google (or *are* blocking them if you want a private pilot).
*   [ ] **Manifest.json**: For Drivers, having an "Add to Home Screen" capability (PWA) is a huge quality-of-life improvement.

## 6. Admin Tools
*   [ ] **"God Mode" Dashboard**: Ensure `app/admin` works and allows you to:
    *   Manually refund an order.
    *   Manually reassign a driver.
    *   Force-close a restaurant if they are overwhelmed.

## 7. Pilot "Safety Nets"
*   [ ] **Kill Switch**: A database flag (e.g., in a `SystemConfig` table) to disable ordering globally if a critical bug is found.
*   [ ] **Zone Restriction**: Ensure your logic strictly enforces the pilot zip codes (Pineville/Charlotte) so you don't get an order from California.

