-- Migration: Add GoHighLevel (GHL) Support to Merchants
-- Purpose: Enable synchronization between TrueServe and GHL marketing sites.

ALTER TABLE "Restaurant"
ADD COLUMN IF NOT EXISTS "ghlLocationId" TEXT,
ADD COLUMN IF NOT EXISTS "ghlSyncEnabled" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "websiteUrl" TEXT;

-- Index for faster webhook lookups
CREATE INDEX IF NOT EXISTS "idx_restaurant_ghl_location" ON "Restaurant"("ghlLocationId");

-- Audit Log for GHL Sync
INSERT INTO "AuditLog" ("id", "action", "entityType", "targetId", "message", "createdAt")
VALUES (uuid_generate_v4(), 'INFRA_UPGRADE', 'SYSTEM', NULL, 'Added GHL Support fields to Restaurant table', NOW());
