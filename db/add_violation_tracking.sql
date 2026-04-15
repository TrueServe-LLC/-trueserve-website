/**
 * Violation Tracking Schema
 * Tracks violation aggregates and critical violation alerts
 */

-- Table to store aggregated violation counts by severity per restaurant
CREATE TABLE IF NOT EXISTS "ViolationAggregate" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    restaurantId TEXT NOT NULL UNIQUE REFERENCES "Restaurant"(id) ON DELETE CASCADE,
    criticalCount INTEGER NOT NULL DEFAULT 0,
    majorCount INTEGER NOT NULL DEFAULT 0,
    minorCount INTEGER NOT NULL DEFAULT 0,
    totalViolations INTEGER NOT NULL DEFAULT 0,
    criticalPercentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
    lastUpdatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for quick lookups
CREATE INDEX IF NOT EXISTS "idx_violation_agg_restaurant"
    ON "ViolationAggregate"(restaurantId);
CREATE INDEX IF NOT EXISTS "idx_violation_agg_critical_count"
    ON "ViolationAggregate"(criticalCount DESC);

-- Table to track critical violation alerts sent
CREATE TABLE IF NOT EXISTS "CriticalViolationAlert" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    restaurantId TEXT NOT NULL REFERENCES "Restaurant"(id) ON DELETE CASCADE,
    state VARCHAR(2) NOT NULL,
    inspectionDate TIMESTAMPTZ NOT NULL,
    violationDescription TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'major', 'minor')),
    alertSentAt TIMESTAMPTZ,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for queries
CREATE INDEX IF NOT EXISTS "idx_critical_alert_restaurant"
    ON "CriticalViolationAlert"(restaurantId, createdAt DESC);
CREATE INDEX IF NOT EXISTS "idx_critical_alert_unsent"
    ON "CriticalViolationAlert"(alertSentAt, createdAt DESC)
    WHERE alertSentAt IS NULL;
CREATE INDEX IF NOT EXISTS "idx_critical_alert_state"
    ON "CriticalViolationAlert"(state, createdAt DESC);

-- Add critical violation tracking columns to Restaurant table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Restaurant' AND column_name = 'hasCriticalViolations'
    ) THEN
        ALTER TABLE "Restaurant" ADD COLUMN hasCriticalViolations BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Restaurant' AND column_name = 'lastCriticalViolationDate'
    ) THEN
        ALTER TABLE "Restaurant" ADD COLUMN lastCriticalViolationDate TIMESTAMPTZ;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Restaurant' AND column_name = 'violationSeverityScore'
    ) THEN
        ALTER TABLE "Restaurant" ADD COLUMN violationSeverityScore INTEGER DEFAULT 0;
    END IF;
END $$;

-- Enable RLS on violation aggregate table
ALTER TABLE "ViolationAggregate" ENABLE ROW LEVEL SECURITY;

-- Merchants can only see their own restaurants' violation aggregates
CREATE POLICY IF NOT EXISTS "Owners can view violation aggregates" ON "ViolationAggregate"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Restaurant"
            WHERE "Restaurant"."id" = "ViolationAggregate"."restaurantId"
            AND "Restaurant"."ownerId" = auth.uid()::text
        )
        OR is_admin()
    );

-- Enable RLS on critical violation alerts
ALTER TABLE "CriticalViolationAlert" ENABLE ROW LEVEL SECURITY;

-- Merchants and admins can view critical violation alerts
CREATE POLICY IF NOT EXISTS "Owners can view critical alerts" ON "CriticalViolationAlert"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Restaurant"
            WHERE "Restaurant"."id" = "CriticalViolationAlert"."restaurantId"
            AND "Restaurant"."ownerId" = auth.uid()::text
        )
        OR is_admin()
    );

-- Function to update violation aggregate after inspection sync
CREATE OR REPLACE FUNCTION update_violation_aggregate(
    p_restaurantId TEXT,
    p_violations JSONB
)
RETURNS void AS $$
DECLARE
    v_critical_count INTEGER := 0;
    v_major_count INTEGER := 0;
    v_minor_count INTEGER := 0;
    v_total_count INTEGER := 0;
    v_critical_pct DECIMAL(5, 2) := 0;
    v_has_critical BOOLEAN := FALSE;
    v_violation JSONB;
BEGIN
    -- Count violations by severity
    FOR v_violation IN SELECT jsonb_array_elements(p_violations)
    LOOP
        v_total_count := v_total_count + 1;

        -- Simple classification based on keywords
        IF (v_violation::TEXT ILIKE '%temperature%' OR
            v_violation::TEXT ILIKE '%cold chain%' OR
            v_violation::TEXT ILIKE '%pest%' OR
            v_violation::TEXT ILIKE '%pathogen%' OR
            v_violation::TEXT ILIKE '%handwashing%' OR
            v_violation::TEXT ILIKE '%cross.contamination%') THEN
            v_critical_count := v_critical_count + 1;
            v_has_critical := TRUE;
        ELSIF (v_violation::TEXT ILIKE '%label%' OR
               v_violation::TEXT ILIKE '%equipment%' OR
               v_violation::TEXT ILIKE '%cleaning%' OR
               v_violation::TEXT ILIKE '%records%') THEN
            v_major_count := v_major_count + 1;
        ELSE
            v_minor_count := v_minor_count + 1;
        END IF;
    END LOOP;

    -- Calculate percentage
    IF v_total_count > 0 THEN
        v_critical_pct := (v_critical_count::DECIMAL / v_total_count) * 100;
    END IF;

    -- Upsert violation aggregate
    INSERT INTO "ViolationAggregate" (
        restaurantId,
        criticalCount,
        majorCount,
        minorCount,
        totalViolations,
        criticalPercentage,
        lastUpdatedAt
    ) VALUES (
        p_restaurantId,
        v_critical_count,
        v_major_count,
        v_minor_count,
        v_total_count,
        v_critical_pct,
        NOW()
    )
    ON CONFLICT (restaurantId) DO UPDATE SET
        criticalCount = EXCLUDED.criticalCount,
        majorCount = EXCLUDED.majorCount,
        minorCount = EXCLUDED.minorCount,
        totalViolations = EXCLUDED.totalViolations,
        criticalPercentage = EXCLUDED.criticalPercentage,
        lastUpdatedAt = NOW();

    -- Update restaurant critical violation flag
    UPDATE "Restaurant"
    SET
        hasCriticalViolations = v_has_critical,
        violationSeverityScore = v_critical_count * 5 + v_major_count * 1,
        lastCriticalViolationDate = CASE WHEN v_has_critical THEN NOW() ELSE lastCriticalViolationDate END
    WHERE id = p_restaurantId;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update violation aggregate when state inspection data is inserted/updated
CREATE OR REPLACE FUNCTION trigger_update_violation_aggregate()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_violation_aggregate(NEW.restaurantId, NEW.violations);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to avoid duplicates
DROP TRIGGER IF NOT EXISTS on_state_inspection_data_violation_update
    ON "StateInspectionData";

-- Create trigger
CREATE TRIGGER on_state_inspection_data_violation_update
AFTER INSERT OR UPDATE ON "StateInspectionData"
FOR EACH ROW
EXECUTE FUNCTION trigger_update_violation_aggregate();

-- Grant execute permission to authenticated users for the update function
GRANT EXECUTE ON FUNCTION update_violation_aggregate TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_update_violation_aggregate TO authenticated;
