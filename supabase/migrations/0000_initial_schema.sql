
-- Create forms table
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published BOOLEAN DEFAULT FALSE,
  public_url TEXT
);

-- Create questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('short_text', 'multiple_choice', 'dropdown')),
  required BOOLEAN DEFAULT FALSE,
  order_number INTEGER NOT NULL,
  options JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create responses table
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  response_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Public access policies for published forms
CREATE POLICY "Public can view published forms" ON forms
  FOR SELECT USING (published = TRUE);

CREATE POLICY "Public can view questions for published forms" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.published = TRUE
    )
  );

CREATE POLICY "Public can insert responses to published forms" ON responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms WHERE forms.id = responses.form_id AND forms.published = TRUE
    )
  );

-- Create function to generate public URL
CREATE OR REPLACE FUNCTION generate_public_url()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.published = TRUE AND (NEW.public_url IS NULL OR NEW.public_url = '') THEN
    NEW.public_url = encode(gen_random_bytes(8), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to generate public URL when form is published
CREATE TRIGGER generate_public_url_trigger
BEFORE INSERT OR UPDATE ON forms
FOR EACH ROW
EXECUTE FUNCTION generate_public_url();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at timestamp
CREATE TRIGGER update_forms_updated_at
BEFORE UPDATE ON forms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
BEFORE UPDATE ON questions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();