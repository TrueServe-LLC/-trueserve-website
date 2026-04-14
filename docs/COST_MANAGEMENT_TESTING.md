# Cost Management Testing Guide

This guide walks through testing the Cost Management dashboard and API integrations.

## Pre-Testing Checklist

- [ ] Database schema applied (`cost_management_schema.sql`)
- [ ] Environment variables set (at least `STRIPE_SECRET_KEY`)
- [ ] Dev server running (`npm run dev`)
- [ ] Logged in as admin
- [ ] Supabase project accessible

## Testing Phases

### Phase 1: Admin Access & Layout

**Test:** Can access cost management dashboard

1. Navigate to `http://localhost:3000/admin/cost-management`
2. Should see cost management page with header "Cost Management"
3. Should display "Track and manage spending across all services"
4. Should **not** redirect to login (verify you're logged in as admin)

**Expected:**
- ✅ Page loads without errors
- ✅ Dark theme applies correctly
- ✅ Header and navigation visible
- ✅ No console errors

---

### Phase 2: Sync Manager Component

**Test:** Sync Manager UI appears and responds to clicks

1. Scroll to top of page
2. Should see "Data Synchronization" section with:
   - Title and description
   - "Sync Costs" button (yellow/gold)
   - "Check Anomalies" button (grey)
   - Configuration info box showing required environment variables

**Expected:**
- ✅ Sync buttons are visible and enabled
- ✅ Configuration box shows the list of required env vars
- ✅ Currently configured: Stripe only (or more if you set them up)

---

### Phase 3: Manual Cost Sync

**Test:** Click "Sync Costs" and verify sync works

1. Click the yellow "Sync Costs" button
2. Button should show "Syncing..." with spinning icon
3. Wait for completion (10-30 seconds)

**Expected outcomes:**

**Success (if STRIPE_SECRET_KEY is set):**
- ✅ Button returns to "Sync Costs"
- ✅ Green success box appears: "Sync Successful"
- ✅ Message shows: "Synced X service costs for [current month]"
- ✅ "Last synced: [timestamp]" appears
- ✅ Stripe data appears in cost dashboard below

**Partial Success (if only Stripe configured):**
- ✅ Shows "Synced 1 service costs for [current month]"
- ✅ Only Stripe cost appears in dashboard
- ✅ Other services skipped (expected behavior)

**Failure (if no API keys):**
- ✅ Red error box appears
- ✅ Message says "No service costs fetched. Verify API credentials."
- ✅ This is expected without API keys configured

---

### Phase 4: Cost Dashboard Display

**Test:** Dashboard shows cost data and visualizations

After successful sync, scroll down to see:

1. **Summary Cards** (top row):
   - Current month cost (shows $X.XX)
   - Monthly average
   - Year-to-date cost
   - Projected annual cost

2. **Top Services by Cost** (middle section):
   - Service name with colored dot
   - Cost amount
   - Progress bar showing percentage
   - "% of total" label

3. **Cost Forecast** (if available):
   - Next 3 months projected
   - Confidence badges (🎯 HIGH, ⚠️ MEDIUM, ❓ LOW)

**Expected:**
- ✅ All cards display without errors
- ✅ Numbers format correctly ($X,XXX.XX)
- ✅ Progress bars show proportions
- ✅ Colors are consistent and readable

---

### Phase 5: Anomaly Detection

**Test:** Click "Check Anomalies" button

1. Click grey "Check Anomalies" button
2. Should show loading state
3. Check result appears (blue box)

**Expected:**
- ✅ Shows "Anomaly Check Complete"
- ✅ Message indicates number of anomalies found
- ✅ Anomalies listed with:
  - Service name and month
  - Description of deviation
  - Expected vs actual cost
  - Percentage difference

**Note:** Anomaly detection requires 2+ months of data to work properly. First sync will show "Not enough data for anomaly detection" - this is normal.

---

### Phase 6: Stripe Integration (if API key set)

**Prerequisites:**
- `STRIPE_SECRET_KEY` environment variable set
- Recent Stripe invoices exist (from current month)

**Test:** Stripe data syncs correctly

1. Click "Sync Costs"
2. Wait for completion
3. Check Stripe cost appears in dashboard
4. Open Supabase dashboard in another tab
5. Go to Database → Tables → ServiceCost
6. Filter by `service = 'stripe'`
7. Verify records exist with:
   - ✅ Service: "stripe"
   - ✅ Month: Current month (YYYY-MM)
   - ✅ Cost: Positive number
   - ✅ UsageMetric: "X invoices processed"
   - ✅ ApiSource: "stripe_api"
   - ✅ lastSyncedAt: Recent timestamp

---

### Phase 7: Mobile Responsiveness

**Test on different screen sizes:**

1. **Mobile (375px - iPhone 12):**
   - `F12` → Device toolbar
   - Select iPhone 12
   - Page should:
     - ✅ Stack cards vertically
     - ✅ No horizontal scrolling
     - ✅ Text readable without zoom
     - ✅ Buttons are ≥44px height
     - ✅ Touch targets are spaced

2. **Tablet (768px - iPad):**
   - Select iPad in device toolbar
   - Page should:
     - ✅ Show 2 columns of summary cards
     - ✅ Service breakdown still readable
     - ✅ Forecast section formatted properly

3. **Desktop (1280px+):**
   - Drag browser to full width
   - Page should:
     - ✅ Show 4 summary cards in a row
     - ✅ Full layout with sidebar (if applicable)
     - ✅ All sections optimally spaced

---

### Phase 8: Error Handling

**Test:** Verify error messages are clear

1. **Simulate missing API key:**
   - Temporarily remove `STRIPE_SECRET_KEY`
   - Click "Sync Costs"
   - Should show appropriate error message

2. **Verify error styles:**
   - Error boxes should be red/dark with clear text
   - Icon and message should be prominent
   - No white-on-white or unreadable colors

---

### Phase 9: Data Persistence

**Test:** Data persists across page reloads

1. Perform a successful sync
2. Note the "Last synced" timestamp
3. Refresh the page (`F5`)
4. Check that:
   - ✅ Cost data still displays
   - ✅ Last synced timestamp same as before
   - ✅ No additional sync triggered

---

### Phase 10: Database Records

**Test:** Verify database records created correctly

1. Open Supabase dashboard
2. Go to Database → Tables → ServiceCost
3. Verify records exist with all required fields:
   - ✅ id (UUID)
   - ✅ service (varchar)
   - ✅ month (DATE, format: YYYY-MM-DD)
   - ✅ cost (DECIMAL)
   - ✅ usageMetric (varchar)
   - ✅ apiSource (varchar)
   - ✅ lastSyncedAt (TIMESTAMP)
   - ✅ createdAt (TIMESTAMP)
   - ✅ updatedAt (TIMESTAMP)

4. Check unique constraint:
   - Insert same service + month twice
   - Should update existing record, not create duplicate
   - Verify only 1 record exists per service/month combo

---

## Test Data Expectations

### After First Sync:

**With Stripe only:**
- 1 ServiceCost record (stripe)
- 1 row in summary cards
- 1 service in "Top Services" section

**With Multiple Services:**
- 1-6 ServiceCost records (depending on API keys set)
- Each service shows in dashboard
- Top 3-5 services shown with percentages

### After Multiple Syncs:

**With Same Month:**
- Records updated (not duplicated)
- Cost totals updated

**With Different Months:**
- Records added for each month
- Dashboard shows current month in summary
- Forecast starts to appear after 2+ months

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "No service costs fetched" | Missing API keys | Add environment variables |
| Stripe cost is $0 | No invoices in month | Create test invoice in Stripe |
| Data not appearing | Database connection issue | Check Supabase credentials |
| Buttons not responding | Network error | Check browser console for errors |
| Mobile layout broken | Responsive CSS missing | Verify Tailwind classes apply |
| Anomalies section empty | Insufficient history | Need 2+ months of data |

---

## Performance Testing

**Check load times:**

1. Open DevTools → Network tab
2. Hard refresh page (`Ctrl+Shift+R`)
3. Check:
   - ✅ Page loads < 3 seconds
   - ✅ API sync completes < 30 seconds
   - ✅ No failed requests in Network tab
   - ✅ No console errors or warnings

---

## Accessibility Testing

**Screen reader testing:**

1. Use built-in screen reader (Mac: VoiceOver, Windows: Narrator)
2. Verify:
   - ✅ All buttons have labels
   - ✅ Form inputs are labeled
   - ✅ Colors aren't the only indicator
   - ✅ Contrast ratios are sufficient (WCAG AA)

---

## Test Sign-Off Checklist

- [ ] Admin access works
- [ ] Sync manager displays correctly
- [ ] Manual sync succeeds (or shows expected error)
- [ ] Cost dashboard shows data
- [ ] Anomaly detection works (or shows expected message)
- [ ] Stripe integration syncs data (if API key set)
- [ ] Mobile responsive at 375px, 768px, 1280px
- [ ] Data persists across page reloads
- [ ] Database records created correctly
- [ ] Error messages are clear
- [ ] No console errors
- [ ] Load times acceptable
- [ ] Accessibility basics verified

---

## Next Steps

Once testing is complete:

1. **Fix any identified issues**
2. **Set up automatic syncing** (see `COST_SYNC_AUTOMATION.md`)
3. **Configure budget alerts** (set limits per service)
4. **Add remaining API integrations** (Google Cloud, Mapbox, etc.)
5. **Set up email notifications** for budget overages
6. **Monitor costs** regularly via dashboard

