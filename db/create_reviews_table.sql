-- Create Review Table
CREATE TABLE IF NOT EXISTS "Review" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
  "driverId" TEXT NOT NULL REFERENCES "Driver"("id") ON DELETE CASCADE,
  "customerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  "comment" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Customers can create reviews for their own orders
CREATE POLICY "Customers can create reviews" ON "Review"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "customerId");

-- 2. Drivers can read reviews about themselves
CREATE POLICY "Drivers can read their reviews" ON "Review"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Driver"
      WHERE "Driver".id = "driverId"
      AND "Driver"."userId" = auth.uid()::text
    )
  );

-- 3. Customers can read reviews they created
CREATE POLICY "Customers can read own reviews" ON "Review"
  FOR SELECT
  USING (auth.uid()::text = "customerId");

-- 4. Admins can read all reviews
CREATE POLICY "Admins can read all reviews" ON "Review"
  FOR ALL
  USING (is_admin());
