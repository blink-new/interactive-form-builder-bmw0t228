
-- Add RLS policies for anonymous access to forms and questions tables

-- Allow anonymous users to insert forms
CREATE POLICY "Allow anonymous insert to forms" ON forms
  FOR INSERT WITH CHECK (true);

-- Allow anonymous users to update forms
CREATE POLICY "Allow anonymous update to forms" ON forms
  FOR UPDATE USING (true) WITH CHECK (true);

-- Allow anonymous users to select all forms (including unpublished)
CREATE POLICY "Allow anonymous select from forms" ON forms
  FOR SELECT USING (true);

-- Allow anonymous users to insert questions
CREATE POLICY "Allow anonymous insert to questions" ON questions
  FOR INSERT WITH CHECK (true);

-- Allow anonymous users to update questions
CREATE POLICY "Allow anonymous update to questions" ON questions
  FOR UPDATE USING (true) WITH CHECK (true);

-- Allow anonymous users to select all questions
CREATE POLICY "Allow anonymous select from questions" ON questions
  FOR SELECT USING (true);

-- Allow anonymous users to delete questions
CREATE POLICY "Allow anonymous delete from questions" ON questions
  FOR DELETE USING (true);