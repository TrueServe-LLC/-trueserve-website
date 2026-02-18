
-- Create a table for global system settings
CREATE TABLE IF NOT EXISTS "SystemSettings" (
    "key" TEXT PRIMARY KEY,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default ordering status (OPEN)
INSERT INTO "SystemSettings" ("key", "value")
VALUES ('ordering_enabled', 'true'::jsonb)
ON CONFLICT ("key") DO NOTHING;

-- RLS: Only admins can update, everyone can read
ALTER TABLE "SystemSettings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
ON "SystemSettings"
FOR SELECT
USING (true);

CREATE POLICY "Allow admin update access"
ON "SystemSettings"
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'role' = 'ADMIN');
