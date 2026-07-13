import { supabase, requireAuth, isValidUUID, sanitizeText } from './client';

// Whitelist of fields allowed for order creation
const ORDER_CREATE_FIELDS = ['client_name', 'items', 'notes', 'status', 'created_by'];

// Whitelist of fields allowed for order updates
const ORDER_UPDATE_FIELDS = ['client_name', 'items', 'notes', 'status', 'delivery_date', 'delivered_by'];

/**
 * Filter an object to only include whitelisted keys.
 * Prevents injection of arbitrary fields into Supabase queries.
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

export const orderService = {
  async getAll() {
    await requireAuth();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .neq('status', 'CANCELLED')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    await requireAuth();
    if (!isValidUUID(id)) {
      throw new Error('ID de pedido inválido.');
    }
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    await requireAuth();
    const safePayload = filterPayload(payload, ORDER_CREATE_FIELDS);

    // Sanitize text fields
    if (safePayload.notes) {
      safePayload.notes = sanitizeText(safePayload.notes);
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([safePayload])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, payload) {
    await requireAuth();
    if (!isValidUUID(id)) {
      throw new Error('ID de pedido inválido.');
    }
    const safePayload = filterPayload(payload, ORDER_UPDATE_FIELDS);

    // Sanitize text fields
    if (safePayload.notes) {
      safePayload.notes = sanitizeText(safePayload.notes);
    }

    const { data, error } = await supabase
      .from('orders')
      .update(safePayload)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async delete(id) {
    await requireAuth();
    if (!isValidUUID(id)) {
      throw new Error('ID de pedido inválido.');
    }
    const { error } = await supabase
      .from('orders')
      .update({ status: 'CANCELLED' })
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  subscribe(callback) {
    return supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
      .subscribe();
  }
};
