
-- Create tables with proper structure for public access

-- Drop tables if they exist to ensure clean setup
DROP TABLE IF EXISTS responses CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS forms CASCADE;

-- Create forms table
CREATE TABLE forms (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published BOOLEAN DEFAULT FALSE,
  public_url TEXT
);

-- Create questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  required BOOLEAN DEFAULT FALSE,
  order_number INTEGER NOT NULL,
  options TEXT[] DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create responses table
CREATE TABLE responses (
  id UUID PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  response_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security but with public access policies
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Create public access policies
CREATE POLICY "Public forms access" ON forms FOR ALL USING (true);
CREATE POLICY "Public questions access" ON questions FOR ALL USING (true);
CREATE POLICY "Public responses access" ON responses FOR ALL USING (true);