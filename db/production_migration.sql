-- =============================================================================
-- TrueServe Production Migration Script
-- Generated: 2026-03-08
-- Paste this ENTIRE script into Supabase SQL Editor and click Run.
-- Every statement uses IF NOT EXISTS / OR REPLACE / DO NOTHING so it is
-- fully idempotent — safe to run multiple times without breaking anything.
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: SECURITY — Fix RLS policies
-- ─────────────────────────────────────────────────────────────────────────────

-- 1a. Drop the overly permissive policy that lets ANY logged-in user
--     read ALL other users' rows (emails, names, roles, etc.)
DROP POLICY IF EXISTS "Authenticated users can read basic user info" ON "User";

-- 1b. Allow the service_role to manage User records bypassing RLS.
--     Required for server-side operations (signup trigger, admin actions).
DROP POLICY IF EXISTS "Service role can manage users" ON "User";
CREATE POLICY "Service role can manage users" ON "User"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 1c. Ensure users can insert their own profile (needed on first signup)
DROP POLICY IF EXISTS "Users can insert their own profile" ON "User";
CREATE POLICY "Users can insert their own profile" ON "User"
FOR INSERT
WITH CHECK (auth.uid()::text = id);

-- 1d. Fix the update policy
DROP POLICY IF EXISTS "Users can update own data" ON "User";
CREATE POLICY "Users can update own data" ON "User"
FOR UPDATE
USING (auth.uid()::text = id);


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: USER TABLE — Add missing columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "address"            TEXT,
ADD COLUMN IF NOT EXISTS "phone"              TEXT,
ADD COLUMN IF NOT EXISTS "plan"              TEXT DEFAULT 'Basic',
ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;

COMMENT ON COLUMN "User"."address" IS 'Default/Saved delivery address';
COMMENT ON COLUMN "User"."phone"   IS 'Phone number for SMS notifications';
COMMENT ON COLUMN "User"."plan"    IS 'Basic (Free), Plus ($9.99/mo), or Premium ($19.99/mo)';

CREATE INDEX IF NOT EXISTS "idx_user_phone" ON "User"("phone");


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: RESTAURANT TABLE — Add missing columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE "Restaurant"
ADD COLUMN IF NOT EXISTS "plan"                     TEXT DEFAULT 'Flex Options',
ADD COLUMN IF NOT EXISTS "stripeSubscriptionId"     TEXT,
ADD COLUMN IF NOT EXISTS "stripeAccountId"          TEXT,
ADD COLUMN IF NOT EXISTS "stripeOnboardingComplete" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "openTime"                 TIME DEFAULT '08:00:00',
ADD COLUMN IF NOT EXISTS "closeTime"                TIME DEFAULT '22:00:00',
ADD COLUMN IF NOT EXISTS "visibility"               TEXT DEFAULT 'VISIBLE',
ADD COLUMN IF NOT EXISTS "isMock"                   BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN "Restaurant"."plan"       IS 'Flex Options (15% split) or Pro Subscription ($199/mo)';
COMMENT ON COLUMN "Restaurant"."openTime"   IS 'Daily opening time';
COMMENT ON COLUMN "Restaurant"."closeTime"  IS 'Daily closing time';
COMMENT ON COLUMN "Restaurant"."visibility" IS 'VISIBLE or HIDDEN';
COMMENT ON COLUMN "Restaurant"."isMock"     IS 'TRUE for seed/test data';

CREATE INDEX IF NOT EXISTS "idx_restaurant_stripe_account" ON "Restaurant"("stripeAccountId");


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: ORDER TABLE — Add missing columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "tip"                  DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS "deliveryAddress"      TEXT,
ADD COLUMN IF NOT EXISTS "deliveryLat"          FLOAT,
ADD COLUMN IF NOT EXISTS "deliveryLng"          FLOAT,
ADD COLUMN IF NOT EXISTS "deliveryInstructions" TEXT;

