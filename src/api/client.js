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
let sessionPromise = null;

export async function requireAuth() {
  // Reuse the promise if there's already a session check in flight
  if (!sessionPromise) {
    sessionPromise = supabase.auth.getSession().finally(() => {
      sessionPromise = null;
    });
  }
  
  const { data, error } = await sessionPromise;
  
  if (error || !data.session) {
    throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
  }
  return data.session;
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

/**
 * Standardized Application Error
 */
export class AppError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * Parses raw Supabase exceptions into human-readable AppErrors
 */
export function handleServiceError(error, contextMessage) {
  // Check if it's already an AppError (e.g. from requireAuth)
  if (error instanceof AppError) throw error;
  if (error.message === 'Sesión expirada. Por favor, inicia sesión de nuevo.') {
    throw new AppError(error.message, 'AUTH_EXPIRED', error);
  }

  console.error(`[ServiceError] ${contextMessage}:`, error);

  // Supabase/PostgREST network errors
  if (error.message === 'Failed to fetch') {
    throw new AppError('No hay conexión al servidor. Revisa tu internet.', 'NETWORK_ERROR', error);
  }

  // Row Level Security (RLS) violations
  if (error.code === '42501') {
    throw new AppError('No tienes permisos para realizar esta acción.', 'FORBIDDEN', error);
  }
  
  // Generic fallback preserving context
  throw new AppError(`${contextMessage}. Intenta de nuevo más tarde.`, 'UNKNOWN_DB_ERROR', error);
}
