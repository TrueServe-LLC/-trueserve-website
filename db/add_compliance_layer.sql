-- =============================================================================
-- TrueServe Compliance Layer Migration
-- Purpose: Add restaurant and driver compliance tracking, inspection history,
-- and provider integrations for pilot rollout.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- RESTAURANT SUMMARY FIELDS
-- ---------------------------------------------------------------------------

ALTER TABLE "Restaurant"
ADD COLUMN IF NOT EXISTS "complianceScore" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "healthGrade" TEXT,
ADD COLUMN IF NOT EXISTS "complianceStatus" TEXT DEFAULT 'NOT_STARTED',
ADD COLUMN IF NOT EXISTS "lastInspectionAt" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "lastInspectionSource" TEXT,
ADD COLUMN IF NOT EXISTS "publicInspectionUrl" TEXT,
ADD COLUMN IF NOT EXISTS "complianceNotes" TEXT,
ADD COLUMN IF NOT EXISTS "complianceTier" TEXT DEFAULT 'Basic';

COMMENT ON COLUMN "Restaurant"."complianceScore" IS 'TrueServe compliance score (0-100) from inspections and checklist readiness.';
COMMENT ON COLUMN "Restaurant"."healthGrade" IS 'Latest public health grade or restaurant grade label.';
COMMENT ON COLUMN "Restaurant"."complianceStatus" IS 'NOT_STARTED, IN_REVIEW, WARNING, PASS, or FLAGGED.';
COMMENT ON COLUMN "Restaurant"."lastInspectionAt" IS 'Most recent public or vendor inspection timestamp.';
COMMENT ON COLUMN "Restaurant"."lastInspectionSource" IS 'Provider or jurisdiction that supplied the last inspection.';
COMMENT ON COLUMN "Restaurant"."publicInspectionUrl" IS 'Link to public inspection record when available.';
COMMENT ON COLUMN "Restaurant"."complianceNotes" IS 'Internal merchant notes or remediation context.';
COMMENT ON COLUMN "Restaurant"."complianceTier" IS 'Compliance feature tier used for pilot / monetization planning.';

CREATE INDEX IF NOT EXISTS "idx_restaurant_compliance_score" ON "Restaurant"("complianceScore");
CREATE INDEX IF NOT EXISTS "idx_restaurant_compliance_status" ON "Restaurant"("complianceStatus");

-- ---------------------------------------------------------------------------
-- DRIVER SUMMARY FIELDS
-- ---------------------------------------------------------------------------

ALTER TABLE "Driver"
ADD COLUMN IF NOT EXISTS "complianceScore" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "foodSafetyTrainingComplete" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "bagSanitationAcknowledged" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "temperatureControlAcknowledged" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "lastComplianceAttestationAt" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "complianceStatus" TEXT DEFAULT 'PENDING';

COMMENT ON COLUMN "Driver"."complianceScore" IS 'Driver compliance score from training and attestations.';
COMMENT ON COLUMN "Driver"."foodSafetyTrainingComplete" IS 'True when driver training has been completed.';
COMMENT ON COLUMN "Driver"."bagSanitationAcknowledged" IS 'True when driver has acknowledged hot bag sanitation.';
COMMENT ON COLUMN "Driver"."temperatureControlAcknowledged" IS 'True when driver has acknowledged temperature handling rules.';
COMMENT ON COLUMN "Driver"."lastComplianceAttestationAt" IS 'Most recent driver compliance attestation time.';
COMMENT ON COLUMN "Driver"."complianceStatus" IS 'PENDING, TRAINING, ACTIVE, WARNING, or SUSPENDED.';

CREATE INDEX IF NOT EXISTS "idx_driver_compliance_score" ON "Driver"("complianceScore");
CREATE INDEX IF NOT EXISTS "idx_driver_compliance_status" ON "Driver"("complianceStatus");

