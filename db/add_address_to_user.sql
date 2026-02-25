-- Add address column to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "address" TEXT;

COMMENT ON COLUMN "User"."address" IS 'Default/Saved address for the user';
