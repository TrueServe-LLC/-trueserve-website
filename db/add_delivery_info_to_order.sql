-- Add delivery location details to Order table
ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "deliveryAddress" TEXT,
ADD COLUMN IF NOT EXISTS "deliveryLat" FLOAT,
ADD COLUMN IF NOT EXISTS "deliveryLng" FLOAT;

-- Comment on columns
COMMENT ON COLUMN "Order"."deliveryAddress" IS 'Full formatted address of the customer';
COMMENT ON COLUMN "Order"."deliveryLat" IS 'Latitude of the delivery location';
COMMENT ON COLUMN "Order"."deliveryLng" IS 'Longitude of the delivery location';
