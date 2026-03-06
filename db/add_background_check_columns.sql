
-- Add background check tracking to Driver table
ALTER TABLE "Driver" 
ADD COLUMN IF NOT EXISTS "backgroundCheckStatus" TEXT DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "backgroundCheckId" TEXT,
ADD COLUMN IF NOT EXISTS "backgroundCheckClearedAt" TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN "Driver"."backgroundCheckStatus" IS 'PENDING, CLEAR, FLAGGED, or EXPIRED';
