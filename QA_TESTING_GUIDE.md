# TrueServe Comprehensive QA & UAT Testing Guide

Welcome to the TrueServe Quality Assurance Master Guide. This document provides step-by-step instructions for testing every core flow, API integration, and user portal within the platform on **Local (Non-Prod) and UAT** environments safely, without impacting real data or incurring third-party costs.

---

## 1. Environment & Setup

Before testing, ensure your Local Environment is running.
```bash
# Start the local development server (Runs on http://localhost:3000)
npm run dev
```
**CRITICAL:** Ensure `.env.local` contains test keys (`sk_test_...`) and the `ANTHROPIC_API_KEY` for AI functionalities. Never use live production keys (`sk_live_...`) for local testing.

---

## 2. Testing Stripe & Payments

**A. Customer Checkout (Apple Pay / Google Pay / Cards)**
Testing checkout flows without real money requires the Stripe CLI.
1. Start the Stripe webhook tunnel to connect Stripe to your localhost:
   ```bash
   npx stripe listen --forward-to localhost:3000/api/webhook/stripe
   ```
2. Trigger mock checkout events from a new terminal tab:
   * **Success:** `npx stripe trigger payment_intent.succeeded`
   * **Decline:** `npx stripe trigger payment_intent.payment_failed`
   * **Refund:** `npx stripe trigger charge.refunded`

**B. Merchant & Driver Stripe Connect (Payouts)**
When testing Merchant or Driver onboarding, you will be redirected to the Stripe Connect flow.
* **Email:** Use any mock email (e.g., `qa-driver-1@test.com`)
* **Phone:** Use `000-000-0000` (Stripe provides an instant bypass button for SMS in test mode)
* **Identity:** Use test ID verification (Stripe auto-fills fake SSNs like `000-00-0000` in test mode).
* **Bank Routing:** Use `110000000`.

---

## 3. Testing POS Integrations (Toast, Square, Clover)

To test kitchen systems without hardware, use the included Mock Script to simulate physical POS tablets clicking "Accept Order" or "Order Ready".

1. Ensure the Local Server (`npm run dev`) is running.
2. In a separate terminal, trigger the script:
   ```bash
   # Test a Toast POS order confirmation
   npx tsx scripts/mock_pos_update.ts --pos=toast --status=confirmed --orderId=TEST_ORDER_123

   # Test Square marking an order ready
   npx tsx scripts/mock_pos_update.ts --pos=square --status=ready --orderId=TEST_ORDER_123

   # Test Clover canceling an order
   npx tsx scripts/mock_pos_update.ts --pos=clover --status=canceled --orderId=TEST_ORDER_123
   ```
3. Look at your Merchant Dashboard (`/merchant/dashboard`). The incoming orders queue should update instantly without a page refresh!

---

## 4. Testing IFrames & External Integrations

TrueServe allows Merchants (like those on GoHighLevel) to embed their restaurant menu directly into external websites.

**Non-Prod Test:** 
1. Navigate to any local restaurant menu, then append `?embed=true` to the URL.
   * Example: `http://localhost:3000/restaurants/YOUR-RESTAURANT-ID?embed=true`
2. **Success Criteria:** The Top Navbar and Bottom Footer must completely disappear. The background should become transparent, and only the menu + checkout sidebar should be visible. 

**Production Test:** 
Repeat the same exact step on the live domain (e.g., `https://www.trueservedelivery.com/restaurants/pizza-palace?embed=true`). Ensure responsiveness scales correctly on mobile iframe viewports.

---

## 5. Testing Portals (Driver, Merchant, Admin)

**A. Mock Users & Auth State**
Since Supabase manages authentication, you do not need real phone numbers to log in on Local.
* Navigate to `/test-env` (if enabled) or use Magic Auth Links caught by a local mailhog/console log if testing full flows. 
* To test **Driver Sign Up**, fill the application with mock text. The data will hit the `Driver` table in your local/preview Supabase project with status `PENDING`.

**B. Admin Portal (`/admin/dashboard`)**
* Verify that you can see pending Driver and Merchant applications.
* Test the **Approve** button. This should change the status in Supabase and trigger a webhook/email to the applicant.

---

## 6. Testing Maps & Real-Time Tracking

To test Google Maps / Mapbox routing without actually driving a car:
1. **Create a Mock Order:** Check out via the app as a customer. Note the Order ID. 
2. **Accept Order:** Go to the Merchant Dashboard and accept the order. 
3. **Dispatch Driver:** Through the Admin or Driver portals, assign the mock order to a mock driver account.
4. **Tracking Page (`/orders/[id]`):** Open this page as the customer to view the Map.
5. **Criteria:** 
   * Ensure the UI displays the Uber-style pulsing radar marker.
   * Verify the map plots a polyline route from the Merchant Location -> Customer Location.

*(Note: Ensure `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is active in your `.env.local` to prevent gray map boxes).*

---

## 7. Testing Photo Uploads

Validating Supabase Storage Buckets:
1. **Driver Portal:** Go to Dashboard -> Account Settings. Upload a `.png` or `.jpg` as the Profile Photo.
2. **Merchant Portal:** Upload an image for a new Menu Item.
3. **Success Criteria:** The UI should immediately re-render to display the new image. Go to the Supabase Dashboard -> **Storage**, and verify the file physically deposited into the correct bucket (`avatars` or `menu-items`).

---

## 8. Testing Claude AI, Chats, & Automation

TrueServe leans heavily on Anthropic's Claude to automate Merchant operations.
1. **Menu Scanner (Merchant Portal):** 
   * Go to "Your Menu". Click **Scan Menu**.
   * Upload an image of a handwritten or messy physical menu.
   * **Criteria:** Claude should process the image and automatically populate the UI with formatted dish names, prices, and descriptions.
2. **Intelligent Triage / Chats:**
   * Submit a highly complex mock complaint through the Customer Support portal.
   * **Criteria:** The `triage.ts` agent should correctly classify the support ticket (e.g., "Missing Item", "Driver Late") and output automated responses based on priority.

*(Note: Verify `ANTHROPIC_API_KEY` exists in the local environment, otherwise AI features will return a 500 Server Error).*
