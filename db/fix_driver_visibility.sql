
-- 1. Allow Drivers to see available orders (those not yet assigned)
-- This is critical for the "Recommended for You" list to work
DROP POLICY IF EXISTS "Drivers can see available orders" ON "Order";
CREATE POLICY "Drivers can see available orders" ON "Order"
  FOR SELECT
  USING (
    "driverId" IS NULL 
    AND EXISTS (
      SELECT 1 FROM "Driver"
      WHERE "Driver"."userId" = auth.uid()::text
    )
  );

-- 2. Allow Drivers to see items for those available orders 
-- (So they can see what they'd be delivering before accepting)
DROP POLICY IF EXISTS "Drivers can see available order items" ON "OrderItem";
CREATE POLICY "Drivers can see available order items" ON "OrderItem"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Order"
      WHERE "Order".id = "OrderItem"."orderId"
      AND "Order"."driverId" IS NULL
      AND EXISTS (
        SELECT 1 FROM "Driver"
        WHERE "Driver"."userId" = auth.uid()::text
      )
    )
  );

-- 3. Ensure Drivers can update an order to assign themselves to it
-- This allows the 'Accept' button to function correctly
DROP POLICY IF EXISTS "Drivers can accept available orders" ON "Order";
CREATE POLICY "Drivers can accept available orders" ON "Order"
  FOR UPDATE
  USING (
    "driverId" IS NULL 
    AND EXISTS (
      SELECT 1 FROM "Driver"
      WHERE "Driver"."userId" = auth.uid()::text
    )
  )
  WITH CHECK (
    "driverId" = (SELECT id FROM "Driver" WHERE "userId" = auth.uid()::text)
  );
