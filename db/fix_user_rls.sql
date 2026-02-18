-- Create a policy to allow inserting a NEW user profile that matches the authenticated ID
CREATE POLICY "Users can insert their own profile" ON "User"
FOR INSERT
WITH CHECK (auth.uid()::text = id);

-- Ensure the update policy is correct
DROP POLICY IF EXISTS "Users can update own data" ON "User";
CREATE POLICY "Users can update own data" ON "User"
FOR UPDATE
USING (auth.uid()::text = id);
