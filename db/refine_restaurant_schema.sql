-- Add operating hours to Restaurant
ALTER TABLE "Restaurant" 
ADD COLUMN IF NOT EXISTS "openTime" TIME DEFAULT '08:00:00',
ADD COLUMN IF NOT EXISTS "closeTime" TIME DEFAULT '22:00:00';

-- Add inventory tracking to MenuItem
ALTER TABLE "MenuItem"
ADD COLUMN IF NOT EXISTS "inventory" INTEGER DEFAULT 50;

COMMENT ON COLUMN "MenuItem"."inventory" IS 'Counts down as items are ordered';

-- Function to safely decrement inventory
CREATE OR REPLACE FUNCTION decrement_inventory(row_id UUID, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE "MenuItem"
  SET inventory = inventory - quantity
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;