-- ---------------------------------------------------------------------------
-- PROVIDER / INTEGRATION TABLES
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "ComplianceIntegration" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "restaurantId" TEXT NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
    "provider" TEXT NOT NULL, -- safetyculture | jolt | iauditor | zenput | public-health
    "externalLocationId" TEXT,
    "externalAccountId" TEXT,
    "status" TEXT DEFAULT 'ACTIVE',
    "syncMode" TEXT DEFAULT 'WEBHOOK',
    "accessTokenEncrypted" TEXT,
    "refreshTokenEncrypted" TEXT,
    "webhookSecret" TEXT,
    "config" JSONB DEFAULT '{}'::jsonb,
    "lastSyncAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_compliance_integration_restaurant_provider"
    ON "ComplianceIntegration"("restaurantId", "provider");
CREATE INDEX IF NOT EXISTS "idx_compliance_integration_provider" ON "ComplianceIntegration"("provider");
CREATE INDEX IF NOT EXISTS "idx_compliance_integration_status" ON "ComplianceIntegration"("status");

ALTER TABLE "ComplianceIntegration" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view compliance integrations" ON "ComplianceIntegration";
CREATE POLICY "Owners can view compliance integrations" ON "ComplianceIntegration"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Restaurant"
            WHERE "Restaurant"."id" = "ComplianceIntegration"."restaurantId"
            AND "Restaurant"."ownerId" = auth.uid()::text
        )
        OR is_admin()
    );

DROP POLICY IF EXISTS "Owners can manage compliance integrations" ON "ComplianceIntegration";
CREATE POLICY "Owners can manage compliance integrations" ON "ComplianceIntegration"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Restaurant"
            WHERE "Restaurant"."id" = "ComplianceIntegration"."restaurantId"
            AND "Restaurant"."ownerId" = auth.uid()::text
        )
        OR is_admin()
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Restaurant"
            WHERE "Restaurant"."id" = "ComplianceIntegration"."restaurantId"
            AND "Restaurant"."ownerId" = auth.uid()::text
        )
        OR is_admin()
    );

DROP POLICY IF EXISTS "Service role can manage compliance integrations" ON "ComplianceIntegration";
CREATE POLICY "Service role can manage compliance integrations" ON "ComplianceIntegration"
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "ComplianceInspection" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "restaurantId" TEXT NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
    "provider" TEXT NOT NULL,
    "externalInspectionId" TEXT,
    "inspectionDate" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "score" INTEGER,
    "grade" TEXT,
    "status" TEXT DEFAULT 'PASS',
    "violations" JSONB DEFAULT '[]'::jsonb,
    "rawPayload" JSONB DEFAULT '{}'::jsonb,
    "sourceUrl" TEXT,
    "inspectorName" TEXT,
    "nextInspectionDue" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_compliance_inspection_restaurant" ON "ComplianceInspection"("restaurantId");
CREATE INDEX IF NOT EXISTS "idx_compliance_inspection_provider" ON "ComplianceInspection"("provider");
CREATE INDEX IF NOT EXISTS "idx_compliance_inspection_date" ON "ComplianceInspection"("inspectionDate" DESC);

ALTER TABLE "ComplianceInspection" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view compliance inspections" ON "ComplianceInspection";
CREATE POLICY "Owners can view compliance inspections" ON "ComplianceInspection"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Restaurant"
            WHERE "Restaurant"."id" = "ComplianceInspection"."restaurantId"
            AND "Restaurant"."ownerId" = auth.uid()::text
        )
        OR is_admin()
    );

DROP POLICY IF EXISTS "Owners can manage compliance inspections" ON "ComplianceInspection";
CREATE POLICY "Owners can manage compliance inspections" ON "ComplianceInspection"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Restaurant"
            WHERE "Restaurant"."id" = "ComplianceInspection"."restaurantId"
            AND "Restaurant"."ownerId" = auth.uid()::text
        )
        OR is_admin()
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Restaurant"
            WHERE "Restaurant"."id" = "ComplianceInspection"."restaurantId"
            AND "Restaurant"."ownerId" = auth.uid()::text
        )
        OR is_admin()
    );

