
-- Migration: Add Stripe Connect fields to Restaurant table
ALTER TABLE "Restaurant" 
ADD COLUMN IF NOT EXISTS "stripeAccountId" TEXT,
ADD COLUMN IF NOT EXISTS "stripeOnboardingComplete" BOOLEAN DEFAULT FALSE;

-- Optional: Index for faster lookups
CREATE INDEX IF NOT EXISTS "idx_restaurant_stripe_account" ON "Restaurant"("stripeAccountId");
