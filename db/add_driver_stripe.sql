-- =============================================================================
-- Migration: Add Stripe Accounts to driver table
-- =============================================================================

ALTER TABLE "Driver" 
ADD COLUMN IF NOT EXISTS "stripeAccountId" TEXT, ADD COLUMN IF NOT EXISTS "stripeOnboardingComplete" BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS "idx_driver_stripe_account" ON "Driver"("stripeAccountId");
