import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database';

export const ProfilesService = {
  async getById(userId: string): Promise<Profile | null> {
    const { data } = await supabase.from('profiles').select().eq('id', userId).single();
    return data ?? null;
  },

  async update(userId: string, patch: { username?: string; full_name?: string; avatar_url?: string }) {
    const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
    if (error) throw error;
  },

  async search(query: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select()
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(20);
    if (error) throw error;
    return data ?? [];
  },
};
