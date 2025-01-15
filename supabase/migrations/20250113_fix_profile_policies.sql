-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a more permissive select policy
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
TO authenticated
USING (true);  -- This allows all authenticated users to view profiles

-- Create an insert policy
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Create an update policy
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Create a delete policy
CREATE POLICY "Users can delete own profile"
ON profiles FOR DELETE
TO authenticated
USING (id = auth.uid());

-- Grant necessary permissions to authenticated users
GRANT ALL ON profiles TO authenticated;
