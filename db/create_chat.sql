CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "sender" TEXT NOT NULL CHECK ("sender" IN ('CUSTOMER', 'DRIVER')),
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE "ChatMessage" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read chat for their orders" ON "ChatMessage"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Order"
      WHERE "Order".id = "ChatMessage"."orderId"
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

CREATE POLICY "Users can send messages" ON "ChatMessage"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Order"
      WHERE "Order".id = "ChatMessage"."orderId"
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
