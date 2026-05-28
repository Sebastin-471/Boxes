import { useEffect } from 'react';
import { supabase } from '../api/client';
import { notifyIfBackground, isOwnAction } from '../utils/notificationService';
import { getBoxLabel } from '../utils/boxMapping';

const STATUS_LABELS = {
  'CREATED': 'Pendiente',
  'READY': 'Listo para entregar',
  'DELIVERED': 'Entregado',
  'CANCELLED': 'Desactivado',
};

/**
 * Hook that listens to Supabase Realtime changes on orders and returns,
 * and shows native OS notifications when the app is in the background.
 *
 * Uses WebSocket (Supabase Realtime) — zero polling.
 */
export function useRealtimeNotifications() {
  useEffect(() => {
    // Subscribe to orders table changes
    const ordersChannel = supabase
      .channel('notify-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        // Skip if this was our own action
        if (newRecord?.id && isOwnAction(newRecord.id)) {
          return;
        }

        switch (eventType) {
          case 'INSERT': {
            const items = (newRecord.items || []);
            const totalBoxes = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
            notifyIfBackground(
              '📦 Nuevo pedido',
              `${newRecord.client_name} — ${totalBoxes} cajas`,
              { tag: `order-${newRecord.id}` }
            );
            break;
          }

          case 'UPDATE': {
            const oldStatus = oldRecord?.status;
            const newStatus = newRecord?.status;

            if (oldStatus && newStatus && oldStatus !== newStatus) {
              if (newStatus === 'READY') {
                notifyIfBackground(
                  `✅ Pedido Listo`,
                  `El pedido de ${newRecord.client_name} está listo para entregar.`,
                  { tag: `order-${newRecord.id}` }
                );
              } else if (newStatus === 'DELIVERED') {
                const deliverer = newRecord.delivered_by || 'un repartidor';
                notifyIfBackground(
                  `🚚 Pedido Entregado`,
                  `Entregado a ${newRecord.client_name} por ${deliverer}.`,
                  { tag: `order-${newRecord.id}` }
                );
              }
              // Other statuses (CANCELLED) are intentionally ignored
            }
            break;
          }

          case 'DELETE': {
            // Intentionally ignoring physical DELETEs to reduce notification noise
            break;
          }
        }
      })
      .subscribe();

    // Subscribe to returns table changes
    const returnsChannel = supabase
      .channel('notify-returns')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'returns' }, (payload) => {
        const { new: newRecord } = payload;

        if (newRecord?.id && isOwnAction(newRecord.id)) {
          return;
        }

        const items = (newRecord.items || []);
        const totalBoxes = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
        notifyIfBackground(
          '↩️ Nueva devolución',
          `${newRecord.client_name} devolvió ${totalBoxes} cajas`,
          { tag: `return-${newRecord.id}` }
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(returnsChannel);
    };
  }, []);

  return null;
}
