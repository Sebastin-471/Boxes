import { supabase } from './client';

export const returnService = {
  async getAll() {
    const { data, error } = await supabase
      .from('returns')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('returns')
      .insert([payload])
      .select();
    if (error) throw error;
    return data[0];
  },

  subscribe(callback) {
    return supabase
      .channel('returns-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'returns' }, callback)
      .subscribe();
  }
};
