# Cost Management API Integration Setup

This guide explains how to set up real API integrations for the Cost Management dashboard to sync actual costs from all service providers.

## Overview

The Cost Management system can fetch real costs from:
- **Stripe** - Payment processing costs
- **Google Cloud** - Infrastructure and API costs
- **Supabase** - Database and hosting costs
- **Mapbox** - Location services costs
- **Resend** - Email delivery costs
- **Vonage** - SMS and voice costs

## Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx

# Google Cloud
GCP_PROJECT_ID=your-project-id
GCP_BILLING_ACCOUNT_ID=000000-000000-000000

# Supabase
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_ACCESS_TOKEN=sbpa_xxxxxxxxxxxxx

# Mapbox
MAPBOX_ACCESS_TOKEN=pk_xxxxxxxxxxxxx
MAPBOX_USERNAME=your-mapbox-username

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Vonage
VONAGE_API_KEY=your-api-key
VONAGE_API_SECRET=your-api-secret
```

## Per-Service Setup Instructions

### 1. Stripe

**Get your API key:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click "Developers" → "API Keys"
3. Copy the "Secret key" (starts with `sk_live_`)
4. Add to `.env.local`: `STRIPE_SECRET_KEY=sk_live_xxxxx`

**What it syncs:**
- Monthly invoice totals
- Transaction counts
- Payment volume

**Cost calculation:**
- Uses Stripe's native billing API to fetch invoice amounts
- Automatically aggregates by month

---

### 2. Google Cloud

**Setup for Billing Export:**

1. **Enable BigQuery Export:**
   - Go to [Google Cloud Billing](https://console.cloud.google.com/billing)
   - Click on your billing account
   - Select "Billing export" → "BigQuery export"
   - Select or create a BigQuery dataset (e.g., `billing_export`)
   - Enable the export

2. **Create Service Account:**
   - Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
   - Click "Create Service Account"
   - Name: `cost-management-service`
   - Grant role: `BigQuery Data Editor`
   - Create a JSON key and save it

3. **Set environment variables:**
   ```bash
   GCP_PROJECT_ID=your-project-id
   GCP_BILLING_ACCOUNT_ID=000000-000000-000000
   # (Service account credentials would be loaded from a secrets file)
   ```

**What it syncs:**
- Compute Engine costs
- Cloud Storage costs
- API and service usage
- Data transfer costs

**Note:** Full implementation requires BigQuery client library and authentication setup. Currently a placeholder pending your GCP setup.

---

### 3. Supabase

**Get your credentials:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to "Settings" → "API"
4. Copy your **Project ID** and **Project URL**
5. Go to "Settings" → "Access Tokens" (or create one via Supabase CLI)
6. Create a new access token with `billing:read` scope

**Set environment variables:**
```bash
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_ACCESS_TOKEN=sbpa_xxxxxxxxxxxxx
```

**What it syncs:**
- Database usage (queries, storage)
- Real-time connection counts
- Bandwidth costs

---

### 4. Mapbox

**Get your credentials:**

1. Go to [Mapbox Account](https://account.mapbox.com)
2. Navigate to "Tokens" section
3. Copy your public token (starts with `pk_`)
4. Get your username from account settings

**Set environment variables:**
```bash
MAPBOX_ACCESS_TOKEN=pk_xxxxxxxxxxxxx
MAPBOX_USERNAME=your-username
```

**What it syncs:**
- API request counts
- Static map requests
- Routing requests
- Estimated costs based on request volume

**Pricing note:**
- Maps API: ~$3 per 100K requests
- Routing API: ~$5 per 50K requests
- Current implementation estimates based on request volume

---

### 5. Resend

**Get your API key:**

1. Go to [Resend Dashboard](https://resend.com/dashboard)
2. Navigate to "API Keys"
3. Create or copy your API key (starts with `re_`)

**Set environment variables:**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**What it syncs:**
- Total emails sent
- Bounce rates
- Delivery costs (after free tier)

**Pricing note:**
- Free: 100 emails per day
- Paid: $0.20 per email after free tier

---

### 6. Vonage (Nexmo)

**Get your credentials:**

1. Go to [Vonage Dashboard](https://dashboard.nexmo.com)
2. Navigate to "Account" → "Settings"
3. Copy your API Key and API Secret
4. (Optional) Set up Insights API for detailed usage

**Set environment variables:**
```bash
VONAGE_API_KEY=your-api-key
VONAGE_API_SECRET=your-api-secret
```

**What it syncs:**
- SMS sent count
- Voice minutes used
- Estimated costs

**Note:** Vonage integration requires Insights API setup. Currently a placeholder pending your Vonage configuration.

---

## Running Syncs

### Manual Sync

1. Go to Admin Dashboard → Cost Management
2. Click "Sync Costs" button
3. Wait for sync to complete
4. Results shown with success/failure status

### Automatic Sync (via Cron Job)

To sync costs automatically once per day at 2 AM UTC:

```bash
# Use the Claude scheduled tasks feature
# Or set up a cron trigger with Vercel/GitHub Actions
```

Example with Vercel Cron:
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/sync-costs",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Then create `/app/api/cron/sync-costs/route.ts`:
```typescript
import { syncAllServiceCosts } from "@/app/admin/cost-management/actions";

