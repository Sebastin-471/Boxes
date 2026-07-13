import { supabase, requireAuth, sanitizeText } from './client';

// Whitelist of fields allowed for return creation
const RETURN_CREATE_FIELDS = ['client_name', 'items', 'notes', 'created_by'];

/**
 * Filter an object to only include whitelisted keys.
 */
function filterPayload(payload, allowedFields) {
  const filtered = {};
  for (const key of allowedFields) {
    if (key in payload) {
      filtered[key] = payload[key];
    }
  }
  return filtered;
}

export const returnService = {
  async getAll() {
    await requireAuth();
    const { data, error } = await supabase
      .from('returns')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(payload) {
    await requireAuth();
    const safePayload = filterPayload(payload, RETURN_CREATE_FIELDS);

    // Sanitize text fields
    if (safePayload.notes) {
      safePayload.notes = sanitizeText(safePayload.notes);
    }

    const { data, error } = await supabase
      .from('returns')
      .insert([safePayload])
      .select();
    if (error) throw error;
    return data[0];
  },

  subscribe(callback) {
    return supabase
      .channel('returns-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'returns' }, callback)
      .subscribe();
  }
};
