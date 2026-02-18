
# Production Transition Checklist

This document outlines the steps required to transition the application to a production environment for SMS, Drivers, and Restaurants.

## 1. Database Schema Updates (CRITICAL)

The current code expects a `phone` column in the `User` table for SMS notifications, but it is currently missing.

**Action Required:** Run the following SQL in your Supabase SQL Editor:

```sql
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
CREATE INDEX IF NOT EXISTS "idx_user_phone" ON "User"("phone");
```

## 2. Environment Variables (`.env`)

You need to switch from Test credentials to Live credentials.

| Variable | Action | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | **Update** | Change `http://localhost:3000` to your production domain (e.g., `https://trueserve.com`). |
| `STRIPE_SECRET_KEY` | **Update** | Replace `sk_test_...` with your **Live** Secret Key (`sk_live_...`). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Update** | Replace `pk_test_...` with your **Live** Publishable Key (`pk_live_...`). |
| `TWILIO_PHONE_NUMBER` | **Update** | Ensure this is a purchased, active Twilio number (not a trial number). |
| `TWILIO_ACCOUNT_SID` | **Verify** | Ensure this matches your live project. |
| `TWILIO_AUTH_TOKEN` | **Verify** | Ensure this matches your live project. |

## 3. Feature-Specific Transition Steps

### SMS (Twilio)
- [ ] **Upgrade Account**: Ensure your Twilio account is upgraded from Trial.
- [ ] **A2P 10DLC Registration**: For US carriers, you MUST register your Brand and Campaign to avoid message filtering. This is mandatory for production traffic.
- [ ] **Error Handling**: The current `sendSMS` function logs errors. Consider integrating a monitoring service (like Sentry) to track delivery failures.

### Drivers (Stripe Connect)
- [ ] **Account Onboarding**: The app uses `Express` accounts. In Test mode, you use skip-forms. In Production, real drivers must provide SSN and banking info.
- [ ] **Manual Approval**: Driver applications are created with status `PENDING_APPROVAL`.
    - You must manually check the `Driver` table in Supabase.
    - Validate their uploaded ID (link in `Driver.idDocument` or typically managed via email notification).
    - Update `Driver.status` to `ONLINE` or `APPROVED` manually.
- [ ] **Payouts**: Ensure your Stripe Connect Platform account has a sufficient balance to pay out drivers (or configure "payouts occupy platform balance").

### Restaurants (Merchants)
- [ ] **Stripe Onboarding**: Merchants can sign up via `/merchant`. This creates a Stripe Express account.
    - Test this flow with a real small transaction before launching.
- [ ] **Menu Management**: The Merchant Dashboard allows adding items.
    - Verify that new items appear correctly on the customer-facing site (`/restaurants/[id]`).
- [ ] **Service Locations**:
    - The `seed_nc_restaurants.ts` file sets up initial locations.
    - In production, ensure `ServiceLocation` table is populated with the cities you officially support.

## 4. Final Deployment Steps
- [ ] **Build Check**: Run `npm run build` locally to ensure no build errors.
- [ ] **Console Logs**: Remove or silence `console.log` statements in sensitive files (like `lib/sms.ts` which logs bodies).
- [ ] **Security**: Review Supabase RLS policies (in `db/rls_policies.sql`) to ensure `User.phone` is only visible to the user themselves and Admins.

