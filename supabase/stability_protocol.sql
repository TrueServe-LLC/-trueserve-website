-- TrueServe Step 19: Disaster Recovery & Stability Protocol
-- Scaling the Order Infrastructure for High-Volume Production Deployment.

-- 1. Optimized Indices for Order Throughput & High-Frequency Lookups
CREATE INDEX IF NOT EXISTS "idx_order_restaurant_status" ON "Order"("restaurantId", "status");
CREATE INDEX IF NOT EXISTS "idx_order_created_at_desc" ON "Order"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_order_pos_reference" ON "Order"("posReference");

-- 2. Performance Safeguard: Automated Order Archival
-- Archiving orders older than 180 days to keep the primary dashboard and dispatch engine snappy.
-- Use This as a maintenance query during low-traffic windows or schedule via pg_cron.

CREATE TABLE IF NOT EXISTS "Order_Archive" (
    LIKE "Order" INCLUDING ALL
);

-- Archiver Function: Moves completed/old orders to archive table
CREATE OR REPLACE FUNCTION archive_old_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO "Order_Archive"
    SELECT * FROM "Order"
    WHERE "createdAt" < NOW() - INTERVAL '180 days'
    AND "status" IN ('DELIVERED', 'CANCELLED');

    DELETE FROM "Order"
    WHERE "createdAt" < NOW() - INTERVAL '180 days'
    AND "status" IN ('DELIVERED', 'CANCELLED');
END;
$$;

-- 3. High-Security Health Gate: Automated Integrity Checks
-- Alert Trigger for mismatched order totals (Potential Fraud or POS Out-of-Sync)
CREATE OR REPLACE FUNCTION check_order_sanity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.total <= 0 THEN
        INSERT INTO "AuditLog" (action, targetId, entityType, message, createdAt)
        VALUES ('ORDER_SANITY_ERROR', NEW.id, 'Order', 'Order total is zero or negative. POS Sync error?', NOW());
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_sanity ON "Order";
CREATE TRIGGER trg_order_sanity
BEFORE INSERT ON "Order"
FOR EACH ROW EXECUTE FUNCTION check_order_sanity();

-- 4. Disaster Recovery Dashboard: Quick Snapshot for Incident Reporting
-- This provides a one-click dump of current operational state.
CREATE OR REPLACE VIEW "System_Health_Snapshot" AS
SELECT
    (SELECT count(*) FROM "Order" WHERE status = 'PENDING') as pending_orders,
    (SELECT count(*) FROM "Driver" WHERE status = 'ONLINE') as active_drivers,
    (SELECT count(*) FROM "Restaurant" WHERE "isBusy" = true) as busy_restaurants,
    NOW() as snapshotted_at;
