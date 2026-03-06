
-- Add vehicle verification columns to Driver table
ALTER TABLE "Driver" 
ADD COLUMN IF NOT EXISTS "insuranceDocumentUrl" TEXT,
ADD COLUMN IF NOT EXISTS "registrationDocumentUrl" TEXT,
ADD COLUMN IF NOT EXISTS "vehicleVerified" BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN "Driver"."insuranceDocumentUrl" IS 'URL to uploaded insurance document';
COMMENT ON COLUMN "Driver"."registrationDocumentUrl" IS 'URL to uploaded registration document';
