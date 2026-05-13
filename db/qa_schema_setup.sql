-- =============================================================================
-- TrueServe QA Database Schema Setup
-- =============================================================================
-- Run this ENTIRE script in the QA Supabase SQL Editor to create all tables.
-- Every statement uses IF NOT EXISTS — safe to run multiple times.
--
-- Order matters: tables with foreign keys are created after their dependencies.
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER FUNCTION
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid()::text
    AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. USER
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "User" (
    "id"                    TEXT PRIMARY KEY,
    "email"                 TEXT UNIQUE NOT NULL,
    "name"                  TEXT,
    "role"                  TEXT NOT NULL DEFAULT 'CUSTOMER', -- CUSTOMER | DRIVER | MERCHANT | ADMIN
    "phone"                 TEXT,
    "address"               TEXT,
    "avatarUrl"             TEXT,
    "plan"                  TEXT DEFAULT 'Basic',
    "stripeCustomerId"      TEXT,
    "stripeSubscriptionId"  TEXT,
    "truePoints"            INTEGER DEFAULT 0,
    "emailVerified"         BOOLEAN DEFAULT FALSE,
    "createdAt"             TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt"             TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own data" ON "User";
CREATE POLICY "Users can read own data" ON "User"
    FOR SELECT USING (auth.uid()::text = id);
DROP POLICY IF EXISTS "Users can update own data" ON "User";
CREATE POLICY "Users can update own data" ON "User"
    FOR UPDATE USING (auth.uid()::text = id);
DROP POLICY IF EXISTS "Users can insert their own profile" ON "User";
CREATE POLICY "Users can insert their own profile" ON "User"
    FOR INSERT WITH CHECK (auth.uid()::text = id);
DROP POLICY IF EXISTS "Service role can manage users" ON "User";
CREATE POLICY "Service role can manage users" ON "User"
    FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can read all data" ON "User";
CREATE POLICY "Admins can read all data" ON "User"
    FOR ALL USING (is_admin());
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");
CREATE INDEX IF NOT EXISTS "idx_user_role"  ON "User"("role");
CREATE INDEX IF NOT EXISTS "idx_user_phone" ON "User"("phone");


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. RESTAURANT
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Restaurant" (
    "id"                        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "ownerId"                   TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "name"                      TEXT NOT NULL,
    "description"               TEXT,
    "address"                   TEXT,
    "city"                      TEXT,
    "state"                     TEXT,
    "zip"                       TEXT,
    "lat"                       DOUBLE PRECISION,
    "lng"                       DOUBLE PRECISION,
    "imageUrl"                  TEXT,
    "rating"                    TEXT DEFAULT '4.9',
    "category"                  TEXT,
    "cuisine"                   TEXT,
    "isActive"                  BOOLEAN DEFAULT TRUE,
    "visibility"                TEXT DEFAULT 'VISIBLE',
    "isMock"                    BOOLEAN DEFAULT FALSE,
    "openTime"                  TIME DEFAULT '08:00:00',
    "closeTime"                 TIME DEFAULT '22:00:00',
    "phone"                     TEXT,
    "slug"                      TEXT UNIQUE,
    -- POS
    "posSystem"                 TEXT,
    "posClientId"               TEXT,
    "posClientSecret"           TEXT,
    "squareMerchantId"          TEXT,
    "ghlUrl"                    TEXT,
    -- Stripe
    "stripeAccountId"           TEXT,
    "stripeSubscriptionId"      TEXT,
    "stripeOnboardingComplete"  BOOLEAN DEFAULT FALSE,
    -- Plan
    "plan"                      TEXT DEFAULT 'Flex Options',
    -- Compliance
    "healthGrade"               TEXT,
    "complianceStatus"          TEXT DEFAULT 'NOT_STARTED',
    "complianceScore"           INTEGER DEFAULT 0,
    "complianceTier"            TEXT DEFAULT 'Basic',
    "complianceNotes"           TEXT,
    "lastInspectionAt"          TIMESTAMP WITH TIME ZONE,
    "lastInspectionSource"      TEXT,
    "publicInspectionUrl"       TEXT,
    -- Operations
    "isBusy"                    BOOLEAN DEFAULT FALSE,
    "busyUntil"                 TIMESTAMP WITH TIME ZONE,
    "manualPrepTime"            INTEGER,
    "capacityThreshold"         INTEGER DEFAULT 10,
    "autoPilotEnabled"          BOOLEAN DEFAULT FALSE,
    "outOfStockIngredients"     TEXT[] DEFAULT '{}',
    "createdAt"                 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt"                 TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "Restaurant" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Restaurants are public" ON "Restaurant";
CREATE POLICY "Restaurants are public" ON "Restaurant"
    FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners can manage restaurants" ON "Restaurant";
CREATE POLICY "Owners can manage restaurants" ON "Restaurant"
    FOR ALL USING ("ownerId" = auth.uid()::text OR is_admin());
DROP POLICY IF EXISTS "Service role can manage restaurants" ON "Restaurant";
CREATE POLICY "Service role can manage restaurants" ON "Restaurant"
    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS "idx_restaurant_owner"    ON "Restaurant"("ownerId");
CREATE INDEX IF NOT EXISTS "idx_restaurant_lat_lng"  ON "Restaurant"("lat", "lng");
CREATE INDEX IF NOT EXISTS "idx_restaurant_active"   ON "Restaurant"("isActive");


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. MENU ITEM
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "MenuItem" (
    "id"            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "restaurantId"  TEXT NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
    "name"          TEXT NOT NULL,
    "description"   TEXT,
    "price"         DECIMAL(10,2) NOT NULL,
    "originalPrice" DECIMAL(10,2),
    "imageUrl"      TEXT,
    "category"      TEXT,
    "isAvailable"   BOOLEAN DEFAULT TRUE,
    "isArchived"    BOOLEAN DEFAULT FALSE,
    "inventory"     INTEGER DEFAULT 50,
    "ingredients"   TEXT[] DEFAULT '{}',
    "saleUntil"     TIMESTAMP WITH TIME ZONE,
    "isMock"        BOOLEAN DEFAULT FALSE,
    "createdAt"     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt"     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "MenuItem" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Menu Items are public" ON "MenuItem";
CREATE POLICY "Menu Items are public" ON "MenuItem"
    FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners can manage menu items" ON "MenuItem";
CREATE POLICY "Owners can manage menu items" ON "MenuItem"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Restaurant"
            WHERE "Restaurant".id = "MenuItem"."restaurantId"
            AND "Restaurant"."ownerId" = auth.uid()::text
        ) OR is_admin()
    );
