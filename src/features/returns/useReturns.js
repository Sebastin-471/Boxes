import { useState, useEffect, useCallback } from 'react';
import { returnService } from '../../api/returnService';
import { useToast } from '../../context/ToastContext';

export function useReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const data = await returnService.getAll();
      setReturns(data);
    } catch (error) {
      console.error('Error loading returns:', error);
      toast.error('Error al cargar devoluciones. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
    fetchReturns();

    const subscription = returnService.subscribe(() => {
      fetchReturns();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchReturns]);

  return { returns, loading, refetch: fetchReturns, addReturn };
}
