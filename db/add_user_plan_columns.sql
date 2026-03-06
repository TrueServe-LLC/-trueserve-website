
-- Add plan support for customers
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "plan" TEXT DEFAULT 'Basic',
ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;

COMMENT ON COLUMN "User"."plan" IS 'Basic (Free), Plus ($9.99/mo), or Premium ($19.99/mo)';
