import { useEffect } from 'react';
import useSWR from 'swr';
import { returnService } from '../../api/returnService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export function useReturns() {
  const { user } = useAuth();
  const toast = useToast();

  const { data: returns = [], isLoading: loading, mutate: refetch } = useSWR(
    user ? 'returns' : null,
    async () => await returnService.getAll(),
    {
      onError: (error) => {
        console.error('Error loading returns:', error);
        toast.error('Error al cargar devoluciones. Verifica tu conexión e intenta de nuevo.');
      }
    }
  );

  const addReturn = async (payload) => {
    try {
      await returnService.create(payload);
      toast.success('Devolución registrada');
    } catch (error) {
      console.error('Error registering return:', error);
      toast.error('Error al registrar la devolución.');
    }
  };

  useEffect(() => {
    if (!user) return;
    
    const subscription = returnService.subscribe(() => {
      refetch();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refetch, user]);

  return { returns, loading, refetch, addReturn };
}
