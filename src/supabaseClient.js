import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-supabase-anon-key-here';

if (!isConfigured) {
  console.warn(
    'Supabase no está configurado o tiene valores por defecto. ' +
    'Por favor, edita tu archivo .env en la raíz del proyecto para conectar tu base de datos real.'
  );
}

// Fallback to empty strings if not configured to prevent client construction throw
export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
);

export const isSupabaseConfigured = isConfigured;
