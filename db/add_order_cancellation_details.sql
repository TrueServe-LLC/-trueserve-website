-- Add cancellation tracking to Order table
ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "cancelReason" TEXT,
ADD COLUMN IF NOT EXISTS "cancelComment" TEXT;

COMMENT ON COLUMN "Order"."cancelReason" IS 'Category of cancellation (e.g., Too Long, Incorrect Address, Changed Mind)';
COMMENT ON COLUMN "Order"."cancelComment" IS 'Optional detailed explanation from the user';
