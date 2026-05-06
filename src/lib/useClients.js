import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

export function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      setClients(data || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addClient = async (name) => {
    if (!name || typeof name !== 'string') return null;
    const cleanName = name.trim();
    if (!cleanName) return null;

    try {
      // Check if already exists in local state to avoid unnecessary DB calls
      const existing = clients.find(c => c.name.toLowerCase() === cleanName.toLowerCase());
      if (existing) return existing;

      const { data, error: insertError } = await supabase
        .from('clients')
        .insert([{ name: cleanName }])
        .select()
        .single();

      if (insertError) {
        // If it failed because it already exists (concurrency), just fetch again
        if (insertError.code === '23505') {
          await fetchClients();
          return clients.find(c => c.name.toLowerCase() === cleanName.toLowerCase());
        }
        throw insertError;
      }

      setClients(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return data;
    } catch (err) {
      console.error('Error adding client:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    error,
    refreshClients: fetchClients,
    addClient
  };
}