export async function POST(request: Request) {
  const result = await syncAllServiceCosts();
  return Response.json(result);
}
```

---

## Verifying Setup

After adding environment variables:

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Go to Cost Management dashboard:**
   - Navigate to `/admin/cost-management`
   - You should see the sync manager at the top

3. **Click "Sync Costs":**
   - Watch for success/failure messages
   - Check database for `ServiceCost` records

4. **Check logs:**
   ```bash
   # Look for logs in your terminal
   # Should see: "Successfully synced X service costs"
   ```

---

## Troubleshooting

### "No service costs fetched"
- Check that all environment variables are set correctly
- Verify API keys have correct permissions
- Check console logs for specific service errors

### Stripe sync fails
- Verify `STRIPE_SECRET_KEY` starts with `sk_live_` (not `sk_test_`)
- Check that invoices exist for the month being synced
- Ensure API key has read access to billing

### Google Cloud returns null
- BigQuery export may not be enabled yet (can take 24 hours)
- Service account may need additional permissions
- Check that billing account ID is correct

### Supabase returns null
- Access token may have expired
- Check token has `billing:read` scope
- Project ID should match your Supabase project

### Mapbox returns null
- Public token (starting with `pk_`) is required, not secret key
- Username must match account username exactly
- API may rate limit if many requests

### Resend returns null
- API key should start with `re_`
- Check key hasn't been revoked
- Ensure key has email read permissions

---

## Database Tables

Once synced, data is stored in:

- **ServiceCost** - Monthly costs by service
- **ServiceUsageMetrics** - Detailed usage metrics
- **CostTrend** - Historical trends and forecasts
- **CostAnomaly** - Detected unusual costs
- **BudgetAlert** - Budget configuration
- **CostOptimization** - Optimization recommendations

View synced data in Supabase dashboard:
```
Database → Tables → ServiceCost
```

---

## Next Steps

1. ✅ Set up environment variables for your services
2. ✅ Test each integration via manual sync
3. ✅ Set up automatic daily syncs
4. ✅ Create budget alerts for critical services
5. ✅ Review cost trends and anomalies
6. ✅ Set up email alerts for budget overages

---

## Support

If you encounter issues:

1. Check console logs for error messages
2. Verify API credentials in service dashboards
3. Ensure API keys have correct permissions
4. Check that data exists in the service for the requested month
5. Review the action logs in `/app/admin/cost-management/actions.ts`

For service-specific issues, check:
- [Stripe Docs](https://stripe.com/docs/billing/overview)
- [Google Cloud Docs](https://cloud.google.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Mapbox Docs](https://docs.mapbox.com)
- [Resend Docs](https://resend.com/docs)
- [Vonage Docs](https://developer.vonage.com)
