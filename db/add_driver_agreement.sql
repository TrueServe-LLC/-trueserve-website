-- Add Independent Contractor Agreement columns to Driver table
ALTER TABLE "Driver"
ADD COLUMN IF NOT EXISTS "hasSignedAgreement" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "agreementSignedAt" TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN "Driver"."hasSignedAgreement" IS 'Whether the driver signed the Independent Contractor Agreement.';
COMMENT ON COLUMN "Driver"."agreementSignedAt" IS 'The timestamp when the driver signed the agreement.';
