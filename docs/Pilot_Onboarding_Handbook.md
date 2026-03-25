# 🏛️ TrueServe: Pilot Onboarding & Operations Handbook (Step 20)

This document serves as the operational blueprint for transitioning TrueServe from sandbox to a live pilot environment. Follow these protocols for your first 5 merchants and elite driver fleet.

---

## 👨‍🍳 1. Merchant Onboarding Lifecycle

### A. Terminal Provisioning
1. **Signup:** Merchants register via `https://trueservedelivery.com/merchant-signup`.
2. **KYC:** Merchants complete Stripe Express onboarding (Bank info + Tax ID).
3. **POS Integration:** 
   - Navigate to **Merchant Dashboard** -> **Settings**.
   - Input **Toast Client ID** and **Client Secret**.
   - TrueServe automatically syncs existing menu items from the provider.
4. **Validation:** Perform a $1.00 test transaction to ensure the Stripe payout path is active.

---

## 🚚 2. Driver Fleet Enrollment & KYC

### A. Identity Verification Workflow
1. **Application:** Drivers apply via `/driver-signup`.
2. **Admin Review:** 
   - Login to the **Admin Registry**.
   - Download/View the `idDocument` and `insuranceDocument` from the Driver record.
   - Verify that the driver's vehicle type matches their provided license plate.
3. **Activation:** 
   - Manually toggle driver status to `ONLINE` once background verification is complete.
   - **Important:** Ensure the driver has completed Stripe Connect onboarding to receive payouts.

---

## 👁️ 3. Platform Monitoring & Health

### A. The KPI Command Center
Use the **Admin Analytics Dashboard** to monitor real-time health:
*   **Acceptance Rate:** If this drops below 85%, investigate the **Incident Log**.
*   **Avg CSAT:** Monitor for consistency. Low ratings trigger an automatic alert in the Audit Log for quality review.
*   **Trend Indicators:** Growth or decline alerts will signal if your pilot region is over-saturated with drivers.

### B. Audit Logs & Forensic Review
Every sensitive action is logged. In the event of a dispute:
1. Access the **Audit Registry**.
2. Filter by `targetId` (Order ID or User ID).
3. Review the `before` and `after` state changes to determine where a synchronization or operational failure occurred.

---

## 🛑 4. Disaster Recovery & Emergency
In the event of a critical system failure or POS provider outage:
1. **Broadcast Message:** Use the **Emergency Banner** (Step 16) to notify all customers and drivers of active delays.
2. **Maintenance Mode:** If needed, use the **Jira Circuit Breaker** to pause marketplace order intake globally.
3. **Database Restore:** Contact the dev team to execute a Point-in-Time Recovery (PITR) if data corruption is suspected.

---

## 🔐 5. Final Quality Gate (Technical Check)
Run the following health-check to ensure your environment is fully synchronized before the first live order:

```bash
# Verify Environment variables
npx tsx scripts/check_readiness.ts

# Verify Database Snapshots
# Run the SQL snapshot in Supabase Query Editor:
# SELECT * FROM "System_Health_Snapshot";
```

**Pilot Launch Window:** March 2026
**Operational Lead:** TrueServe Admin Team
