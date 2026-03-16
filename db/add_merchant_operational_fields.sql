-- Add manual prep time override to Restaurant table
ALTER TABLE "Restaurant" 
ADD COLUMN IF NOT EXISTS "manualPrepTime" INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS "busyUntil" TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN "Restaurant"."manualPrepTime" IS 'Manual override for preparation time in minutes';
COMMENT ON COLUMN "Restaurant"."busyUntil" IS 'Timestamp until which the restaurant is automatically set to busy/paused';
