-- Run this in your Supabase SQL Editor to enable TruePoints Loyalty Ledger

-- 1. Create the Transactions Table
CREATE TABLE IF NOT EXISTS "PointsTransaction" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "orderId" TEXT REFERENCES "Order"("id") ON DELETE SET NULL,
    "amount" INTEGER NOT NULL, -- Negative for spent, Positive for earned
    "type" TEXT NOT NULL,      -- EARNED_FROM_ORDER, SPENT_ON_REWARD, ADMIN_ADJUSTMENT, PLUS_BONUS
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Indexes for fast aggregation
CREATE INDEX IF NOT EXISTS "idx_points_tx_user" ON "PointsTransaction"("userId");
CREATE INDEX IF NOT EXISTS "idx_points_tx_order" ON "PointsTransaction"("orderId");

-- 3. Update User Table with a Balance Cache 
-- (This prevents us from having to SUM() a billion transactions on every page load)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "truePointsBalance" INTEGER DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isTrueServePlus" BOOLEAN DEFAULT false;

-- 4. Create the Automatic Ledger Synchronization Trigger
-- Whenever a new row is inserted into PointsTransaction, update the User's cached balance
CREATE OR REPLACE FUNCTION update_user_points_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "User"
    SET "truePointsBalance" = "truePointsBalance" + NEW."amount"
    WHERE "id" = NEW."userId";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_points_balance ON "PointsTransaction";
CREATE TRIGGER trg_update_points_balance
AFTER INSERT ON "PointsTransaction"
FOR EACH ROW
EXECUTE FUNCTION update_user_points_balance();
