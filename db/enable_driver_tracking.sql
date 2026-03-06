
-- Add real-time location tracking for drivers
ALTER TABLE "Driver" 
ADD COLUMN IF NOT EXISTS "currentLat" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "currentLng" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "lastLocationUpdate" TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN "Driver"."currentLat" IS 'Latest latitude from driver device';
COMMENT ON COLUMN "Driver"."currentLng" IS 'Latest longitude from driver device';
