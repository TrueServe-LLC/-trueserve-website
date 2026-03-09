-- Production SQL: Ensure Realtime is enabled for Order and Driver tracking
BEGIN;

-- Enable logical replication (Realtime) for the Driver table to broadcast location updates
ALTER PUBLICATION supabase_realtime ADD TABLE "Driver";

-- Enable logical replication (Realtime) for the Order table to broadcast status updates
ALTER PUBLICATION supabase_realtime ADD TABLE "Order";

COMMIT;