DROP POLICY IF EXISTS "Service role can manage compliance inspections" ON "ComplianceInspection";
CREATE POLICY "Service role can manage compliance inspections" ON "ComplianceInspection"
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "ComplianceChecklistRun" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "restaurantId" TEXT NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
    "driverId" TEXT REFERENCES "Driver"("id") ON DELETE SET NULL,
    "checklistType" TEXT NOT NULL,
    "checklistVersion" TEXT DEFAULT 'v1',
    "status" TEXT DEFAULT 'COMPLETE',
    "score" INTEGER DEFAULT 0,
    "answers" JSONB DEFAULT '{}'::jsonb,
    "evidenceUrls" TEXT[] DEFAULT '{}',
    "completedAt" TIMESTAMPTZ DEFAULT NOW(),
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_compliance_checklist_restaurant" ON "ComplianceChecklistRun"("restaurantId");
CREATE INDEX IF NOT EXISTS "idx_compliance_checklist_driver" ON "ComplianceChecklistRun"("driverId");
CREATE INDEX IF NOT EXISTS "idx_compliance_checklist_type" ON "ComplianceChecklistRun"("checklistType");

ALTER TABLE "ComplianceChecklistRun" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view checklist runs" ON "ComplianceChecklistRun";
CREATE POLICY "Owners can view checklist runs" ON "ComplianceChecklistRun"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Restaurant"
            WHERE "Restaurant"."id" = "ComplianceChecklistRun"."restaurantId"
            AND "Restaurant"."ownerId" = auth.uid()::text
        )
        OR EXISTS (
            SELECT 1 FROM "Driver"
            WHERE "Driver"."id" = "ComplianceChecklistRun"."driverId"
            AND "Driver"."userId" = auth.uid()::text
        )
        OR is_admin()
    );

DROP POLICY IF EXISTS "Owners can manage checklist runs" ON "ComplianceChecklistRun";
CREATE POLICY "Owners can manage checklist runs" ON "ComplianceChecklistRun"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Restaurant"
            WHERE "Restaurant"."id" = "ComplianceChecklistRun"."restaurantId"
            AND "Restaurant"."ownerId" = auth.uid()::text
        )
        OR EXISTS (
            SELECT 1 FROM "Driver"
            WHERE "Driver"."id" = "ComplianceChecklistRun"."driverId"
            AND "Driver"."userId" = auth.uid()::text
        )
        OR is_admin()
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Restaurant"
            WHERE "Restaurant"."id" = "ComplianceChecklistRun"."restaurantId"
            AND "Restaurant"."ownerId" = auth.uid()::text
        )
        OR EXISTS (
            SELECT 1 FROM "Driver"
            WHERE "Driver"."id" = "ComplianceChecklistRun"."driverId"
            AND "Driver"."userId" = auth.uid()::text
        )
        OR is_admin()
    );

DROP POLICY IF EXISTS "Service role can manage checklist runs" ON "ComplianceChecklistRun";
CREATE POLICY "Service role can manage checklist runs" ON "ComplianceChecklistRun"
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "ComplianceScoreHistory" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "restaurantId" TEXT NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
    "score" INTEGER NOT NULL DEFAULT 0,
    "breakdown" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "source" TEXT DEFAULT 'SYSTEM',
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_compliance_score_history_restaurant" ON "ComplianceScoreHistory"("restaurantId");
CREATE INDEX IF NOT EXISTS "idx_compliance_score_history_created" ON "ComplianceScoreHistory"("createdAt" DESC);

ALTER TABLE "ComplianceScoreHistory" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view compliance score history" ON "ComplianceScoreHistory";
CREATE POLICY "Owners can view compliance score history" ON "ComplianceScoreHistory"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Restaurant"
            WHERE "Restaurant"."id" = "ComplianceScoreHistory"."restaurantId"
            AND "Restaurant"."ownerId" = auth.uid()::text
        )
        OR is_admin()
    );

