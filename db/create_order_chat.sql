-- Create OrderChatMessage table for driver-customer communication
CREATE TABLE IF NOT EXISTS "OrderChatMessage" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "sender" TEXT NOT NULL CHECK ("sender" IN ('CUSTOMER', 'DRIVER')),
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE "OrderChatMessage" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read chat for their orders" ON "OrderChatMessage"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Order"
      WHERE "Order".id = "OrderChatMessage"."orderId"
      AND (
        "Order"."userId" = auth.uid()::text 
        OR EXISTS (
            SELECT 1 FROM "Driver" 
            WHERE "Driver".id = "Order"."driverId"
            AND "Driver"."userId" = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Users can send messages" ON "OrderChatMessage"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Order"
      WHERE "Order".id = "OrderChatMessage"."orderId"
      AND (
        "Order"."userId" = auth.uid()::text 
        OR EXISTS (
            SELECT 1 FROM "Driver" 
            WHERE "Driver".id = "Order"."driverId"
            AND "Driver"."userId" = auth.uid()::text
        )
      )
    )
  );

-- Enable Realtime for OrderChatMessage
BEGIN;
ALTER PUBLICATION supabase_realtime ADD TABLE "OrderChatMessage";
COMMIT;