DROP POLICY IF EXISTS "Service role can manage menu items" ON "MenuItem";
CREATE POLICY "Service role can manage menu items" ON "MenuItem"
    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS "idx_menuitem_restaurant" ON "MenuItem"("restaurantId");
CREATE INDEX IF NOT EXISTS "idx_menuitem_available"  ON "MenuItem"("restaurantId") WHERE "isAvailable" = TRUE;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. DRIVER
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Driver" (
    "id"                            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"                        TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
    "isAvailable"                   BOOLEAN DEFAULT FALSE,
    "isOnline"                      BOOLEAN DEFAULT FALSE,
    "currentLat"                    DOUBLE PRECISION,
    "currentLng"                    DOUBLE PRECISION,
    "lastLocationUpdate"            TIMESTAMP WITH TIME ZONE,
    "vehicleType"                   TEXT,
    "vehicleMake"                   TEXT,
    "vehicleModel"                  TEXT,
    "vehicleYear"                   TEXT,
    "vehicleColor"                  TEXT,
    "licensePlate"                  TEXT,
    "vehicleVerified"               BOOLEAN DEFAULT FALSE,
    "insuranceDocumentUrl"          TEXT,
    "registrationDocumentUrl"       TEXT,
    "backgroundCheckStatus"         TEXT DEFAULT 'PENDING',
    "backgroundCheckId"             TEXT,
    "backgroundCheckClearedAt"      TIMESTAMP WITH TIME ZONE,
    "stripeAccountId"               TEXT,
    "stripeOnboardingComplete"      BOOLEAN DEFAULT FALSE,
    "totalEarnings"                 DECIMAL(10,2) DEFAULT 0,
    "totalDeliveries"               INTEGER DEFAULT 0,
    "rating"                        DECIMAL(3,2) DEFAULT 5.0,
    -- Compliance
    "complianceScore"               INTEGER DEFAULT 0,
    "complianceStatus"              TEXT DEFAULT 'PENDING',
    "foodSafetyTrainingComplete"    BOOLEAN DEFAULT FALSE,
    "bagSanitationAcknowledged"     BOOLEAN DEFAULT FALSE,
    "temperatureControlAcknowledged" BOOLEAN DEFAULT FALSE,
    "lastComplianceAttestationAt"   TIMESTAMP WITH TIME ZONE,
    -- Agreement
    "agreementAccepted"             BOOLEAN DEFAULT FALSE,
    "agreementAcceptedAt"           TIMESTAMP WITH TIME ZONE,
    -- AI metadata
    "aiRiskScore"                   INTEGER,
    "pendingPhone"                  TEXT,
    "createdAt"                     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt"                     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "Driver" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Drivers can read own data" ON "Driver";