DROP POLICY IF EXISTS "Service role can manage compliance score history" ON "ComplianceScoreHistory";
CREATE POLICY "Service role can manage compliance score history" ON "ComplianceScoreHistory"
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "ComplianceTemplate" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "restaurantId" TEXT NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
    "templateType" TEXT NOT NULL DEFAULT 'daily_hygiene',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT DEFAULT 'DRAFT',
    "suggestions" JSONB DEFAULT '[]'::jsonb,
    "sections" JSONB DEFAULT '[]'::jsonb,
    "aiNotes" TEXT,
    "lastGeneratedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_compliance_template_restaurant_type"
    ON "ComplianceTemplate"("restaurantId", "templateType");
CREATE INDEX IF NOT EXISTS "idx_compliance_template_restaurant" ON "ComplianceTemplate"("restaurantId");
CREATE INDEX IF NOT EXISTS "idx_compliance_template_status" ON "ComplianceTemplate"("status");

ALTER TABLE "ComplianceTemplate" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view compliance templates" ON "ComplianceTemplate";
CREATE POLICY "Owners can view compliance templates" ON "ComplianceTemplate"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Restaurant"
            WHERE "Restaurant"."id" = "ComplianceTemplate"."restaurantId"
            AND "Restaurant"."ownerId" = auth.uid()::text
        )
        OR is_admin()
    );

DROP POLICY IF EXISTS "Owners can manage compliance templates" ON "ComplianceTemplate";
CREATE POLICY "Owners can manage compliance templates" ON "ComplianceTemplate"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Restaurant"
            WHERE "Restaurant"."id" = "ComplianceTemplate"."restaurantId"
            AND "Restaurant"."ownerId" = auth.uid()::text
        )
        OR is_admin()
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Restaurant"
            WHERE "Restaurant"."id" = "ComplianceTemplate"."restaurantId"
            AND "Restaurant"."ownerId" = auth.uid()::text
        )
        OR is_admin()
    );

DROP POLICY IF EXISTS "Service role can manage compliance templates" ON "ComplianceTemplate";
CREATE POLICY "Service role can manage compliance templates" ON "ComplianceTemplate"
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "DriverCompliance" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "driverId" TEXT NOT NULL UNIQUE REFERENCES "Driver"("id") ON DELETE CASCADE,
    "trainingStatus" TEXT DEFAULT 'PENDING',
    "bagSanitationAcknowledged" BOOLEAN DEFAULT FALSE,
    "temperatureControlAcknowledged" BOOLEAN DEFAULT FALSE,
    "foodSafetyTrainingComplete" BOOLEAN DEFAULT FALSE,
    "lastAttestationAt" TIMESTAMPTZ,
    "complianceScore" INTEGER DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_driver_compliance_driver" ON "DriverCompliance"("driverId");
CREATE INDEX IF NOT EXISTS "idx_driver_compliance_training" ON "DriverCompliance"("trainingStatus");

ALTER TABLE "DriverCompliance" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Drivers can view own compliance" ON "DriverCompliance";
CREATE POLICY "Drivers can view own compliance" ON "DriverCompliance"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Driver"
            WHERE "Driver"."id" = "DriverCompliance"."driverId"
            AND "Driver"."userId" = auth.uid()::text
        )
        OR is_admin()
    );

DROP POLICY IF EXISTS "Drivers can manage own compliance" ON "DriverCompliance";
CREATE POLICY "Drivers can manage own compliance" ON "DriverCompliance"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "Driver"
            WHERE "Driver"."id" = "DriverCompliance"."driverId"
            AND "Driver"."userId" = auth.uid()::text
        )
        OR is_admin()
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Driver"
            WHERE "Driver"."id" = "DriverCompliance"."driverId"
            AND "Driver"."userId" = auth.uid()::text
        )
        OR is_admin()
    );

DROP POLICY IF EXISTS "Service role can manage driver compliance" ON "DriverCompliance";
CREATE POLICY "Service role can manage driver compliance" ON "DriverCompliance"
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- SCORE RECALCULATION HELPERS
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION recalculate_restaurant_compliance_score(target_restaurant_id TEXT)
RETURNS TABLE(score INTEGER, breakdown JSONB) AS $$
DECLARE
    latest_inspection_score INTEGER := 0;
    latest_checklist_score INTEGER := 0;
    checklist_count INTEGER := 0;
    latest_inspection_at TIMESTAMPTZ;
    derived_status TEXT := 'NOT_STARTED';