COMMENT ON COLUMN "Order"."tip"                  IS 'Tip amount provided by customer for the driver';
COMMENT ON COLUMN "Order"."deliveryAddress"      IS 'Full formatted delivery address';
COMMENT ON COLUMN "Order"."deliveryLat"          IS 'Latitude of delivery location';
COMMENT ON COLUMN "Order"."deliveryLng"          IS 'Longitude of delivery location';
COMMENT ON COLUMN "Order"."deliveryInstructions" IS 'Customer notes (e.g. Leave at door, Gate code 1234)';


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: DRIVER TABLE — Add missing columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE "Driver"
ADD COLUMN IF NOT EXISTS "currentLat"                  DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "currentLng"                  DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "lastLocationUpdate"           TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "backgroundCheckStatus"       TEXT DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "backgroundCheckId"           TEXT,
ADD COLUMN IF NOT EXISTS "backgroundCheckClearedAt"    TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "insuranceDocumentUrl"        TEXT,
ADD COLUMN IF NOT EXISTS "registrationDocumentUrl"     TEXT,
ADD COLUMN IF NOT EXISTS "vehicleVerified"             BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN "Driver"."currentLat"             IS 'Latest latitude from driver device';
COMMENT ON COLUMN "Driver"."currentLng"             IS 'Latest longitude from driver device';
COMMENT ON COLUMN "Driver"."backgroundCheckStatus"  IS 'PENDING, CLEAR, FLAGGED, or EXPIRED';
COMMENT ON COLUMN "Driver"."insuranceDocumentUrl"   IS 'URL to uploaded insurance document';
COMMENT ON COLUMN "Driver"."registrationDocumentUrl"IS 'URL to uploaded registration document';


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: MENUITEM TABLE
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE "MenuItem"
ADD COLUMN IF NOT EXISTS "inventory" INTEGER DEFAULT 50;

COMMENT ON COLUMN "MenuItem"."inventory" IS 'Stock count — decremented on order placement';


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: NEW TABLES
-- ─────────────────────────────────────────────────────────────────────────────

-- Favorites
-- Note: userId and restaurantId are TEXT to match Prisma CUID primary keys
CREATE TABLE IF NOT EXISTS "Favorite" (
    "id"           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"       TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "restaurantId" TEXT NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
    "createdAt"    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("userId", "restaurantId")
);
ALTER TABLE "Favorite" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own favorites" ON "Favorite";
CREATE POLICY "Users can view their own favorites" ON "Favorite"
    FOR SELECT USING (auth.uid()::text = "userId");
DROP POLICY IF EXISTS "Users can insert their own favorites" ON "Favorite";
CREATE POLICY "Users can insert their own favorites" ON "Favorite"
    FOR INSERT WITH CHECK (auth.uid()::text = "userId");
DROP POLICY IF EXISTS "Users can delete their own favorites" ON "Favorite";
CREATE POLICY "Users can delete their own favorites" ON "Favorite"
    FOR DELETE USING (auth.uid()::text = "userId");
CREATE INDEX IF NOT EXISTS "idx_favorite_user_id"        ON "Favorite"("userId");
CREATE INDEX IF NOT EXISTS "idx_favorite_restaurant_id"  ON "Favorite"("restaurantId");

