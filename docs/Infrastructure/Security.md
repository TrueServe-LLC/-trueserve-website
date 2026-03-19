# TrueServe Infrastructure & Security Protocol (v1.0)

## 1. Data Recovery (Backups & Restore)
Admin-critical data (Audit Logs, Orders, Driver Payouts) is backed up daily via Supabase automated backups.

### RTO/RPO Targets:
- **RPO (Recovery Point Objective)**: 24 hours. No more than one day of transactional data loss in extreme disaster scenarios.
- **RTO (Recovery Time Objective)**: 4 hours. System must be fully operational from bucket restore within 4 hours.

### Restore Testing:
- Quarterly validation of database restores to a "staging" environment to ensure integrity.

## 2. Audit Log Retention Policy
To ensure performance and compliance:
- **Hot Storage**: 365 days. All logs are queryable in the Admin Portal for 1 year.
- **Cold Storage (Archive)**: Older than 1 year logs are exported to S3/GCS buckets and purged from the primary DB.
- **Cleanup Script**: `supabase/retention_policy.sql` handles daily purging of stale logs.

## 3. Incident Response Plan (IRP)
1. **Detection**: Real-time Sentry alerting for 5xx errors or unauthorized `ADMIN` access attempts.
2. **Containment**: Immediate feature-flag disable (`Ordering System: OFF`) to prevent financial leakage.
3. **Eradication**: Patching vulnerability, rotating Supabase `SERVICE_ROLE` or Stripe Secret keys.
4. **Recovery**: Verify system integrity, re-enable feature flags sequentially.

## 4. QA & Release (Pre-Pilot Checklist)
- [x] **Role-Based Access**: Verified `/admin` routes reject `CUSTOMER` and `DRIVER` roles.
- [x] **Workflow Validation**: Verified approve/reject flow for both Menus and Drivers correctly updates DB and logs to `AuditLog`.
- [wip] **Load Testing**: Simulating 100 concurrent admin dashboard queries for KPI stability.
- [ ] **UAT**: Pilot launch with Wilmington Ops/Finance for final sign-off.
