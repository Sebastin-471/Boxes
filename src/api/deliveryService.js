import { supabase, requireAuth, isValidUUID, sanitizeText, handleServiceError, AppError } from './client';

// Whitelist of fields allowed for delivery creation
const DELIVERY_CREATE_FIELDS = ['order_id', 'client_name', 'box_type', 'quantity', 'deliverer', 'delivered_at', 'notes', 'created_by'];

// Whitelist of fields allowed for delivery updates
const DELIVERY_UPDATE_FIELDS = ['client_name', 'box_type', 'quantity', 'deliverer', 'delivered_at', 'notes'];

export const DELIVERERS = ['Jimmy', 'Sebastian', 'Luis', 'Mauricio', 'July', 'Recogido por el cliente'];

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

/**
  * Compute delivered quantities per box_type for an order's deliveries.
  * @param {Array} deliveries - Array of delivery records for a single order
  * @returns {Record<string, number>} Map of box_type -> total delivered quantity
  */
export function computeDeliveredByType(deliveries) {
  const result = {};
  (deliveries || []).forEach((d) => {
    result[d.box_type] = (result[d.box_type] || 0) + d.quantity;
  });
  return result;
}

/**
 * Compute remaining quantities per item, given order items and deliveries.
 * @param {Array} items - Order items array [{boxType, quantity}, ...]
 * @param {Array} deliveries - Delivery records for this order
 * @returns {Array} [{boxType, total, delivered, remaining}, ...]
 */
export function computeRemaining(items, deliveries) {
  const deliveredByType = computeDeliveredByType(deliveries);
  return (items || []).map((item) => {
    const code = item.boxType || item.type;
    const delivered = deliveredByType[code] || 0;
    return {
      boxType: code,
      total: item.quantity,
      delivered,
      remaining: item.quantity - delivered,
    };
  });
}

/**
 * Check if an order is fully delivered (all items remaining === 0).
 * @param {Array} items - Order items array
 * @param {Array} deliveries - Delivery records for this order
 * @returns {boolean}
 */
export function isFullyDelivered(items, deliveries) {
  const remaining = computeRemaining(items, deliveries);
  return remaining.length > 0 && remaining.every((r) => r.remaining <= 0);
}

export const deliveryService = {
  async getAll() {
    await requireAuth();
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .order('delivered_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleServiceError(error, 'Error al obtener los despachos');
    }
  },

  async getAllByOrder(orderId) {
    await requireAuth();
    if (!isValidUUID(orderId)) {
      throw new AppError('ID de pedido inválido.', 'VALIDATION_ERROR');
    }
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('order_id', orderId)
        .order('delivered_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleServiceError(error, 'Error al obtener los despachos del pedido');
    }
  },

  async create(payload) {
    await requireAuth();
    const safePayload = filterPayload(payload, DELIVERY_CREATE_FIELDS);

    // Validate required fields
    if (!safePayload.order_id || !isValidUUID(safePayload.order_id)) {
      throw new AppError('ID de pedido inválido.', 'VALIDATION_ERROR');
    }
    if (!safePayload.quantity || safePayload.quantity <= 0) {
      throw new AppError('La cantidad debe ser mayor a 0.', 'VALIDATION_ERROR');
    }
    if (!safePayload.box_type) {
      throw new AppError('El tipo de caja es requerido.', 'VALIDATION_ERROR');
    }
    if (!safePayload.deliverer) {
      throw new AppError('El repartidor es requerido.', 'VALIDATION_ERROR');
    }

    // Sanitize text fields
    if (safePayload.notes) {
      safePayload.notes = sanitizeText(safePayload.notes);
    }
    if (safePayload.client_name) {
      safePayload.client_name = sanitizeText(safePayload.client_name);
    }

    // Default delivered_at to now if not provided
    if (!safePayload.delivered_at) {
      safePayload.delivered_at = new Date().toISOString();
    }

    try {
      const { data, error } = await supabase
        .from('deliveries')
        .insert([safePayload])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleServiceError(error, 'Error al registrar el despacho');
    }
  },

  async createMany(payloads) {
    await requireAuth();
    if (!Array.isArray(payloads) || payloads.length === 0) return [];
    
    const safePayloads = payloads.map(payload => {
      const safe = filterPayload(payload, DELIVERY_CREATE_FIELDS);
      if (!safe.order_id || !isValidUUID(safe.order_id)) throw new AppError('ID de pedido inválido.', 'VALIDATION_ERROR');
      if (!safe.quantity || safe.quantity <= 0) throw new AppError('La cantidad debe ser mayor a 0.', 'VALIDATION_ERROR');
      if (!safe.box_type) throw new AppError('El tipo de caja es requerido.', 'VALIDATION_ERROR');
      if (!safe.deliverer) throw new AppError('El repartidor es requerido.', 'VALIDATION_ERROR');
      if (safe.notes) safe.notes = sanitizeText(safe.notes);
      if (safe.client_name) safe.client_name = sanitizeText(safe.client_name);
      if (!safe.delivered_at) safe.delivered_at = new Date().toISOString();
      return safe;
    });

    try {
      const { data, error } = await supabase
        .from('deliveries')
        .insert(safePayloads)
        .select();
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleServiceError(error, 'Error al registrar los despachos');
    }
  },

  async update(id, payload) {
    await requireAuth();
    if (!isValidUUID(id)) {
      throw new AppError('ID de despacho inválido.', 'VALIDATION_ERROR');
    }
    const safePayload = filterPayload(payload, DELIVERY_UPDATE_FIELDS);

    // Sanitize text fields
    if (safePayload.notes) {
      safePayload.notes = sanitizeText(safePayload.notes);
    }

    try {
      const { data, error } = await supabase
        .from('deliveries')
        .update(safePayload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleServiceError(error, 'Error al actualizar el despacho');
    }
  },

  async delete(id) {
    await requireAuth();
    if (!isValidUUID(id)) {
      throw new AppError('ID de despacho inválido.', 'VALIDATION_ERROR');
    }
    try {
      const { error } = await supabase
        .from('deliveries')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      handleServiceError(error, 'Error al eliminar el despacho');
    }
  },

  subscribe(callback) {
    return supabase
      .channel('deliveries-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, callback)
      .subscribe();
  },
};