CREATE POLICY "Drivers can read own data" ON "Driver"
    FOR SELECT USING (auth.uid()::text = "userId");
DROP POLICY IF EXISTS "Drivers can update own data" ON "Driver";
CREATE POLICY "Drivers can update own data" ON "Driver"
    FOR UPDATE USING (auth.uid()::text = "userId");
DROP POLICY IF EXISTS "Admins can manage drivers" ON "Driver";
CREATE POLICY "Admins can manage drivers" ON "Driver"
    FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "Service role can manage drivers" ON "Driver";
CREATE POLICY "Service role can manage drivers" ON "Driver"
    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS "idx_driver_user"      ON "Driver"("userId");
CREATE INDEX IF NOT EXISTS "idx_driver_available" ON "Driver"("isAvailable");


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. ORDER
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Order" (
    "id"                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"                TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "restaurantId"          TEXT REFERENCES "Restaurant"("id") ON DELETE SET NULL,
    "driverId"              TEXT REFERENCES "Driver"("id") ON DELETE SET NULL,
    "status"                TEXT NOT NULL DEFAULT 'PENDING',
    "totalAmount"           DECIMAL(10,2) DEFAULT 0,
    "subtotal"              DECIMAL(10,2) DEFAULT 0,
    "tip"                   DECIMAL(10,2) DEFAULT 0,
    "deliveryFee"           DECIMAL(10,2) DEFAULT 0,
    "deliveryAddress"       TEXT,
    "deliveryLat"           DOUBLE PRECISION,
    "deliveryLng"           DOUBLE PRECISION,
    "deliveryInstructions"  TEXT,
    "deliveryPin"           TEXT,
    "estimatedDeliveryTime" TIMESTAMP WITH TIME ZONE,
    "actualDeliveryTime"    TIMESTAMP WITH TIME ZONE,
    "posReference"          TEXT,
    "stripePaymentIntentId" TEXT,
    "cancelReason"          TEXT,
    "cancelComment"         TEXT,
    "isTestOrder"           BOOLEAN DEFAULT FALSE,
    "isMock"                BOOLEAN DEFAULT FALSE,
    "createdAt"             TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt"             TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own orders" ON "Order";
CREATE POLICY "Users can read own orders" ON "Order"
    FOR SELECT USING (auth.uid()::text = "userId");
