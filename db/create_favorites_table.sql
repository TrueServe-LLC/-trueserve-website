
-- Create Favorite table to allow users to save restaurants
CREATE TABLE IF NOT EXISTS "Favorite" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "restaurantId" UUID NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("userId", "restaurantId")
);

-- Enable RLS
ALTER TABLE "Favorite" ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Users can view their own favorites
CREATE POLICY "Users can view their own favorites" ON "Favorite"
    FOR SELECT USING (auth.uid() = "userId");

-- 2. Users can insert their own favorites
CREATE POLICY "Users can insert their own favorites" ON "Favorite"
    FOR INSERT WITH CHECK (auth.uid() = "userId");

-- 3. Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites" ON "Favorite"
    FOR DELETE USING (auth.uid() = "userId");

-- Index for performance
CREATE INDEX IF NOT EXISTS "idx_favorite_user_id" ON "Favorite"("userId");
CREATE INDEX IF NOT EXISTS "idx_favorite_restaurant_id" ON "Favorite"("restaurantId");
