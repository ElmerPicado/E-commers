import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const lines = env.split('\n');
let supabaseUrl = '';
let supabaseAnonKey = '';

for (const line of lines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].trim();
  }
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
    supabaseAnonKey = line.split('=')[1].trim();
  }
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  try {
    // Search devotional_authors
    const { data: authors, error: authErr } = await supabase
      .from('devotional_authors')
      .select('*')
      .eq('email', 'pasteleriamanar4imr4@gmail.com');
    console.log('devotional_authors matches:', authors || authErr);

    // Search contact_forms
    const { data: contact, error: contactErr } = await supabase
      .from('contact_forms')
      .select('*');
    console.log('contact_forms count:', contact ? contact.length : contactErr);

    // Search admin_users again for case insensitive
    const { data: admins, error: adminErr } = await supabase
      .from('admin_users')
      .select('*');
    console.log('All admin users:', admins);

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

run();
