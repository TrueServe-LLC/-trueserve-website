-- =============================================================================
-- Merchant Dashboard Production Master Migration
-- Target: Supabase / Postgres
-- Description: Consolidates all recent merchant-specific features including 
-- AI Scheduling, Inventory Sync, Customer Pulse, and Menu Optimization.
-- =============================================================================

-- 1. ENHANCE RESTAURANT TABLE (Operational Controls & AI Settings)
ALTER TABLE "Restaurant" 
ADD COLUMN IF NOT EXISTS "manualPrepTime" INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS "busyUntil" TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS "isBusy" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "capacityThreshold" INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS "autoPilotEnabled" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "outOfStockIngredients" TEXT[] DEFAULT '{}';

COMMENT ON COLUMN "Restaurant"."manualPrepTime" IS 'Manual override for preparation time in minutes';
COMMENT ON COLUMN "Restaurant"."busyUntil" IS 'Timestamp until which the restaurant is automatically set to busy/paused';
COMMENT ON COLUMN "Restaurant"."isBusy" IS 'When true, the restaurant is hidden or shows as overwhelmed on the frontend.';
COMMENT ON COLUMN "Restaurant"."capacityThreshold" IS 'Trigger Busy Mode automatically when pending orders exceed this number';
COMMENT ON COLUMN "Restaurant"."autoPilotEnabled" IS 'Enable/Disable AI Auto-Pilot for high-volume throttling';
COMMENT ON COLUMN "Restaurant"."outOfStockIngredients" IS 'Ingredients currently unavailable, used to automatically pause linked menu items';

-- 2. ENHANCE MENUITEM TABLE (Inventory & Pricing)
ALTER TABLE "MenuItem"
ADD COLUMN IF NOT EXISTS "isAvailable" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "ingredients" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "originalPrice" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "saleUntil" TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN "MenuItem"."isAvailable" IS 'When false, the item is hidden or shown as out of stock.';
COMMENT ON COLUMN "MenuItem"."ingredients" IS 'List of key ingredients to enable smart inventory dependencies';
COMMENT ON COLUMN "MenuItem"."originalPrice" IS 'Stores the price before a flash sale was applied';
COMMENT ON COLUMN "MenuItem"."saleUntil" IS 'When the current discount or flash sale expires';

-- 3. ENHANCE ORDER TABLE (Cancellation Tracking)
ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "cancelReason" TEXT,
ADD COLUMN IF NOT EXISTS "cancelComment" TEXT;

COMMENT ON COLUMN "Order"."cancelReason" IS 'Category of cancellation (e.g., Too Long, Incorrect Address, Changed Mind)';
COMMENT ON COLUMN "Order"."cancelComment" IS 'Optional detailed explanation from the user';

-- 4. ENHANCE REVIEW TABLE (Sentiment & Dashboard Filtering)
-- Note: restaurantId is TEXT to match Prisma CUIDs/String IDs
ALTER TABLE "Review" 
ADD COLUMN IF NOT EXISTS "restaurantId" TEXT REFERENCES "Restaurant"("id") ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS "type" TEXT DEFAULT 'RESTAURANT', -- 'RESTAURANT' or 'DRIVER'
ADD COLUMN IF NOT EXISTS "sentiment" TEXT; -- 'POSITIVE', 'NEUTRAL', 'NEGATIVE'

COMMENT ON COLUMN "Review"."restaurantId" IS 'The restaurant being reviewed (if applicable)';
COMMENT ON COLUMN "Review"."type" IS 'Whether the review is for the food/restaurant or the delivery person';
COMMENT ON COLUMN "Review"."sentiment" IS 'AI-generated sentiment tag for quick merchant filtering';

CREATE INDEX IF NOT EXISTS "idx_review_restaurant" ON "Review"("restaurantId");
CREATE INDEX IF NOT EXISTS "idx_review_type" ON "Review"("type");

-- 5. CREATE MERCHANT SCHEDULE TABLE (AI Busy Zones)
-- Using TEXT for IDs to maintain consistency with Prisma-defined tables
CREATE TABLE IF NOT EXISTS "MerchantSchedule" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "restaurantId" TEXT NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
    "dayOfWeek" INTEGER NOT NULL, -- 0 (Sunday) to 6 (Saturday)
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "extraPrepTime" INTEGER DEFAULT 15, -- Minutes to add during this zone
    "action" TEXT DEFAULT 'BUFFER', -- 'BUFFER' (add prep time) or 'PAUSE' (stop orders)
    "isEnabled" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMPTZ DEFAULT now(),
    "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_merchant_schedule_restaurant_day" ON "MerchantSchedule"("restaurantId", "dayOfWeek");

-- 6. ENABLE REALTIME FOR NEW TABLES
-- Replace 'public' with your actual schema name if different
ALTER PUBLICATION supabase_realtime ADD TABLE "MerchantSchedule";
