-- Add Flash Sale and Discounting fields to MenuItem
ALTER TABLE "MenuItem" 
ADD COLUMN IF NOT EXISTS "originalPrice" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "saleUntil" TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN "MenuItem"."originalPrice" IS 'Stores the price before a flash sale was applied';
COMMENT ON COLUMN "MenuItem"."saleUntil" IS 'When the current discount or flash sale expires';
