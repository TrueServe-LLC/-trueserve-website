-- Add aiMetadata to Driver table to store scan results
ALTER TABLE "Driver"
ADD COLUMN IF NOT EXISTS "aiMetadata" JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN "Driver"."aiMetadata" IS 'JSON results from Gemini AI document scans (confidence, extracted name, expiry, etc.)';
