-- =============================================================================
-- State Health Department API Integration
-- Purpose: Store real-time inspection data from state APIs (NC, NY, FL, PA)
-- and track sync status for monitoring
-- =============================================================================

-- ---------------------------------------------------------------------------
-- STATE INSPECTION DATA TABLE
-- ---------------------------------------------------------------------------
-- Stores real inspection records from state health department APIs
-- One record per inspection event per establishment

CREATE TABLE IF NOT EXISTS "StateInspectionData" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "restaurantId" TEXT NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
    "state" VARCHAR(2) NOT NULL,
    "externalInspectionId" VARCHAR(255) NOT NULL,
    "inspectionDate" TIMESTAMPTZ NOT NULL,
    "inspectorName" VARCHAR(255),
    "violations" JSONB DEFAULT '[]'::jsonb,
    "score" INTEGER,
    "grade" VARCHAR(1),
    "status" VARCHAR(20) DEFAULT 'PASS', -- PASS, FAIL, CONDITIONAL
    "notes" TEXT,
    "sourceAPI" VARCHAR(50) NOT NULL, -- nc, ny, fl, pa
    "externalURL" TEXT,
    "lastSyncedAt" TIMESTAMPTZ DEFAULT NOW(),
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE "StateInspectionData" IS 'Real inspection records fetched from state health department APIs';
COMMENT ON COLUMN "StateInspectionData"."externalInspectionId" IS 'Unique ID from state API to prevent duplicates';
COMMENT ON COLUMN "StateInspectionData"."violations" IS 'Array of violation objects with code, description, severity';
COMMENT ON COLUMN "StateInspectionData"."sourceAPI" IS 'Which state API provided this record (nc, ny, fl, pa)';

-- Prevent duplicate records from same inspection
CREATE UNIQUE INDEX IF NOT EXISTS "idx_state_inspection_external_id"
    ON "StateInspectionData"("state", "externalInspectionId");

-- Fast lookup by restaurant
CREATE INDEX IF NOT EXISTS "idx_state_inspection_restaurant"
    ON "StateInspectionData"("restaurantId", "inspectionDate" DESC);

-- Fast lookup for recent inspections
CREATE INDEX IF NOT EXISTS "idx_state_inspection_date"
    ON "StateInspectionData"("inspectionDate" DESC);

-- Enable RLS for privacy
ALTER TABLE "StateInspectionData" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view state inspections" ON "StateInspectionData";
CREATE POLICY "Owners can view state inspections" ON "StateInspectionData"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Restaurant"
            WHERE "Restaurant"."id" = "StateInspectionData"."restaurantId"
            AND "Restaurant"."ownerId" = auth.uid()::text
        )
        OR is_admin()
    );

DROP POLICY IF EXISTS "Service role can manage state inspections" ON "StateInspectionData";
CREATE POLICY "Service role can manage state inspections" ON "StateInspectionData"
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- STATE API SYNC LOG TABLE
-- ---------------------------------------------------------------------------
-- Track sync success/failures for monitoring and debugging

CREATE TABLE IF NOT EXISTS "StateAPISyncLog" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "state" VARCHAR(2) NOT NULL,
    "syncStartedAt" TIMESTAMPTZ NOT NULL,
    "syncCompletedAt" TIMESTAMPTZ,
    "recordsSynced" INTEGER DEFAULT 0,
    "recordsFailed" INTEGER DEFAULT 0,
    "errorCount" INTEGER DEFAULT 0,
    "status" VARCHAR(20) DEFAULT 'pending', -- pending, running, success, partial, failed
    "errorDetails" JSONB DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE "StateAPISyncLog" IS 'Log of API sync operations for monitoring';
COMMENT ON COLUMN "StateAPISyncLog"."status" IS 'pending=waiting to run, running=currently syncing, success=all good, partial=some failed, failed=critical error';
COMMENT ON COLUMN "StateAPISyncLog"."errorDetails" IS 'Details about errors encountered (restaurantId, error message)';

CREATE INDEX IF NOT EXISTS "idx_sync_log_state"
    ON "StateAPISyncLog"("state", "syncStartedAt" DESC);

CREATE INDEX IF NOT EXISTS "idx_sync_log_status"
    ON "StateAPISyncLog"("status");

CREATE INDEX IF NOT EXISTS "idx_sync_log_recent"
    ON "StateAPISyncLog"("createdAt" DESC);

-- ---------------------------------------------------------------------------
-- RESTAURANT COLUMNS FOR STATE API INTEGRATION
-- ---------------------------------------------------------------------------
-- Add support for external establishment IDs and feature toggling

ALTER TABLE "Restaurant"
ADD COLUMN IF NOT EXISTS "externalEstablishmentId" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "stateInspectionDataEnabled" BOOLEAN DEFAULT true;

COMMENT ON COLUMN "Restaurant"."externalEstablishmentId" IS 'External ID from state health dept (used for API lookups)';
COMMENT ON COLUMN "Restaurant"."stateInspectionDataEnabled" IS 'Whether to sync live inspection data for this restaurant';

CREATE INDEX IF NOT EXISTS "idx_restaurant_external_establishment_id"
    ON "Restaurant"("externalEstablishmentId");

-- =============================================================================
-- NOTES FOR IMPLEMENTATION
-- =============================================================================
-- 1. externalEstablishmentId must be populated for each restaurant before sync
--    For now, this can be done manually or via a separate migration
-- 2. StateAPISyncLog is for monitoring only - check status after each cron run
-- 3. Violations are stored as JSONB for flexibility across states:
--    Example: [
--      { "code": "3-201.14", "description": "Food held at improper temperature", "severity": "critical" },
--      { "code": "2-301.14", "description": "Handwashing not available", "severity": "major" }
--    ]
-- 4. sourceAPI helps trace which state provided the data
-- 5. externalURL provides link back to state portal for verification
