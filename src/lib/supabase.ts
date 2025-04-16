
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('Please check your .env.local file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

// Create Supabase client with minimal configuration for public access
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log connection status on load
(async () => {
  try {
    const { data, error } = await supabase.from('forms').select('count').limit(1).single();
    if (error) {
      console.error('Supabase connection test failed:', error.message);
    } else {
      console.log('Supabase connection successful');
    }
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
  }
})();

// Type definitions
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

// Error handling helper
export const handleSupabaseError = (error: any): string => {
  console.error('Supabase error:', error);
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    if ('message' in error) return error.message as string;
    if ('error_description' in error) return error.error_description as string;
    if ('details' in error) return error.details as string;
  }
  
  return 'An unknown error occurred';
};