-- Keeps the Restaurant table aligned with the merchant signup form.
-- Safe to run multiple times in Supabase SQL editor.

ALTER TABLE public."Restaurant"
  ADD COLUMN IF NOT EXISTS "cuisineType" TEXT,
  ADD COLUMN IF NOT EXISTS "phone" TEXT,
  ADD COLUMN IF NOT EXISTS "plan" TEXT,
  ADD COLUMN IF NOT EXISTS "posSystem" TEXT,
  ADD COLUMN IF NOT EXISTS "posClientId" TEXT,
  ADD COLUMN IF NOT EXISTS "posClientSecret" TEXT,
  ADD COLUMN IF NOT EXISTS "ghlUrl" TEXT;
