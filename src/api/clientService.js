import { supabase, requireAuth, sanitizeText } from './client';

export const clientService = {
  async getAll() {
    await requireAuth();
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(name) {
    await requireAuth();

    // Sanitize the client name before inserting
    const safeName = sanitizeText(name);
    if (!safeName || safeName.length < 2 || safeName.length > 100) {
      throw new Error('El nombre del cliente debe tener entre 2 y 100 caracteres.');
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([{ name: safeName }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getByName(name) {
    await requireAuth();

    const safeName = sanitizeText(name);
    if (!safeName) {
      throw new Error('Nombre de cliente inválido.');
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('name', safeName)
      .maybeSingle();
    if (error) throw error;
    return data;
  }
};
