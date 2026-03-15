-- Create MerchantSchedule table for recurring busy zones
CREATE TABLE IF NOT EXISTS "MerchantSchedule" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "restaurantId" UUID NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
    "dayOfWeek" INTEGER NOT NULL, -- 0 (Sunday) to 6 (Saturday)
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "extraPrepTime" INTEGER DEFAULT 15, -- Minutes to add during this zone
    "action" TEXT DEFAULT 'BUFFER', -- 'BUFFER' (add prep time) or 'PAUSE' (stop orders)
    "isEnabled" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMPTZ DEFAULT now(),
    "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS "idx_merchant_schedule_restaurant_day" ON "MerchantSchedule"("restaurantId", "dayOfWeek");

-- Add capacityThreshold to Restaurant for Auto-Pilot
ALTER TABLE "Restaurant" 
ADD COLUMN IF NOT EXISTS "capacityThreshold" INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS "autoPilotEnabled" BOOLEAN DEFAULT false;

COMMENT ON COLUMN "Restaurant"."capacityThreshold" IS 'Trigger Busy Mode automatically when pending orders exceed this number';
COMMENT ON COLUMN "Restaurant"."autoPilotEnabled" IS 'Enable/Disable AI Auto-Pilot for high-volume throttling';
