import { supabase } from '@/lib/supabase';
import type { Track, TrackWithAlbum } from '@/types/database';

export const TracksService = {
  async getById(trackId: string): Promise<TrackWithAlbum | null> {
    const { data } = await supabase
      .from('tracks')
      .select('*, albums(*)')
      .eq('id', trackId)
      .single();
    return (data as TrackWithAlbum) ?? null;
  },

  /** Full-text search across title and artist */
  async search(query: string): Promise<Track[]> {
    const { data, error } = await supabase
      .from('tracks')
      .select()
      .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
      .order('title')
      .limit(30);
    if (error) throw error;
    return data ?? [];
  },

  /** All tracks uploaded by a user, newest first */
  async getByUser(userId: string): Promise<TrackWithAlbum[]> {
    const { data, error } = await supabase
      .from('tracks')
      .select('*, albums(*)')
      .eq('uploaded_by', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as TrackWithAlbum[];
  },

  /** Recently added tracks across all users */
  async getRecent(limit = 20): Promise<TrackWithAlbum[]> {
    const { data, error } = await supabase
      .from('tracks')
      .select('*, albums(*)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as TrackWithAlbum[];
  },
};
