-- Enhance Review table for Merchant Dashboards
ALTER TABLE "Review" 
ADD COLUMN IF NOT EXISTS "restaurantId" TEXT REFERENCES "Restaurant"("id") ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS "type" TEXT DEFAULT 'RESTAURANT', -- 'RESTAURANT' or 'DRIVER'
ADD COLUMN IF NOT EXISTS "sentiment" TEXT; -- 'POSITIVE', 'NEUTRAL', 'NEGATIVE'

COMMENT ON COLUMN "Review"."restaurantId" IS 'The restaurant being reviewed (if applicable)';
COMMENT ON COLUMN "Review"."type" IS 'Whether the review is for the food/restaurant or the delivery person';
COMMENT ON COLUMN "Review"."sentiment" IS 'AI-generated sentiment tag for quick merchant filtering';

-- Index for fast dash filtering
CREATE INDEX IF NOT EXISTS "idx_review_restaurant" ON "Review"("restaurantId");
CREATE INDEX IF NOT EXISTS "idx_review_type" ON "Review"("type");
