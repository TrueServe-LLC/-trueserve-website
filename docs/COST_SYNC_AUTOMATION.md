# Cost Sync Automation

This guide explains how to set up automatic cost syncing so your Cost Management dashboard always has up-to-date data.

## Automatic Daily Sync with Vercel Cron

The easiest way to automate cost syncing is using Vercel's built-in Cron Jobs feature.

### Setup Steps

1. **Add Cron Secret to Vercel:**
   - Go to your [Vercel Project Settings](https://vercel.com/dashboard)
   - Navigate to Settings → Environment Variables
   - Add a new variable:
     - Name: `CRON_SECRET`
     - Value: Generate a random secret (e.g., `sync_abc123xyz789`)
   - Redeploy your project

2. **Update vercel.json:**

If you don't have a `vercel.json` file, create one in your project root:

```json
{
  "crons": [
    {
      "path": "/api/admin/cost-sync",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Cron Schedule Explanation:**
- `0 2 * * *` = Daily at 2:00 AM UTC
- `0 0 * * 0` = Weekly on Sunday at midnight UTC
- `0 2 1 * *` = Monthly on 1st at 2:00 AM UTC

Choose your preferred schedule based on your needs.

3. **Verify Setup:**
   - Deploy your project
   - Go to Vercel dashboard
   - Check "Deployments" → "Cron Jobs" section
   - You should see your scheduled job

4. **Monitor Execution:**
   - Check Vercel logs to see cron job execution
   - Look for `[Cost Sync Cron]` messages in logs
   - Verify `ServiceCost` table updates in Supabase

---

## Alternative: GitHub Actions

If you prefer not to use Vercel Crons, you can use GitHub Actions:

1. **Create workflow file:**
   `.github/workflows/sync-costs.yml`:

```yaml
name: Daily Cost Sync

on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM UTC

jobs:
  sync-costs:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger cost sync
        run: |
          curl -X POST https://your-domain.com/api/admin/cost-sync \
            -H "Authorization: Bearer ${{ secrets.ADMIN_API_TOKEN }}" \
            -H "Content-Type: application/json"
```

2. **Add API Token:**
   - Go to your GitHub repo Settings → Secrets
   - Add `ADMIN_API_TOKEN` with a secure token
   - This token should be rotated periodically

3. **Verify:**
   - Check GitHub Actions tab for workflow runs
   - Monitor your app logs for sync activity

---

## Manual Sync Options

### Via Admin Dashboard

1. Go to `/admin/cost-management`
2. Click "Sync Costs" button
3. Wait for completion
4. Check results

### Via API

**With authentication:**
```bash
curl -X POST https://your-domain.com/api/admin/cost-sync \
  -H "Cookie: [your-auth-cookie]" \
  -H "Content-Type: application/json"
```

**Sync specific month:**
```bash
curl -X POST 'https://your-domain.com/api/admin/cost-sync?month=2026-03&checkAnomalies=true' \
  -H "Cookie: [your-auth-cookie]"
```

---

## What Gets Synced

Each sync operation:

1. **Fetches from all configured services:**
   - Stripe invoices
   - Google Cloud billing (if configured)
   - Supabase usage metrics
   - Mapbox request counts
   - Resend email counts
   - Vonage SMS/voice usage

2. **Updates ServiceCost table:**
   - Monthly cost per service
   - Usage metrics (API calls, storage, etc.)
   - API source and sync timestamp
   - Uses `UPSERT` to avoid duplicates

3. **Optionally checks for anomalies:**
   - Compares costs against 12-month history
   - Detects unusual spikes (>2 standard deviations)
   - Creates alerts with severity levels (LOW/MEDIUM/HIGH/CRITICAL)

4. **Logs the operation:**
   - Success/failure status
   - Number of services synced
   - Any errors encountered

---

## Monitoring & Alerting

### Check Last Sync

View when the last sync occurred:
- Cost Management dashboard shows "Last synced" timestamp
- Data stored in `localStorage` (dashboard only)
- Check Vercel/GitHub logs for historical runs

### Email Alerts on Failure

To get notified of sync failures, set up Vercel alerting:

1. Go to Vercel Project Settings
2. Navigate to Notifications
3. Configure email/Slack alerts for failed deployments
4. Cron failures will trigger these alerts

### Monitor via Supabase

Check sync activity directly:

```sql
-- View most recent cost records
SELECT service, month, cost, lastSyncedAt 
FROM "ServiceCost"
ORDER BY lastSyncedAt DESC
LIMIT 10;

-- View cost anomalies
SELECT service, month, actualCost, expectedCost, percentDeviation, severity
FROM "CostAnomaly"
ORDER BY createdAt DESC
LIMIT 10;
```

---

## Troubleshooting

### Cron job not running
- Verify `vercel.json` has correct syntax
- Check that `CRON_SECRET` is set in Vercel environment
- Deploy after adding cron configuration
- Check Vercel logs for any errors

### Partial sync (some services missing)
- Verify API keys are set for all services
- Check each service's API is accessible
- See `COST_MANAGEMENT_API_SETUP.md` for per-service setup

### Sync takes too long
- Multiple API calls may cause timeout (>60 seconds)
- This is normal for first-time syncs
- Subsequent syncs should be faster
- Increase Vercel timeout if available

### Sync succeeds but no data appears
- Check that sync result shows services synced
- Verify environment variables are correct
- Check Supabase directly for ServiceCost records
- Review browser console for JavaScript errors

---

## Best Practices

1. **Schedule during off-peak hours:**
   - Avoid business hours when possible
   - 2 AM UTC is a good default for most businesses
   - Adjust based on your timezone

2. **Sync frequency:**
   - Daily is ideal for most teams (catches cost spikes)
   - Weekly is acceptable for stable costs
   - Monthly is too infrequent for budget management

3. **Review costs regularly:**
   - Check dashboard after each sync
   - Review anomaly alerts immediately
   - Address budget overages promptly

4. **Keep API keys secure:**
   - Use Vercel environment variables (not hardcoded)
   - Rotate keys periodically
   - Use least-privilege API scopes

5. **Archive old data:**
   - Keep 24+ months for trend analysis
   - Archive older data for compliance
   - Monitor database growth

---

## Cost of Automation

- **Vercel Crons:** Included in standard Vercel plans (no extra cost)
- **GitHub Actions:** 2,000 minutes/month free for private repos
- **API calls:** Charged by each service, but minimal (typically <$0.01/month)

---

## Next Steps

1. ✅ Set up API credentials (see `COST_MANAGEMENT_API_SETUP.md`)
2. ✅ Configure cron job (this guide)
3. ✅ Monitor first sync via dashboard
4. ✅ Set up budget alerts for critical services
5. ✅ Review anomaly detection alerts
6. ✅ Set up email notifications (optional)

