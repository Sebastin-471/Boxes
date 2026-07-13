import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables exist at startup
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Verify that the user has an active authenticated session.
 * Call this before any data-mutating operation (insert, update, delete).
 * Throws an error if no session is found, preventing unauthenticated DB calls.
 */
export async function requireAuth() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
  }
  return session;
}

/**
 * Validate that a value looks like a valid UUID (v4).
 * Prevents arbitrary string injection into .eq('id', ...) queries.
 */
export function isValidUUID(value) {
  if (typeof value !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Strip HTML tags and control characters from a string.
 * Use this to sanitize free-text fields before sending to the database.
 */
export function sanitizeText(value) {
  if (value === null || value === undefined) return null;
  return String(value)
    .replace(/<[^>]*>/g, '')           // Strip HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Strip control chars (keep \n, \r, \t)
    .trim();
}