DROP POLICY IF EXISTS "Drivers can read assigned orders" ON "Order";
CREATE POLICY "Drivers can read assigned orders" ON "Order"
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM "Driver" WHERE "Driver".id = "Order"."driverId" AND "Driver"."userId" = auth.uid()::text)
    );
DROP POLICY IF EXISTS "Merchants can read their restaurant orders" ON "Order";
CREATE POLICY "Merchants can read their restaurant orders" ON "Order"
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM "Restaurant" WHERE "Restaurant".id = "Order"."restaurantId" AND "Restaurant"."ownerId" = auth.uid()::text)
    );
DROP POLICY IF EXISTS "Admins can manage orders" ON "Order";
CREATE POLICY "Admins can manage orders" ON "Order"
    FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "Service role can manage orders" ON "Order";
CREATE POLICY "Service role can manage orders" ON "Order"
    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS "idx_order_user"       ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "idx_order_restaurant" ON "Order"("restaurantId");
CREATE INDEX IF NOT EXISTS "idx_order_driver"     ON "Order"("driverId");
CREATE INDEX IF NOT EXISTS "idx_order_status"     ON "Order"("status");
CREATE INDEX IF NOT EXISTS "idx_order_created"    ON "Order"("createdAt" DESC);


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. ORDER ITEM
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id"               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "orderId"          TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "menuItemId"       TEXT REFERENCES "MenuItem"("id") ON DELETE SET NULL,
    "name"             TEXT NOT NULL,
    "quantity"         INTEGER NOT NULL DEFAULT 1,
    "price"            DECIMAL(10,2) NOT NULL,
    "merchantDiscount" DECIMAL(10,2) DEFAULT 0,
    "createdAt"        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage order items" ON "OrderItem";
CREATE POLICY "Service role can manage order items" ON "OrderItem"
    FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Users can view their order items" ON "OrderItem";
CREATE POLICY "Users can view their order items" ON "OrderItem"
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM "Order" WHERE "Order".id = "OrderItem"."orderId" AND "Order"."userId" = auth.uid()::text)
    );
CREATE INDEX IF NOT EXISTS "idx_orderitem_order" ON "OrderItem"("orderId");


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. FAVORITE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Favorite" (
    "id"           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"       TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "restaurantId" TEXT NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
    "createdAt"    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("userId", "restaurantId")
);
ALTER TABLE "Favorite" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own favorites" ON "Favorite";
CREATE POLICY "Users can manage own favorites" ON "Favorite"
    FOR ALL USING (auth.uid()::text = "userId");
CREATE INDEX IF NOT EXISTS "idx_favorite_user"       ON "Favorite"("userId");
CREATE INDEX IF NOT EXISTS "idx_favorite_restaurant" ON "Favorite"("restaurantId");


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. REVIEW
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Review" (
    "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "orderId"     TEXT REFERENCES "Order"("id") ON DELETE CASCADE,
    "restaurantId" TEXT REFERENCES "Restaurant"("id") ON DELETE CASCADE,
    "driverId"    TEXT REFERENCES "Driver"("id") ON DELETE SET NULL,
    "customerId"  TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "rating"      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "comment"     TEXT,
    "photoUrls"   TEXT[] DEFAULT '{}',
    "createdAt"   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reviews are public" ON "Review";
CREATE POLICY "Reviews are public" ON "Review" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Customers can create reviews" ON "Review";
CREATE POLICY "Customers can create reviews" ON "Review"
    FOR INSERT WITH CHECK (auth.uid()::text = "customerId");
DROP POLICY IF EXISTS "Service role can manage reviews" ON "Review";
CREATE POLICY "Service role can manage reviews" ON "Review"
    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS "idx_review_restaurant" ON "Review"("restaurantId");
CREATE INDEX IF NOT EXISTS "idx_review_customer"   ON "Review"("customerId");


