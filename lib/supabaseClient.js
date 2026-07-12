import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// True once Ido has created the Supabase project and set the env vars (see SETUP_SUPABASE.md).
// Until then the app falls back to the old villa-number + name login with no real security.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Tenants don't have real emails on file, so each villa gets a synthetic Supabase Auth
// account under this fake domain. This lets us reuse Supabase's built-in, battle-tested
// password auth (hashing, sessions, rate limiting) instead of hand-rolling our own.
const VILLA_EMAIL_DOMAIN = 'villa.nofia.internal';

export function villaEmail(villaNumber) {
  return `villa${villaNumber}@${VILLA_EMAIL_DOMAIN}`;
}