-- Notifications
CREATE TABLE IF NOT EXISTS "Notification" (
    "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"    TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "title"     TEXT NOT NULL,
    "message"   TEXT NOT NULL,
    "type"      TEXT DEFAULT 'ORDER_UPDATE',
    "orderId"   TEXT REFERENCES "Order"("id") ON DELETE SET NULL,
    "isRead"    BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own notifications" ON "Notification";
CREATE POLICY "Users can view their own notifications" ON "Notification"
    FOR SELECT USING (auth.uid()::text = "userId");
DROP POLICY IF EXISTS "Users can update their own notifications" ON "Notification";
CREATE POLICY "Users can update their own notifications" ON "Notification"
    FOR UPDATE USING (auth.uid()::text = "userId");
CREATE INDEX IF NOT EXISTS "idx_notification_user_id" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "idx_notification_unread"  ON "Notification"("userId") WHERE "isRead" = FALSE;

-- Reviews
CREATE TABLE IF NOT EXISTS "Review" (
    "id"         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "orderId"    TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "driverId"   TEXT NOT NULL REFERENCES "Driver"("id") ON DELETE CASCADE,
    "customerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "rating"     INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "comment"    TEXT,
    "createdAt"  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Customers can create reviews" ON "Review";
CREATE POLICY "Customers can create reviews" ON "Review"
    FOR INSERT WITH CHECK (auth.uid()::text = "customerId");
DROP POLICY IF EXISTS "Drivers can read their reviews" ON "Review";
CREATE POLICY "Drivers can read their reviews" ON "Review"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Driver"
            WHERE "Driver".id::text = "driverId"
            AND "Driver"."userId" = auth.uid()::text
        )
    );
DROP POLICY IF EXISTS "Customers can read own reviews" ON "Review";
CREATE POLICY "Customers can read own reviews" ON "Review"
    FOR SELECT USING (auth.uid()::text = "customerId");
DROP POLICY IF EXISTS "Admins can read all reviews" ON "Review";
CREATE POLICY "Admins can read all reviews" ON "Review"
    FOR ALL USING (is_admin());

-- System Settings
CREATE TABLE IF NOT EXISTS "SystemSettings" (
    "key"       TEXT PRIMARY KEY,
    "value"     JSONB NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
INSERT INTO "SystemSettings" ("key", "value")
VALUES ('ordering_enabled', 'true'::jsonb)
ON CONFLICT ("key") DO NOTHING;
ALTER TABLE "SystemSettings" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON "SystemSettings";
CREATE POLICY "Allow public read access" ON "SystemSettings"
    FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin update access" ON "SystemSettings";
CREATE POLICY "Allow admin update access" ON "SystemSettings"
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'role' = 'ADMIN');


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: DRIVER ORDER VISIBILITY — Fix RLS so drivers can see & accept jobs
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Drivers can see available orders" ON "Order";
CREATE POLICY "Drivers can see available orders" ON "Order"
    FOR SELECT USING (
        "driverId" IS NULL
        AND EXISTS (
            SELECT 1 FROM "Driver" WHERE "Driver"."userId" = auth.uid()::text
        )
    );

DROP POLICY IF EXISTS "Drivers can see available order items" ON "OrderItem";
CREATE POLICY "Drivers can see available order items" ON "OrderItem"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Order"
            WHERE "Order".id = "OrderItem"."orderId"
            AND "Order"."driverId" IS NULL
            AND EXISTS (
                SELECT 1 FROM "Driver" WHERE "Driver"."userId" = auth.uid()::text
            )
        )
    );

DROP POLICY IF EXISTS "Drivers can accept available orders" ON "Order";
CREATE POLICY "Drivers can accept available orders" ON "Order"
    FOR UPDATE
    USING (
        "driverId" IS NULL
        AND EXISTS (
            SELECT 1 FROM "Driver" WHERE "Driver"."userId" = auth.uid()::text
        )
    )
    WITH CHECK (
        "driverId" = (SELECT id FROM "Driver" WHERE "userId" = auth.uid()::text)
    );


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: DATABASE FUNCTIONS & RPCs
-- ─────────────────────────────────────────────────────────────────────────────

-- Safely increment driver earnings balance
CREATE OR REPLACE FUNCTION increment_driver_balance(driver_id TEXT, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE "Driver"
    SET
        balance         = balance + amount,
        "totalEarnings" = "totalEarnings" + amount,
        "updatedAt"     = NOW()
    WHERE id = driver_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safely decrement menu item inventory
CREATE OR REPLACE FUNCTION decrement_inventory(row_id TEXT, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE "MenuItem"
    SET inventory = inventory - quantity
    WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- Done! All migrations applied.
-- =============================================================================
