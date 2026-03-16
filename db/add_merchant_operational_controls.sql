
-- Add operational controls for merchants
ALTER TABLE "Restaurant" 
ADD COLUMN IF NOT EXISTS "isBusy" BOOLEAN DEFAULT false;

ALTER TABLE "MenuItem"
ADD COLUMN IF NOT EXISTS "isAvailable" BOOLEAN DEFAULT true;

COMMENT ON COLUMN "Restaurant"."isBusy" IS 'When true, the restaurant is hidden or shows as overwhelmed on the frontend.';
COMMENT ON COLUMN "MenuItem"."isAvailable" IS 'When false, the item is hidden or shown as out of stock.';
