-- =============================================================================
-- Migration: Add Secure Delivery PIN to Order Table
-- =============================================================================

-- 1. Add the column (TEXT to preserve leading zeros, 4 chars length)
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryPin" TEXT;
COMMENT ON COLUMN "Order"."deliveryPin" IS '4-digit secure PIN required for driver to complete delivery';

-- 2. Create function to generate a 4-digit PIN
CREATE OR REPLACE FUNCTION generate_delivery_pin() RETURNS TEXT AS $$
BEGIN
  -- random() generates 0.0 to 1.0, multiply by 10000 and floor it
  -- lpad ensures it is always 4 digits even if the number is e.g., 42 -> '0042'
  RETURN lpad(floor(random() * 10000)::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- 3. Create the trigger function to automatically set the PIN on insert
CREATE OR REPLACE FUNCTION set_delivery_pin() RETURNS TRIGGER AS $$
BEGIN
    IF NEW."deliveryPin" IS NULL THEN
        NEW."deliveryPin" = generate_delivery_pin();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Attach the trigger to the Order table
DROP TRIGGER IF EXISTS trg_set_delivery_pin ON "Order";
CREATE TRIGGER trg_set_delivery_pin
BEFORE INSERT ON "Order"
FOR EACH ROW EXECUTE FUNCTION set_delivery_pin();

-- 5. Backfill existing active orders with a PIN (Optional, but good for testing)
UPDATE "Order" 
SET "deliveryPin" = generate_delivery_pin() 
WHERE "deliveryPin" IS NULL AND status NOT IN ('DELIVERED', 'CANCELLED');
