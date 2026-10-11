import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  URL: 'doreminsieme_supabase_url',
  ANON_KEY: 'doreminsieme_supabase_anon_key',
};

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'localStorage' | 'none';
}

/**
 * Retrieves the current Supabase connection configuration from env vars or localStorage.
 */
export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const isPlaceholderUrl = !envUrl || envUrl.includes('your-project-id') || envUrl.includes('example.com');
  const isPlaceholderKey = !envKey || envKey.includes('your-anon-public-key');

  if (envUrl && envKey && !isPlaceholderUrl && !isPlaceholderKey) {
    return {
      url: envUrl.trim(),
      anonKey: envKey.trim(),
      isConfigured: true,
      source: 'env',
    };
  }

  const localUrl = localStorage.getItem(STORAGE_KEYS.URL) || '';
  const localKey = localStorage.getItem(STORAGE_KEYS.ANON_KEY) || '';

  if (localUrl && localKey) {
    return {
      url: localUrl.trim(),
      anonKey: localKey.trim(),
      isConfigured: true,
      source: 'localStorage',
    };
  }

  return {
    url: '',
    anonKey: '',
    isConfigured: false,
    source: 'none',
  };
}

/**
 * Saves Supabase credentials into localStorage.
 */
export function saveSupabaseConfig(url: string, anonKey: string): void {
  const cleanUrl = url.trim().replace(/\/+$/, '');
  const cleanKey = anonKey.trim();
  localStorage.setItem(STORAGE_KEYS.URL, cleanUrl);
  localStorage.setItem(STORAGE_KEYS.ANON_KEY, cleanKey);
  cachedClient = null; // Reset cached client
}

/**
 * Removes custom Supabase credentials from localStorage.
 */
export function clearSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_KEYS.URL);
  localStorage.removeItem(STORAGE_KEYS.ANON_KEY);
  cachedClient = null;
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

/**
 * Returns a configured Supabase client, or null if not yet configured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.isConfigured) return null;

  if (cachedClient && lastUsedUrl === config.url && lastUsedKey === config.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastUsedUrl = config.url;
    lastUsedKey = config.anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Errore inizializzazione client Supabase:', err);
    return null;
  }
}

/**
 * Tests connection with Supabase by querying the academic_years table.
 */
export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig().isConfigured;
}

export async function testSupabaseConnection(
  customUrl?: string,
  customKey?: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const url = customUrl || getSupabaseConfig().url;
    const key = customKey || getSupabaseConfig().anonKey;

    if (!url || !key) {
      return {
        success: false,
        message: 'Credenziali Supabase non configurate',
        error: 'URL o Anon Key mancanti.',
      };
    }

    const testClient = createClient(url, key);
    // Ping academic_years
    const { data, error } = await testClient
      .from('academic_years')
      .select('id')
      .limit(1);

    if (error) {
      // If table doesn't exist yet, it means credentials are valid but tables need to be created
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connessione a Supabase riuscita! Le tabelle non sono ancora state create (esegui lo script SQL).',
        };
      }
      return {
        success: false,
        message: `Errore Supabase: ${error.message}`,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Connessione a Supabase stabilita con successo!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Impossibile connettersi a Supabase',
      error: err?.message || String(err),
    };
  }
}

/**
 * Uploads an enrollment sheet attachment file to Supabase Storage bucket 'registration-sheets'.
 * Returns public URL on success or null.
 */
export async function uploadRegistrationSheetToStorage(
  studentId: string,
  fileObj: { name: string; type: string; dataUrl: string }
): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    // If it's a data URL, convert to Blob
    const response = await fetch(fileObj.dataUrl);
    const blob = await response.blob();

    const fileExt = fileObj.name.split('.').pop() || 'pdf';
    const filePath = `students/${studentId}_${Date.now()}.${fileExt}`;

    const { data, error } = await client.storage
      .from('registration-sheets')
      .upload(filePath, blob, {
        contentType: fileObj.type || 'application/pdf',
        upsert: true,
      });

    if (error) {
      console.warn('Storage upload error, falling back to dataUrl:', error.message);
      return fileObj.dataUrl;
    }

    const { data: publicUrlData } = client.storage
      .from('registration-sheets')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('Failed to upload attachment to Supabase Storage:', err);
    return fileObj.dataUrl;
  }
}

/**
 * Subscribes to real-time postgres changes across the database.
 * Calls onDataChanged callback when any change (INSERT, UPDATE, DELETE) is detected.
 */
export function subscribeToRealtimeChanges(onDataChanged: (table?: string) => void): (() => void) | null {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const channel = client
      .channel('doreminsieme-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          onDataChanged(payload.table);
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.warn('Realtime subscription error:', err);
        }
      });

    return () => {
      try {
        client.removeChannel(channel);
      } catch (e) {
        // Safe channel teardown
      }
    };
  } catch (err) {
    console.warn('Could not establish Supabase realtime subscription:', err);
    return null;
  }
}

