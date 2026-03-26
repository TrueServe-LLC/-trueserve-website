-- TrueServe Scaling Migration: Geo-Fencing & Dispatch Optimization
-- Adding explicit location markers for faster, localized driver dispatch.

-- 1. Create Zip Code & Sector Columns
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "zipCode" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "zipCode" TEXT;
ALTER TABLE "Driver" ADD COLUMN IF NOT EXISTS "zipCode" TEXT;
ALTER TABLE "Driver" ADD COLUMN IF NOT EXISTS "serviceCity" TEXT;

-- 2. Performance Indices
CREATE INDEX IF NOT EXISTS "idx_order_zip_status" ON "Order"("zipCode", "status");
CREATE INDEX IF NOT EXISTS "idx_restaurant_zip" ON "Restaurant"("zipCode");
CREATE INDEX IF NOT EXISTS "idx_driver_zip" ON "Driver"("zipCode");

-- 3. Comment Documentation
COMMENT ON COLUMN "Order"."zipCode" IS 'Captured zip code for ultra-fast localized dispatching';
COMMENT ON COLUMN "Driver"."serviceCity" IS 'The primary city the driver is registered to operate in';

-- 4. Initial Mesh Cleanup (Optional: Extract zip from existing address text if possible)
-- This is a partial query that tries to find 5-digit patterns at the end of addresses.
UPDATE "Order" SET "zipCode" = substring("deliveryAddress" from '\d{5}$') WHERE "zipCode" IS NULL AND "deliveryAddress" ~ '\d{5}$';
UPDATE "Restaurant" SET "zipCode" = substring("address" from '\d{5}$') WHERE "zipCode" IS NULL AND "address" ~ '\d{5}$';
