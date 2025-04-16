
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Form = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  published: boolean;
  public_url: string | null;
};

export type Question = {
  id: string;
  form_id: string;
  question_text: string;
  question_type: 'short_text' | 'multiple_choice' | 'dropdown';
  required: boolean;
  order_number: number;
  options: string[] | null;
  created_at: string;
  updated_at: string;
};

export type Response = {
  id: string;
  form_id: string;
  response_data: Record<string, any>;
  created_at: string;
};

export type FormWithQuestions = Form & {
  questions: Question[];
};