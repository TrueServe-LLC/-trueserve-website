-- Add avatar columns to the User table
ALTER TABLE "public"."User" 
ADD COLUMN IF NOT EXISTS "avatarUrl" text,
ADD COLUMN IF NOT EXISTS "avatarColor" text;
