import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY requeridas');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const getSupabaseAdmin = () => {
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('VITE_SUPABASE_SERVICE_ROLE_KEY requerido para operaciones admin');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

// Helper para llamar Edge Functions
export const callFunction = async <T>(
  functionName: string,
  body: Record<string, unknown>,
  authToken?: string
): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken || (await supabase.auth.getSession()).data.session?.access_token || ''}`,
  };

  const response = await fetch(
    `${supabaseUrl}/functions/v1/${functionName}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `Error en ${functionName}`);
  }
  
  return data as T;
};

// Helper para subir archivos
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File,
  options?: { contentType?: string }
): Promise<{ path: string; publicUrl: string }> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: options?.contentType || file.type,
      upsert: false,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return { path: data.path, publicUrl };
};

export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const deleteFile = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
};