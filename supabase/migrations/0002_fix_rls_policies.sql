
-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Allow anonymous insert to forms" ON forms;
DROP POLICY IF EXISTS "Allow anonymous update to forms" ON forms;
DROP POLICY IF EXISTS "Allow anonymous select from forms" ON forms;
DROP POLICY IF EXISTS "Allow anonymous insert to questions" ON questions;
DROP POLICY IF EXISTS "Allow anonymous update to questions" ON questions;
DROP POLICY IF EXISTS "Allow anonymous select from questions" ON questions;
DROP POLICY IF EXISTS "Allow anonymous delete from questions" ON questions;
DROP POLICY IF EXISTS "Public can view published forms" ON forms;
DROP POLICY IF EXISTS "Public can view questions for published forms" ON questions;
DROP POLICY IF EXISTS "Public can insert responses to published forms" ON responses;

-- Create more permissive policies for development
-- In production, you would want to restrict these based on user authentication

-- Forms table policies
CREATE POLICY "Enable all operations for all users" ON forms
  FOR ALL USING (true) WITH CHECK (true);

-- Questions table policies
CREATE POLICY "Enable all operations for all users" ON questions
  FOR ALL USING (true) WITH CHECK (true);

-- Responses table policies
CREATE POLICY "Enable all operations for all users" ON responses
  FOR ALL USING (true) WITH CHECK (true);