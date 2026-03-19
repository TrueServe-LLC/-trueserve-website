
-- Migration to add pickup and delivery timestamps for KPI tracking
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "pickedUpAt" TIMESTAMP WITH TIME ZONE;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP WITH TIME ZONE;

-- Also adding actual prep time columns if they aren't already used correctly
-- prepTimeStart and prepTimeEnd already exist, but let's ensure indices for performance
CREATE INDEX IF NOT EXISTS "idx_order_pickedupat" ON "Order"("pickedUpAt");
CREATE INDEX IF NOT EXISTS "idx_order_deliveredat" ON "Order"("deliveredAt");
