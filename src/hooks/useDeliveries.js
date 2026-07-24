import { useEffect } from 'react';
import useSWR from 'swr';
import { deliveryService } from '../api/deliveryService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export function useDeliveries() {
  const { user } = useAuth();
  const toast = useToast();

  const { data: deliveries = [], isLoading: loading, mutate: refetch } = useSWR(
    user ? 'deliveries' : null,
    async () => await deliveryService.getAll(),
    {
      onError: (error) => {
        console.error('Error fetching deliveries:', error);
        toast.error('Error al cargar despachos. Verifica tu conexión e intenta de nuevo.');
      }
    }
  );

  useEffect(() => {
    if (!user) return;

    const subscription = deliveryService.subscribe(() => {
      refetch();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refetch, user]);

  return { deliveries, loading, refetch };
}
