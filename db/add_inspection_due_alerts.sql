/**
 * Inspection Due Alerts Schema
 * Tracks calculated inspection due dates and alert sending status
 * Enables proactive notifications before inspections are due
 */

-- Add columns to Restaurant table for quick lookups
ALTER TABLE "Restaurant"
  ADD COLUMN IF NOT EXISTS "nextInspectionDueDate" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "inspectionAlertStatus" VARCHAR(50) DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "inspectionDueDaysThreshold" INTEGER DEFAULT 30;

CREATE INDEX IF NOT EXISTS "idx_restaurant_next_inspection_due"
  ON "Restaurant"("nextInspectionDueDate");
CREATE INDEX IF NOT EXISTS "idx_restaurant_inspection_alert_status"
  ON "Restaurant"("inspectionAlertStatus");

-- Track inspection due alerts and alert sending status
CREATE TABLE IF NOT EXISTS "InspectionDueAlert" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    restaurantId TEXT NOT NULL REFERENCES "Restaurant"(id) ON DELETE CASCADE,
    state VARCHAR(2) NOT NULL,
    lastInspectionDate TIMESTAMPTZ,
    calculatedDueDate TIMESTAMPTZ NOT NULL,
    daysUntilDue INTEGER,
    alertStatus VARCHAR(50) DEFAULT 'PENDING',
    -- Status values:
    -- PENDING: Alert not yet sent (due date in future)
    -- SENT_30_DAYS: Sent 30-day advance notice
    -- SENT_7_DAYS: Sent 7-day advance notice
    -- SENT_OVERDUE: Sent overdue notification
    -- COMPLETED: Inspection occurred (marked manually or via sync)
    alert30DaysSentAt TIMESTAMPTZ,
    alert7DaysSentAt TIMESTAMPTZ,
    alertOverdueSentAt TIMESTAMPTZ,
    ownerEmail VARCHAR(255),
    ownerPhone VARCHAR(20),
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE UNIQUE INDEX IF NOT EXISTS "idx_inspection_due_alert_restaurant"
  ON "InspectionDueAlert"(restaurantId);
CREATE INDEX IF NOT EXISTS "idx_inspection_due_alert_status"
  ON "InspectionDueAlert"("alertStatus");
CREATE INDEX IF NOT EXISTS "idx_inspection_due_alert_due_date"
  ON "InspectionDueAlert"("calculatedDueDate");
CREATE INDEX IF NOT EXISTS "idx_inspection_due_alert_state"
  ON "InspectionDueAlert"("state");

-- Enable Row Level Security
ALTER TABLE "InspectionDueAlert" ENABLE ROW LEVEL SECURITY;

-- Merchants can only view their own inspection due alerts
CREATE POLICY "Owners can view inspection due alerts" ON "InspectionDueAlert"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "Restaurant"
            WHERE "Restaurant"."id" = "InspectionDueAlert"."restaurantId"
            AND "Restaurant"."ownerId" = auth.uid()::text
        )
        OR is_admin()
    );

-- Admins can update alert status
CREATE POLICY "Admins can update inspection due alerts" ON "InspectionDueAlert"
    FOR UPDATE USING (is_admin())
    WITH CHECK (is_admin());

-- Store alert history for tracking and debugging
CREATE TABLE IF NOT EXISTS "InspectionAlertHistory" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    restaurantId TEXT NOT NULL REFERENCES "Restaurant"(id) ON DELETE CASCADE,
    state VARCHAR(2) NOT NULL,
    alertType VARCHAR(50) NOT NULL,
    -- Alert types: 30_days, 7_days, overdue, inspection_completed
    daysUntilDue INTEGER,
    emailSent BOOLEAN DEFAULT FALSE,
    smsSent BOOLEAN DEFAULT FALSE,
    emailAddress VARCHAR(255),
    phoneNumber VARCHAR(20),
    emailError TEXT,
    smsError TEXT,
    createdAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_alert_history_restaurant"
  ON "InspectionAlertHistory"("restaurantId");
CREATE INDEX IF NOT EXISTS "idx_alert_history_created"
  ON "InspectionAlertHistory"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_alert_history_type"
  ON "InspectionAlertHistory"("alertType");

-- Trigger to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_inspection_due_alert_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inspection_due_alert_timestamp
BEFORE UPDATE ON "InspectionDueAlert"
FOR EACH ROW
EXECUTE FUNCTION update_inspection_due_alert_timestamp();

-- Helper function to update restaurant's due date and alert status
CREATE OR REPLACE FUNCTION update_restaurant_inspection_due_date(
  p_restaurant_id TEXT,
  p_due_date TIMESTAMPTZ,
  p_days_until INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE "Restaurant"
  SET
    "nextInspectionDueDate" = p_due_date,
    "inspectionAlertStatus" = CASE
      WHEN p_days_until < 0 THEN 'OVERDUE'
      WHEN p_days_until <= 7 THEN 'DUE_SOON'
      WHEN p_days_until <= 30 THEN 'UPCOMING'
      ELSE 'PENDING'
    END,
    "updatedAt" = NOW()
  WHERE id = p_restaurant_id;
END;
$$ LANGUAGE plpgsql;
