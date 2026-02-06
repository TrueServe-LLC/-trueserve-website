-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Restaurant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MenuItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Driver" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceLocation" ENABLE ROW LEVEL SECURITY;

-- Helper Function to check if user is Admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "User" 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================
-- 1. User Policies
-- ===========================

-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON "User"
  FOR SELECT
  USING (auth.uid() = id);

-- Allow Admins to read all users
CREATE POLICY "Admins can read all data" ON "User"
  FOR ALL
  USING (is_admin());

-- Allow specific read access for relationships (Simple approach: Auth users can read basic info)
-- Note: In a strict system, we'd limit this. For Pilot, allowing read on Users for Auth users is acceptable to ensure relationships (User -> Order) load.
CREATE POLICY "Authenticated users can read basic user info" ON "User"
  FOR SELECT
  USING (auth.role() = 'authenticated'); 

-- Update: Only self or admin
CREATE POLICY "Users can update own data" ON "User"
  FOR UPDATE
  USING (auth.uid() = id);

-- ===========================
-- 2. Restaurant Policies
-- ===========================

-- Public Read
CREATE POLICY "Restaurants are public" ON "Restaurant"
  FOR SELECT
  USING (true);

-- Insert/Update/Delete: Owner or Admin
CREATE POLICY "Owners can manage restaurants" ON "Restaurant"
  FOR ALL
  USING (ownerId = auth.uid() OR is_admin());

-- ===========================
-- 3. MenuItem Policies
-- ===========================

-- Public Read
CREATE POLICY "Menu Items are public" ON "MenuItem"
  FOR SELECT
  USING (true);

-- Manage: Restaurant Owner
CREATE POLICY "Owners can manage menu items" ON "MenuItem"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Restaurant"
      WHERE "Restaurant".id = "MenuItem"."restaurantId"
      AND "Restaurant".ownerId = auth.uid()
    ) 
    OR is_admin()
  );

-- ===========================
-- 4. Driver Policies
-- ===========================

-- Read: Public/Auth
CREATE POLICY "Driver profiles are viewable" ON "Driver"
  FOR SELECT
  USING (true);

-- Manage: Self
CREATE POLICY "Drivers can manage own profile" ON "Driver"
  FOR ALL
  USING (userId = auth.uid() OR is_admin());

-- ===========================
-- 5. Order Policies
-- ===========================

-- Customer can see own orders
CREATE POLICY "Customers can see own orders" ON "Order"
  FOR SELECT
  USING (userId = auth.uid());

-- Merchant can see orders for their restaurant
CREATE POLICY "Merchants can see restaurant orders" ON "Order"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Restaurant"
      WHERE "Restaurant".id = "Order"."restaurantId"
      AND "Restaurant".ownerId = auth.uid()
    )
  );

-- Drivers can see orders assigned to them OR available orders (Pending)? 
-- Drivers need to see orders they are eligible for if we implement a 'marketplace'.
-- For now, let's allow Drivers to see orders assigned to them.
CREATE POLICY "Drivers can see assigned orders" ON "Order"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Driver"
      WHERE "Driver".id = "Order"."driverId"
      AND "Driver".userId = auth.uid()
    )
  );

-- Admins see all
CREATE POLICY "Admins see all orders" ON "Order"
  FOR ALL
  USING (is_admin());

-- CREATE: Authenticated users can create orders (Customers)
CREATE POLICY "Customers can create orders" ON "Order"
  FOR INSERT
  WITH CHECK (auth.uid() = userId);

-- ===========================
-- 6. OrderItem Policies
-- ===========================

-- Determine visibility via Parent Order
CREATE POLICY "Order Items visibility via Order" ON "OrderItem"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "Order"
      WHERE "Order".id = "OrderItem"."orderId"
      AND (
        -- Re-implement Order Logic here or rely on cascading?
        -- RLS policies don't cascade automatically, you must define criteria.
        "Order".userId = auth.uid() -- Customer
        OR EXISTS ( -- Merchant
            SELECT 1 FROM "Restaurant"
            WHERE "Restaurant".id = "Order"."restaurantId"
            AND "Restaurant".ownerId = auth.uid()
        )
        OR EXISTS ( -- Driver
            SELECT 1 FROM "Driver" 
            WHERE "Driver".id = "Order"."driverId"
            AND "Driver".userId = auth.uid()
        )
        OR is_admin()
      )
    )
  );

-- ===========================
-- 7. ServiceLocation Policies
-- ===========================

-- Public Read
CREATE POLICY "Service Locations are public" ON "ServiceLocation"
  FOR SELECT
  USING (true);

-- Admin Write
CREATE POLICY "Admins manage Locations" ON "ServiceLocation"
  FOR ALL
  USING (is_admin());
