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
      toast.error('Error al cargar devoluciones: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addReturn = async (payload) => {
    try {
      await returnService.create(payload);
      toast.success('Devolución registrada');
    } catch (error) {
      toast.error('Error al registrar: ' + error.message);
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
