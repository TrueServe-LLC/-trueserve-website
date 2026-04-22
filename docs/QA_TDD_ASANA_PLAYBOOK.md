# TrueServe QA, TDD, and Asana Playbook

This playbook is the working guide for QA, developers, and project managers. It covers how to test safely, how to write unit tests in a TDD loop, how to use scenario responders for repeatable flows, and how to write clear Asana work items.

## 1) Environment rules

- **Production** is for real traffic only.
- **Preview** and **development** are the only places where mock users, mock drivers, and QA tooling should appear.
- Any feature that creates mock data must be hard-blocked in production.
- Use real customer/merchant/driver records only after the pilot is approved.

## 2) QA execution process

### A. Local setup

1. Start the app with `npm run dev`.
2. Confirm `.env.local` contains test-only credentials.
3. Open the relevant portal:
   - Merchant: `/merchant/login`
   - Driver: `/driver/login`
   - Admin: `/admin/login`

### B. Stripe testing

Use Stripe CLI whenever a flow depends on payments or webhooks:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhook/stripe
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger checkout.session.completed
```

Recommended QA checks:
- Merchant onboarding completes with Stripe Connect.
- Driver payout setup completes with Stripe Connect.
- Checkout succeeds with test cards and fails cleanly on declined cards.
- Webhook-driven UI updates happen after the Stripe event is triggered.

### C. Driver signup QA

Test the driver signup flow in preview or local only:
- Upload ID, insurance, and registration documents.
- Confirm the application lands in the admin review queue.
- Confirm the documents resolve through signed URLs only.
- Confirm email and SMS notifications fire to the test inbox/phone path.

### D. Merchant signup QA

Test merchant signup with:
- Business details
- Restaurant creation
- Stripe onboarding
- Menu / compliance / storefront setup

Success means the merchant record is created, routed for review, and the dashboard reflects the new onboarding state.

### E. Document verification QA

For document-heavy flows:
- Verify upload success
- Verify document metadata is stored
- Verify the admin can open review links
- Verify the public portal cannot expose the raw file path

## 3) TDD guide for developers

Use the red → green → refactor loop:

1. **Red** — write the failing test first.
2. **Green** — implement the smallest change that makes it pass.
3. **Refactor** — clean up names, structure, and duplication.

### What to test first

- Server actions
- Validation helpers
- Role-based access checks
- Payment and webhook state changes
- Document verification logic

### Suggested test boundaries

- **Jest** for unit and integration tests.
- **Playwright** for full portal flows.
- Mock Supabase, Stripe, and external APIs at the boundary, not inside the business logic.

### Good unit-test habits

- One behavior per test.
- Use realistic fixtures.
- Avoid large snapshot tests for business logic.
- Prefer explicit expectations over broad “works” assertions.

### Example TDD sequence

1. Add a failing test for driver document rejection.
2. Implement the validation branch in the server action.
3. Assert the admin review status changes correctly.
4. Refactor the shared validation into a helper if needed.

## 4) Test Responders for repeatable scenarios

Use “Test Responders” as scenario-specific fixtures that return the same shape every time a flow is exercised.

### Recommended responder scenarios

- **Driver signup responder**
  - Returns a valid profile, phone, and uploaded document set.
  - Supports pending, approved, and rejected outcomes.

- **Merchant signup responder**
  - Returns business details, restaurant payload, and Stripe onboarding state.
  - Supports incomplete, in-review, and approved outcomes.

- **Mock document responder**
  - Returns license, insurance, and registration metadata.
  - Supports missing-file and corrupted-file scenarios.

- **Stripe responder**
  - Returns success, decline, pending verification, and webhook retry states.

- **Support chat responder**
  - Returns user messages, human escalation states, and resolved-thread states.

### How to use them

- In **Jest**, use mocks to replace the API boundary.
- In **Playwright**, use route interception for scenario-specific payloads.
- Keep each responder named by user journey, not by implementation detail.

### Naming example

- `driverSignupResponder`
- `merchantSignupResponder`
- `documentReviewResponder`
- `stripeOnboardingResponder`
- `supportChatResponder`

## 5) Asana writing standards

### User story template

Use this shape in Asana:

- **Title**: `[Story] Short outcome`
- **Who**: the role or user type
- **What**: what they need to do
- **Why**: the business value
- **Acceptance criteria**: measurable pass/fail bullets
- **Dependencies**: APIs, data, approvals, screenshots

### Good user story example

**Title:** `[Story] Driver can upload documents during onboarding`

**Who:** Driver applicant  
**What:** Upload license, insurance, and registration documents  
**Why:** So the admin team can verify the driver before activation  
**Acceptance criteria:**
- Upload completes successfully
- Documents appear in the admin review queue
- Admin can approve or reject the application
- Production hides mock/test records

### Bug card template

Use this shape for bugs:

- **Title**: `[Bug] Short symptom`
- **Environment**: production / preview / development
- **Severity**: P0 / P1 / P2 / P3
- **Steps to reproduce**
- **Expected result**
- **Actual result**
- **Evidence**: screenshots, videos, logs, request IDs
- **Owner**: who should fix it

### Good bug example

**Title:** `[Bug] Admin support active chats box overflows on mobile`

**Environment:** Preview  
**Severity:** P2  
**Expected:** Chat list stays aligned and readable on smaller screens  
**Actual:** Cards collapse and overlap the compose bar  
**Evidence:** screenshot + browser console

## 6) What QA should record before a release

- Which environment was tested
- Which Stripe mode was used
- Which login path was used
- Which scenario responder or test fixture was used
- Screenshots for any layout or flow issue
- The exact URL and timestamp for bugs

## 7) What stays out of production

- Mock users
- Mock drivers
- QA-only creation tools
- Test OTP bypass helpers
- Cleanup buttons for synthetic data

Production should stay clean, real, and easy to trust.