-- ─────────────────────────────────────────────────────────────────────────────
-- 9. NOTIFICATION
-- ─────────────────────────────────────────────────────────────────────────────
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
DROP POLICY IF EXISTS "Users can manage own notifications" ON "Notification";
CREATE POLICY "Users can manage own notifications" ON "Notification"
    FOR ALL USING (auth.uid()::text = "userId");
DROP POLICY IF EXISTS "Service role can manage notifications" ON "Notification";
CREATE POLICY "Service role can manage notifications" ON "Notification"
    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS "idx_notification_user"   ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "idx_notification_unread" ON "Notification"("userId") WHERE "isRead" = FALSE;


-- ─────────────────────────────────────────────────────────────────────────────
-- 10. SUPPORT TICKET & MESSAGES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "SupportTicket" (
    "id"         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"     TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "orderId"    TEXT REFERENCES "Order"("id") ON DELETE SET NULL,
    "subject"    TEXT NOT NULL,
    "status"     TEXT DEFAULT 'OPEN',
    "priority"   TEXT DEFAULT 'NORMAL',
    "createdAt"  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt"  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "SupportTicket" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own tickets" ON "SupportTicket";
CREATE POLICY "Users can manage own tickets" ON "SupportTicket"
    FOR ALL USING (auth.uid()::text = "userId" OR is_admin());
DROP POLICY IF EXISTS "Service role can manage tickets" ON "SupportTicket";
CREATE POLICY "Service role can manage tickets" ON "SupportTicket"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "TicketMessage" (
    "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "ticketId"  TEXT NOT NULL REFERENCES "SupportTicket"("id") ON DELETE CASCADE,
    "senderId"  TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "message"   TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "TicketMessage" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Ticket participants can manage messages" ON "TicketMessage";
CREATE POLICY "Ticket participants can manage messages" ON "TicketMessage"
    FOR ALL USING (
        EXISTS (SELECT 1 FROM "SupportTicket" WHERE "SupportTicket".id = "TicketMessage"."ticketId" AND "SupportTicket"."userId" = auth.uid()::text)
        OR is_admin()
    );
DROP POLICY IF EXISTS "Service role can manage ticket messages" ON "TicketMessage";
CREATE POLICY "Service role can manage ticket messages" ON "TicketMessage"
    FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 11. ORDER CHAT
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "OrderChatMessage" (
    "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "orderId"   TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "sender"    TEXT NOT NULL CHECK ("sender" IN ('CUSTOMER', 'DRIVER', 'SUPPORT')),
    "content"   TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "OrderChatMessage" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Order participants can view chat" ON "OrderChatMessage";
CREATE POLICY "Order participants can view chat" ON "OrderChatMessage"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Order"
            WHERE "Order".id = "OrderChatMessage"."orderId"
            AND (
                "Order"."userId" = auth.uid()::text
                OR EXISTS (SELECT 1 FROM "Driver" WHERE "Driver".id = "Order"."driverId" AND "Driver"."userId" = auth.uid()::text)
            )
        ) OR is_admin()
    );
DROP POLICY IF EXISTS "Service role can manage order chat" ON "OrderChatMessage";
CREATE POLICY "Service role can manage order chat" ON "OrderChatMessage"
    FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 12. POINTS / TRUPOINTS LEDGER
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "PointsTransaction" (
    "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"      TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "orderId"     TEXT REFERENCES "Order"("id") ON DELETE SET NULL,
    "points"      INTEGER NOT NULL,
    "type"        TEXT NOT NULL, -- EARN | REDEEM | BONUS | EXPIRE
    "description" TEXT,
    "createdAt"   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "PointsTransaction" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own points" ON "PointsTransaction";
CREATE POLICY "Users can view own points" ON "PointsTransaction"
    FOR SELECT USING (auth.uid()::text = "userId");
DROP POLICY IF EXISTS "Service role can manage points" ON "PointsTransaction";
CREATE POLICY "Service role can manage points" ON "PointsTransaction"
    FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 13. AUDIT LOG
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id"         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId"     TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "action"     TEXT NOT NULL,
    "entityType" TEXT,
    "targetId"   TEXT,
    "message"    TEXT,
    "metadata"   JSONB,
    "ipAddress"  TEXT,
    "createdAt"  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read audit log" ON "AuditLog";
CREATE POLICY "Admins can read audit log" ON "AuditLog"
    FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "Service role can manage audit log" ON "AuditLog";
CREATE POLICY "Service role can manage audit log" ON "AuditLog"
    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS "idx_audit_user"    ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "idx_audit_action"  ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS "idx_audit_created" ON "AuditLog"("createdAt" DESC);


-- ─────────────────────────────────────────────────────────────────────────────
-- 14. SYSTEM CONFIG
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "SystemConfig" (
    "key"       TEXT PRIMARY KEY,
    "value"     TEXT,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "SystemConfig" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage system config" ON "SystemConfig";
CREATE POLICY "Admins can manage system config" ON "SystemConfig"
    FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "Service role can manage system config" ON "SystemConfig";
CREATE POLICY "Service role can manage system config" ON "SystemConfig"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed default config values
INSERT INTO "SystemConfig" ("key", "value") VALUES
    ('delivery_fee_base', '2.99'),
    ('delivery_fee_per_mile', '0.50'),
    ('platform_commission_pct', '15'),
    ('max_delivery_radius_miles', '20'),
    ('support_email', 'support@trueservedelivery.com')
ON CONFLICT ("key") DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- 15. DRIVER PHOTO REPORT
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "DriverPhotoReport" (
    "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "driverId"  TEXT NOT NULL REFERENCES "Driver"("id") ON DELETE CASCADE,
    "photoUrl"  TEXT NOT NULL,
    "type"      TEXT DEFAULT 'GENERAL',
    "notes"     TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "DriverPhotoReport" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage driver photo reports" ON "DriverPhotoReport";
CREATE POLICY "Service role can manage driver photo reports" ON "DriverPhotoReport"
    FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can manage driver photo reports" ON "DriverPhotoReport";
CREATE POLICY "Admins can manage driver photo reports" ON "DriverPhotoReport"
    FOR ALL USING (is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- 16. MERCHANT SCHEDULE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "MerchantSchedule" (
    "id"           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "restaurantId" TEXT NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
    "dayOfWeek"    INTEGER NOT NULL CHECK ("dayOfWeek" >= 0 AND "dayOfWeek" <= 6),
    "openTime"     TIME,
    "closeTime"    TIME,
    "isClosed"     BOOLEAN DEFAULT FALSE,
    "createdAt"    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "MerchantSchedule" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners can manage schedule" ON "MerchantSchedule";
CREATE POLICY "Owners can manage schedule" ON "MerchantSchedule"
    FOR ALL USING (
        EXISTS (SELECT 1 FROM "Restaurant" WHERE "Restaurant".id = "MerchantSchedule"."restaurantId" AND "Restaurant"."ownerId" = auth.uid()::text)
        OR is_admin()
    );
DROP POLICY IF EXISTS "Service role can manage schedule" ON "MerchantSchedule";
CREATE POLICY "Service role can manage schedule" ON "MerchantSchedule"
    FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 17. PRICING RULE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "PricingRule" (
    "id"           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "restaurantId" TEXT REFERENCES "Restaurant"("id") ON DELETE CASCADE,
    "name"         TEXT NOT NULL,
    "type"         TEXT NOT NULL, -- SURGE | DISCOUNT | FLAT
    "value"        DECIMAL(10,2) NOT NULL,
    "startsAt"     TIMESTAMP WITH TIME ZONE,
    "endsAt"       TIMESTAMP WITH TIME ZONE,
    "isActive"     BOOLEAN DEFAULT TRUE,
    "createdAt"    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "PricingRule" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage pricing rules" ON "PricingRule";
CREATE POLICY "Service role can manage pricing rules" ON "PricingRule"
    FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Owners can manage pricing rules" ON "PricingRule";
CREATE POLICY "Owners can manage pricing rules" ON "PricingRule"
    FOR ALL USING (
        EXISTS (SELECT 1 FROM "Restaurant" WHERE "Restaurant".id = "PricingRule"."restaurantId" AND "Restaurant"."ownerId" = auth.uid()::text)
        OR is_admin()
    );


-- ─────────────────────────────────────────────────────────────────────────────
-- 18. CHANGE REQUEST (admin workflow)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ChangeRequest" (
    "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "requestedBy" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "entityType"  TEXT NOT NULL,
    "entityId"    TEXT NOT NULL,
    "changes"     JSONB NOT NULL,
    "status"      TEXT DEFAULT 'PENDING',
    "reviewedBy"  TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "reviewedAt"  TIMESTAMP WITH TIME ZONE,
    "createdAt"   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "ChangeRequest" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage change requests" ON "ChangeRequest";
CREATE POLICY "Service role can manage change requests" ON "ChangeRequest"
    FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can manage change requests" ON "ChangeRequest";
CREATE POLICY "Admins can manage change requests" ON "ChangeRequest"
    FOR ALL USING (is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- 19. STATE API SYNC LOG
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "StateAPISyncLog" (
    "id"           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "state"        TEXT NOT NULL,
    "syncedAt"     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "status"       TEXT DEFAULT 'SUCCESS',
    "recordsFound" INTEGER DEFAULT 0,
    "error"        TEXT
);
ALTER TABLE "StateAPISyncLog" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage sync logs" ON "StateAPISyncLog";
CREATE POLICY "Service role can manage sync logs" ON "StateAPISyncLog"
    FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can read sync logs" ON "StateAPISyncLog";
CREATE POLICY "Admins can read sync logs" ON "StateAPISyncLog"
    FOR SELECT USING (is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- 20. IN-APP CONTENT (banners / promo content)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "InAppContent" (
    "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "type"      TEXT NOT NULL, -- BANNER | PROMO | ALERT
    "title"     TEXT,
    "body"      TEXT,
    "imageUrl"  TEXT,
    "linkUrl"   TEXT,
    "isActive"  BOOLEAN DEFAULT TRUE,
    "startsAt"  TIMESTAMP WITH TIME ZONE,
    "endsAt"    TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "InAppContent" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "In-app content is public" ON "InAppContent";
CREATE POLICY "In-app content is public" ON "InAppContent"
    FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage in-app content" ON "InAppContent";
CREATE POLICY "Admins can manage in-app content" ON "InAppContent"
    FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "Service role can manage in-app content" ON "InAppContent";
CREATE POLICY "Service role can manage in-app content" ON "InAppContent"
    FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 21. DELIVERY / PICKUP PROOF PHOTOS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "delivery_proofs" (
    "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "order_id"  TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "photo_url" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "delivery_proofs" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage delivery proofs" ON "delivery_proofs";
CREATE POLICY "Service role can manage delivery proofs" ON "delivery_proofs"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "pickup_proofs" (
    "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "order_id"  TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "photo_url" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "pickup_proofs" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage pickup proofs" ON "pickup_proofs";
CREATE POLICY "Service role can manage pickup proofs" ON "pickup_proofs"
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "order_issue_proofs" (
    "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "order_id"  TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "photo_url" TEXT NOT NULL,
    "issue"     TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE "order_issue_proofs" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage issue proofs" ON "order_issue_proofs";
CREATE POLICY "Service role can manage issue proofs" ON "order_issue_proofs"
    FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 22. ENABLE REALTIME on key tables
-- ─────────────────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE "Order";
ALTER PUBLICATION supabase_realtime ADD TABLE "OrderChatMessage";
ALTER PUBLICATION supabase_realtime ADD TABLE "Notification";
ALTER PUBLICATION supabase_realtime ADD TABLE "Driver";


-- =============================================================================
-- DONE. All tables created. QA database is ready.
-- =============================================================================
