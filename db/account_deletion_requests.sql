CREATE TABLE IF NOT EXISTS public."AccountDeletionRequest" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT REFERENCES public."User"("id") ON DELETE SET NULL,
  "email" TEXT NOT NULL,
  "role" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION'
    CHECK ("status" IN ('PENDING_VERIFICATION', 'PROCESSING', 'COMPLETED', 'REJECTED')),
  "source" TEXT NOT NULL DEFAULT 'WEB',
  "requestedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "completedAt" TIMESTAMPTZ,
  "retentionNotes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_account_deletion_email"
  ON public."AccountDeletionRequest" (LOWER("email"));

CREATE INDEX IF NOT EXISTS "idx_account_deletion_status"
  ON public."AccountDeletionRequest" ("status", "requestedAt");

ALTER TABLE public."AccountDeletionRequest" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages account deletion requests"
  ON public."AccountDeletionRequest";
CREATE POLICY "Service role manages account deletion requests"
  ON public."AccountDeletionRequest"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
