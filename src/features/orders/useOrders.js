import { useEffect } from 'react';
import useSWR from 'swr';
import { orderService } from '../../api/orderService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export function useOrders() {
  const { user } = useAuth();
  const toast = useToast();

  const { data: orders = [], isLoading: loading, mutate: refetch } = useSWR(
    user ? 'orders' : null,
    async () => await orderService.getAll(),
    {
      onError: (error) => {
        console.error('Error fetching orders:', error);
        toast.error('Error al cargar pedidos. Verifica tu conexión e intenta de nuevo.');
      }
    }
  );

  const updateOrderStatus = async (id, payload) => {
    try {
      await orderService.update(id, payload);
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
    if (!user) return;
    
    const subscription = orderService.subscribe((payload) => {
      refetch(); 
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refetch, user]);

  return { 
    orders, 
    setOrders: (updater) => {
      if (typeof updater === 'function') {
        refetch(updater(orders), { revalidate: false });
      } else {
        refetch(updater, { revalidate: false });
      }
    },
    loading, 
    refetch,
    updateOrderStatus,
    deleteOrder
  };
}
