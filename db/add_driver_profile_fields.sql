-- Add profile photo and bio fields to the Driver table
ALTER TABLE "Driver" 
ADD COLUMN IF NOT EXISTS "photoUrl" TEXT,
ADD COLUMN IF NOT EXISTS "aboutMe" TEXT;
