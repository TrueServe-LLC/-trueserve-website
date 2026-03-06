
-- Add plan support for merchants
ALTER TABLE "Restaurant" 
ADD COLUMN IF NOT EXISTS "plan" TEXT DEFAULT 'Flex Options',
ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;

COMMENT ON COLUMN "Restaurant"."plan" IS 'Flex Options (15% split) or Pro Subscription ($199/mo)';
