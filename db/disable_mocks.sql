
-- Disable Mock Restaurants
UPDATE "Restaurant" 
SET "isOpen" = false, "visibility" = 'HIDDEN'
WHERE "ownerId" IS NULL OR "isMock" = true;

-- Ensure Production Restaurants are Live
-- Assuming you manually create your partner restaurants, they will be set to visible.
