-- Merchant Insights: True Profit, Menu Engineering, Customer Loyalty, Order Accuracy

-- MenuItem: cost price for margin calculations
ALTER TABLE "MenuItem"
  ADD COLUMN IF NOT EXISTS "costPrice" NUMERIC(10,2);

COMMENT ON COLUMN "MenuItem"."costPrice" IS 'Merchant-entered cost to produce this item (COGS per unit)';

-- Order: dispute / accuracy audit fields
ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "disputeFlag"  BOOLEAN      DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "disputeType"  TEXT,
  ADD COLUMN IF NOT EXISTS "pickedUpAt"   TIMESTAMPTZ;

COMMENT ON COLUMN "Order"."disputeFlag"  IS 'True when the merchant has flagged this order for a dispute';
COMMENT ON COLUMN "Order"."disputeType"  IS 'Type of dispute: MISSING_ITEM | WRONG_ORDER | TAMPERED | LATE_PICKUP';
COMMENT ON COLUMN "Order"."pickedUpAt"   IS 'Timestamp when driver physically picked up the order';

-- Restaurant: POS aggregator routing (ItsaCheckmate, Chowly, Otter)
ALTER TABLE "Restaurant"
  ADD COLUMN IF NOT EXISTS "aggregatorType"      TEXT,
  ADD COLUMN IF NOT EXISTS "aggregatorApiKey"    TEXT,
  ADD COLUMN IF NOT EXISTS "aggregatorLocationId" TEXT;

COMMENT ON COLUMN "Restaurant"."aggregatorType"       IS 'Aggregator partner: ItsaCheckmate | Chowly | Otter';
COMMENT ON COLUMN "Restaurant"."aggregatorApiKey"     IS 'API key issued by the aggregator for this location';
COMMENT ON COLUMN "Restaurant"."aggregatorLocationId" IS 'Location ID assigned by the aggregator';

-- Merchant profit settings stored on Restaurant
ALTER TABLE "Restaurant"
  ADD COLUMN IF NOT EXISTS "foodCostPct"  NUMERIC(5,2) DEFAULT 30,
  ADD COLUMN IF NOT EXISTS "laborCostPct" NUMERIC(5,2) DEFAULT 25;

COMMENT ON COLUMN "Restaurant"."foodCostPct"  IS 'Owner-entered food cost as % of gross revenue';
COMMENT ON COLUMN "Restaurant"."laborCostPct" IS 'Owner-entered labor cost as % of gross revenue';

-- Index for dispute queries
CREATE INDEX IF NOT EXISTS "idx_order_dispute_flag"    ON "Order"("restaurantId", "disputeFlag") WHERE "disputeFlag" = TRUE;
CREATE INDEX IF NOT EXISTS "idx_order_picked_up_at"   ON "Order"("restaurantId", "pickedUpAt");
CREATE INDEX IF NOT EXISTS "idx_menu_item_cost_price"  ON "MenuItem"("restaurantId", "costPrice");
