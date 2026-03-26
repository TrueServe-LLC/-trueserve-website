-- TrueServe Scale Fix: Human-Readable Slugs
-- Goal: Eliminate need for manual UUID searching.

ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "slug" TEXT UNIQUE;

-- Generate initial slugs for existing restaurants using their name
-- (Converts 'Dhan's Kitchen' to 'dhans-kitchen')
UPDATE "Restaurant" 
SET "slug" = LOWER(REPLACE(REPLACE(name, '''', ''), ' ', '-'))
WHERE "slug" IS NULL;

-- Index for high-performance lookup
CREATE INDEX IF NOT EXISTS "idx_restaurant_slug" ON "Restaurant"("slug");

COMMENT ON COLUMN "Restaurant"."slug" IS 'Human-readable URL identifier for branding and easier GHL embedding';
