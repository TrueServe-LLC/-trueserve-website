-- Allow the service_role to insert/update into the User table freely.
-- This is needed so server-side admin operations (test setup, triggers, etc.)
-- can create User records without being blocked by the user-scoped RLS policy.

CREATE POLICY "Service role can manage users" ON "User"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
