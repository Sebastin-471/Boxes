import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../../api/orderService';
import { useToast } from '../../context/ToastContext';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderService.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar pedidos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateOrderStatus = async (id, payload) => {
    try {
      await orderService.update(id, payload);
      // Realtime subscription will handle the UI update
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error al actualizar el estado del pedido.');
    }
  };

  const deleteOrder = async (id) => {
    try {
      await orderService.delete(id);
      toast.success('Pedido eliminado');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Error al eliminar el pedido.');
    }
  };

  useEffect(() => {
    fetchOrders();

    const subscription = orderService.subscribe((payload) => {
      fetchOrders(); // Simple refresh for now, could be optimized
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchOrders]);

  return { 
    orders, 
    setOrders,
    loading, 
    refetch: fetchOrders,
    updateOrderStatus,
    deleteOrder
  };
}
