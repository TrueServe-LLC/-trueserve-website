
-- Migration: Add Phone Column to User Table
-- This is necessary for SMS notifications to work.

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "phone" TEXT;

-- Create an index for faster lookups by phone number
CREATE INDEX IF NOT EXISTS "idx_user_phone" ON "User"("phone");
