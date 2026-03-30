
# TrueServe QA Onboarding Guide

> **For QA Testers** — Everything you need to test the TrueServe platform.  
> Last updated: March 2026

---

## 📋 Table of Contents
1. [Getting Access](#1-getting-access)
2. [Local Environment Setup](#2-local-environment-setup)
3. [Stripe Test Cards & Payment Testing](#3-stripe-test-cards--payment-testing)
4. [Running Tests](#4-running-tests)
5. [Key Testing Flows](#5-key-testing-flows)
6. [Tool Reference](#6-tool-reference)
7. [Mock Data Reference](#7-mock-data-reference)
8. [Reporting Issues](#8-reporting-issues)

---

## 1. Getting Access

### Repository Access
The codebase is hosted on GitHub/Vercel. To get access:

1. **GitHub** — The repo owner adds you as a collaborator:
   - Repo → Settings → Collaborators → Add people → enter your GitHub username
   - You'll receive an email invitation to accept

2. **Vercel** (for preview deployments):
   - Vercel Dashboard → Settings → Members → Invite
   - Role: `Viewer` (for previews) or `Developer` (for deploy access)

3. **Supabase** (database access, if needed):
   - Supabase Dashboard → Settings → Members → Invite
   - Role: `Read-Only` for QA

4. **Asana** (task management):
   - Already integrated into Admin Portal at `/admin/dashboard`
   - Direct access: https://app.asana.com/0/1213802368265152/board

5. **Jira Triage Center** (incident reporting):
   - https://lcking992-1774309654202.atlassian.net/servicedesk/customer/portal/1

### Test Account Credentials

| Role | Login URL | Method |
|------|-----------|--------|
| Customer | `/login` | Google OAuth or Phone (SMS OTP) |
| Merchant | `/merchant/login` | Email/Password |
| Driver | `/driver/login` | Phone (SMS OTP) |
| Admin | `/admin/login` | Admin credentials (ask team lead) |

---

## 2. Local Environment Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd trueserve-website

# 2. Install dependencies
npm install

# 3. Install Playwright browsers (for E2E tests)
npx playwright install

# 4. Copy environment file
cp .env.example .env.local
# Ask team lead for actual values

# 5. Start development server
npm run dev
# App runs at http://localhost:3000

# 6. Verify setup
npm test          # Run unit tests (Jest)
npm run test:e2e  # Run E2E tests (Playwright)
```

### Required Tools
| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18.x | Runtime |
| npm | ≥ 9.x | Package manager |
| Git | Latest | Version control |
| Chrome | Latest | Primary test browser |

---

## 3. Stripe Test Cards & Payment Testing

> ⚠️ **IMPORTANT**: Never use real card numbers in test/staging environments.  
> Always use Stripe's official test card numbers below.

### ✅ Successful Payment Cards

| Card Number | Brand | Use Case |
|------------|-------|----------|
| `4242 4242 4242 4242` | Visa | **Standard success** — Use this for most tests |
| `5555 5555 5555 4444` | Mastercard | Standard success |
| `3782 822463 10005` | Amex | Standard success |
| `6011 1111 1111 1117` | Discover | Standard success |

### ❌ Decline & Error Cards

| Card Number | Error Type | Use Case |
|------------|-----------|----------|
| `4000 0000 0000 0002` | Card declined | Test decline handling |
| `4000 0000 0000 9995` | Insufficient funds | Test insufficient funds |
| `4000 0000 0000 9987` | Lost card | Test lost card flow |
| `4000 0000 0000 0069` | Expired card | Test expired card message |
| `4000 0000 0000 0127` | Incorrect CVC | Test CVC validation |
| `4100 0000 0000 0019` | Blocked (fraud) | Test fraud detection |

### 🔐 3D Secure / Authentication Cards

| Card Number | Behavior |
|------------|----------|
| `4000 0025 0000 3155` | Requires 3DS authentication |
| `4000 0000 0000 3220` | 3DS2 — always authenticates |
| `4000 0000 0000 3063` | 3DS2 — authentication fails |

### Card Details (for all test transactions)
- **Expiry**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`) — Amex uses 4 digits (e.g., `1234`)
- **ZIP**: Any 5 digits (e.g., `28202`)
- **Name**: Any name

### Testing Stripe Webhooks Locally
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhook/stripe

# In another terminal, trigger test events
stripe trigger payment_intent.succeeded
stripe trigger checkout.session.completed
```

---

## 4. Running Tests

### Unit Tests (Jest)
```bash
# Run all unit tests
npm test

# Run specific test suite
npm test -- --testPathPattern="payout"

# Run in watch mode (re-runs on file change)
npm run test:watch

# Run security tests only
npm run test:security

# Run with coverage report
npm test -- --coverage
```

### E2E Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/example.spec.ts

# Run with browser visible (headed mode) — great for debugging
npx playwright test --headed

# Run in specific browser
npx playwright test --project=chromium
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"

# Run with step-by-step debug mode
npx playwright test --debug

# View the HTML test report
npx playwright show-report

# Run with trace recording (for debugging failures)
npx playwright test --trace on
```

### Test Structure

```
__tests__/                          # Jest unit tests
├── actions/                        # Server action tests
│   └── orderActions.test.ts
├── components/                     # Component tests
│   └── GoogleMapsMap.test.tsx
├── integration/                    # Integration tests
│   ├── order_flow.test.ts
│   └── payout.test.ts
├── lib/                            # Library tests
├── security/                       # Security/auth tests
│   └── auth.test.ts
├── onboarding_tester_examples.test.ts  # ★ Start here!
├── order_logic.test.ts
└── phone_utils.test.ts

e2e/                                # Playwright E2E tests
├── example.spec.ts                 # Basic navigation tests
├── mobile_layout.spec.ts           # Mobile responsive tests
├── mobile_nav.spec.ts              # Mobile navigation tests
├── checkout.spec.ts                # ★ Checkout flow (full e2e)
└── driver_signup.spec.ts           # ★ Driver onboarding flow
```

---

## 5. Key Testing Flows

### Flow 1: Customer Order (Happy Path)
1. Navigate to `/restaurants`
2. Select a restaurant with menu items
3. Add items to cart
4. Click "Checkout"
5. Enter delivery address
6. Enter Stripe test card: `4242 4242 4242 4242`
7. Complete payment
8. ✅ Verify: Order appears in merchant dashboard
9. ✅ Verify: Order appears in admin "Live Monitor"

### Flow 2: Customer Order (Decline)
1. Same as above, but use card `4000 0000 0000 0002`
2. ✅ Verify: Decline error message displays
3. ✅ Verify: No order is created

### Flow 3: Driver Sign-Up
1. Navigate to `/driver`
2. Click "Apply Now" → fills out form
3. Upload ID, insurance, vehicle registration
4. Sign contractor agreement
5. ✅ Verify: Application appears in Admin Dashboard under "Driver Applications"
6. Admin approves → driver receives email + SMS

### Flow 4: Merchant Onboarding
1. Navigate to `/merchant`
2. Sign up with business info
3. Connect Stripe account
4. Add menu items via Merchant Dashboard
5. ✅ Verify: Menu items appear with "PENDING" status in Admin
6. Admin approves → items become visible to customers

### Flow 5: Mobile Responsiveness
1. Open Chrome DevTools → Toggle Device Toolbar
2. Test on: iPhone 13, Pixel 5, iPad
3. ✅ Verify: Bottom nav appears on mobile
4. ✅ Verify: No horizontal overflow
5. ✅ Verify: Touch targets ≥ 44px

---

## 6. Tool Reference

### Admin Portal Tools
| Tool | Location | Purpose |
|------|----------|---------|
| **Admin Dashboard** | `/admin/dashboard` | KPIs, order monitoring, approvals |
| **Scenario Engine** | `/admin/dashboard` (scroll down) | Financial modeling & driver pay simulations |
| **Asana Board** | `/admin/dashboard` (scroll down) | Task management — view/create QA tasks |
| **Triage Center** | Nav bar (top right) | Jira incident reporting portal |
| **KPI Dashboard** | `/admin/dashboard` | Revenue, order volume, driver metrics |
| **System Toggle** | `/admin/dashboard` (top) | Enable/disable ordering system |
| **Pricing Manager** | `/admin/pricing` | Adjust delivery fees, service charges |
| **Settings** | `/admin/settings` | System configuration |
| **Team Manager** | `/admin/team` | Manage staff and roles |
| **CMS** | `/admin/content` | In-app content management (policies, terms) |

### External Tools
| Tool | URL | Purpose |
|------|-----|---------|
| **Stripe Dashboard** | https://dashboard.stripe.com | Payment monitoring, test transactions |
| **Supabase Dashboard** | https://supabase.com/dashboard | Database inspection, RLS policies |
| **Vercel Dashboard** | https://vercel.com | Deployment status, preview URLs |
| **Asana** | https://app.asana.com/0/1213802368265152/board | Project management, task tracking |
| **LaunchDarkly** | Dashboard (ask for access) | Feature flags |

### Browser DevTools Tips
- **Network tab**: Check API responses for `/api/` routes
- **Console**: Look for `[MOCK]` prefixes indicating mock data
- **Application → Cookies**: Check `admin_session`, `session` cookies
- **Lighthouse**: Run accessibility + performance audits

---

## 7. Mock Data Reference

The platform uses mock data in non-production environments. Mock restaurants have `(Mock)` in their name and `isMock: true` in the database.

### Mock Restaurants (with menus)
| Name | Location | Has Menu Items? |
|------|----------|----------------|
| Carolina BBQ Pit | Charlotte, NC | ✅ 3 items |
| Queen City Burger | Charlotte, NC | ✅ 2 items |
| North Star Diner | Ramsey, MN | ✅ 2 items |
| Sushi Zen | Charlotte, NC | ✅ 1 item |
| Old Town Kitchen | Rock Hill, SC | ✅ 2 items |
| Legal Remedy Brewery | Rock Hill, SC | ✅ 2 items |
| The Flipside Restaurant | Rock Hill, SC | ✅ 2 items |

### Mock Restaurants (empty menus — for edge case testing)
Mamma Mia, Taco Loco, Morning Grind, Sub Hub, Ocean's Best, Golden Wing, Pizza Planet, Sweet Dreams

### Data Location
- Mock definitions: `lib/mocks.ts`
- Mock usage detection: Look for `isMock: true` property
- Feature flags: LaunchDarkly key in `.env.local`

---

## 8. Reporting Issues

### Via Asana (preferred for QA tasks)
1. Admin Dashboard → Asana Board → "+ New Task"
2. Select appropriate section (e.g., "QA", "In Progress")
3. Include:
   - **Title**: `[BUG] Brief description` or `[QA] Test case name`
   - **Notes**: Steps to reproduce, expected vs actual, screenshots
   - Tag appropriately

### Via Jira Triage Center (for production incidents)
1. Admin Dashboard → "Triage Center" (top nav)
2. Or direct: https://lcking992-1774309654202.atlassian.net/servicedesk/customer/portal/1
3. Priority levels:
   - **P0**: System down, payments failing
   - **P1**: Major feature broken
   - **P2**: Minor bug, workaround exists
   - **P3**: Cosmetic / enhancement

### Bug Report Template
```
## Bug Report
**Environment**: [Production / Staging / Local]
**Browser**: [Chrome 120 / Safari 17 / Mobile Chrome]
**URL**: [exact page URL]

### Steps to Reproduce
1. 
2. 
3. 

### Expected Result
[What should happen]

### Actual Result
[What actually happened]

### Screenshots / Video
[Attach here]

### Console Errors
[Copy any red errors from browser console]
```

---

## Quick Reference Card

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start local server at :3000 |
| `npm test` | Run Jest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:security` | Run auth security tests |
| `npx playwright test --headed` | E2E with visible browser |
| `npx playwright show-report` | View last test report |
| `npx playwright test --debug` | Step-through debugging |
| `stripe listen --forward-to localhost:3000/api/webhook/stripe` | Local webhook testing |
