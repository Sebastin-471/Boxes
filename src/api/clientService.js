import { supabase } from './client';

export const clientService = {
  async getAll() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(name) {
    const { data, error } = await supabase
      .from('clients')
      .insert([{ name }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getByName(name) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('name', name)
      .maybeSingle();
    if (error) throw error;
    return data;
  }
};
