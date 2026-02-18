
-- Step 1: Add a 'visibility' column to control which restaurants are shown publicly
ALTER TABLE "Restaurant" 
ADD COLUMN IF NOT EXISTS "visibility" TEXT DEFAULT 'VISIBLE';

-- Step 2: Add an 'isMock' flag to explicitly mark test data
ALTER TABLE "Restaurant" 
ADD COLUMN IF NOT EXISTS "isMock" BOOLEAN DEFAULT false;

-- Step 3: Flag existing restaurants (likely your seed data) as mock
-- Be careful! If you have real data mixed in, remove this.
-- UPDATE "Restaurant" SET "isMock" = true, "visibility" = 'HIDDEN';
