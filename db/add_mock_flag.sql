-- Add isMock column to Restaurant table
ALTER TABLE "Restaurant" 
ADD COLUMN IF NOT EXISTS "isMock" BOOLEAN DEFAULT false;

COMMENT ON COLUMN "Restaurant"."isMock" IS 'Identify mock restaurants that should be hidden in production once real merchants are active';

-- Mark existing restaurants with no owner as mock
UPDATE "Restaurant" SET "isMock" = true WHERE "ownerId" IS NULL;
