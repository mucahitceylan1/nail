import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
/** Anon / public API key; newer dashboards may expose this as "Publishable" key. */
const key =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = (): boolean =>
  Boolean(String(url ?? '').trim() && String(key ?? '').trim());

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(String(url).trim(), String(key).trim())
  : null;
