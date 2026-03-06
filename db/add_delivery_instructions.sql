-- Migration: Add delivery instructions to Order table
-- Run this in the Supabase SQL Editor (https://app.supabase.com → SQL Editor)

ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "deliveryInstructions" TEXT;

COMMENT ON COLUMN "Order"."deliveryInstructions" IS 'Customer delivery notes (e.g., Leave at door, Gate code 1234)';
