
-- Add tip column to Order table
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "tip" DECIMAL(10,2) DEFAULT 0.00;

-- Comment for clarity
COMMENT ON COLUMN "Order"."tip" IS 'Tip amount provided by the customer for the driver';
