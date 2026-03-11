-- Run this in your Supabase SQL Editor to enable Vehicle Transparency

ALTER TABLE "Driver" 
ADD COLUMN IF NOT EXISTS "vehicleMake" TEXT,
ADD COLUMN IF NOT EXISTS "vehicleModel" TEXT,
ADD COLUMN IF NOT EXISTS "vehicleColor" TEXT,
ADD COLUMN IF NOT EXISTS "licensePlate" TEXT;

-- Provide initial fallback values for any existing drivers missing this data
UPDATE "Driver" SET "vehicleMake" = 'Vehicle' WHERE "vehicleMake" IS NULL;
UPDATE "Driver" SET "vehicleModel" = '' WHERE "vehicleModel" IS NULL;
UPDATE "Driver" SET "vehicleColor" = '' WHERE "vehicleColor" IS NULL;
UPDATE "Driver" SET "licensePlate" = 'UNKNOWN' WHERE "licensePlate" IS NULL;
