import { supabase, requireAuth, isValidUUID, sanitizeText, handleServiceError, AppError } from './client';

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
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .neq('status', 'CANCELLED')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (error) {
      handleServiceError(error, 'Error al obtener los pedidos');
    }
  },

  async getById(id) {
    await requireAuth();
    if (!isValidUUID(id)) {
      throw new AppError('ID de pedido inválido.', 'VALIDATION_ERROR');
    }
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleServiceError(error, 'Error al obtener el pedido');
    }
  },

  async create(payload) {
    await requireAuth();
    const safePayload = filterPayload(payload, ORDER_CREATE_FIELDS);

    // Sanitize text fields
    if (safePayload.notes) {
      safePayload.notes = sanitizeText(safePayload.notes);
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([safePayload])
        .select();
      if (error) throw error;
      return data[0];
    } catch (error) {
      handleServiceError(error, 'Error al crear el pedido');
    }
  },

  async update(id, payload) {
    await requireAuth();
    if (!isValidUUID(id)) {
      throw new AppError('ID de pedido inválido.', 'VALIDATION_ERROR');
    }
    const safePayload = filterPayload(payload, ORDER_UPDATE_FIELDS);

    // Sanitize text fields
    if (safePayload.notes) {
      safePayload.notes = sanitizeText(safePayload.notes);
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .update(safePayload)
        .eq('id', id)
        .select();
      if (error) throw error;
      return data[0];
    } catch (error) {
      handleServiceError(error, 'Error al actualizar el pedido');
    }
  },

  async delete(id) {
    await requireAuth();
    if (!isValidUUID(id)) {
      throw new AppError('ID de pedido inválido.', 'VALIDATION_ERROR');
    }
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'CANCELLED' })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      handleServiceError(error, 'Error al cancelar el pedido');
    }
  },

  subscribe(callback) {
    return supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
      .subscribe();
  }
};