BEGIN
    SELECT
        COALESCE("score", 0),
        "inspectionDate"
    INTO latest_inspection_score, latest_inspection_at
    FROM "ComplianceInspection"
    WHERE "restaurantId" = target_restaurant_id
    ORDER BY "inspectionDate" DESC
    LIMIT 1;

    SELECT
        COALESCE(ROUND(AVG("score"))::INTEGER, 0),
        COUNT(*)
    INTO latest_checklist_score, checklist_count
    FROM "ComplianceChecklistRun"
    WHERE "restaurantId" = target_restaurant_id
      AND COALESCE("status", 'COMPLETE') = 'COMPLETE';

    score := LEAST(
        100,
        GREATEST(
            0,
            ROUND(
                (COALESCE(latest_inspection_score, 0) * 0.65) +
                (COALESCE(latest_checklist_score, 0) * 0.25) +
                (CASE WHEN checklist_count > 0 THEN 10 ELSE 0 END)
            )::NUMERIC
        )::INTEGER
    );

    derived_status := CASE
        WHEN score >= 90 THEN 'PASS'
        WHEN score >= 70 THEN 'IN_REVIEW'
        WHEN score >= 50 THEN 'WARNING'
        ELSE 'FLAGGED'
    END;

    breakdown := jsonb_build_object(
        'inspectionScore', COALESCE(latest_inspection_score, 0),
        'checklistScore', COALESCE(latest_checklist_score, 0),
        'checklistCount', checklist_count,
        'lastInspectionAt', latest_inspection_at,
        'status', derived_status
    );

    UPDATE "Restaurant"
    SET
        "complianceScore" = score,
        "complianceStatus" = derived_status,
        "lastInspectionAt" = latest_inspection_at,
        "updatedAt" = NOW()
    WHERE "id" = target_restaurant_id;

    INSERT INTO "ComplianceScoreHistory" ("restaurantId", "score", "breakdown", "source")
    VALUES (target_restaurant_id, score, breakdown, 'SYSTEM');

    RETURN QUERY SELECT score, breakdown;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION recalculate_driver_compliance_score(target_driver_id TEXT)
RETURNS TABLE(score INTEGER, breakdown JSONB) AS $$
DECLARE
    current_training_status TEXT := 'PENDING';
    bag_ok BOOLEAN := FALSE;
    temp_ok BOOLEAN := FALSE;
    training_ok BOOLEAN := FALSE;
    attestation_at TIMESTAMPTZ;
BEGIN
    SELECT
        COALESCE("trainingStatus", 'PENDING'),
        COALESCE("bagSanitationAcknowledged", FALSE),
        COALESCE("temperatureControlAcknowledged", FALSE),
        COALESCE("foodSafetyTrainingComplete", FALSE),
        "lastAttestationAt"
    INTO current_training_status, bag_ok, temp_ok, training_ok, attestation_at
    FROM "DriverCompliance"
    WHERE "driverId" = target_driver_id;

    score := 0;
    IF training_ok THEN score := score + 40; END IF;
    IF bag_ok THEN score := score + 30; END IF;
    IF temp_ok THEN score := score + 30; END IF;

    breakdown := jsonb_build_object(
        'trainingStatus', current_training_status,
        'trainingComplete', training_ok,
        'bagSanitationAcknowledged', bag_ok,
        'temperatureControlAcknowledged', temp_ok,
        'lastAttestationAt', attestation_at
    );

    UPDATE "Driver"
    SET
        "complianceScore" = score,
        "complianceStatus" = CASE
            WHEN score >= 90 THEN 'ACTIVE'
            WHEN score >= 70 THEN 'TRAINING'
            WHEN score >= 40 THEN 'WARNING'
            ELSE 'PENDING'
        END,
        "lastComplianceAttestationAt" = attestation_at,
        "updatedAt" = NOW()
    WHERE "id" = target_driver_id;

    RETURN QUERY SELECT score, breakdown;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
