import { supabase } from '@/lib/supabase';
import type { Comment } from '@/types/database';

export const CommentsService = {
  /** Post a live comment */
  async post(sessionId: string, userId: string, body: string, songPositionSeconds: number): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .insert({ session_id: sessionId, user_id: userId, body, song_position_seconds: songPositionSeconds })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Fetch all comments for a session ordered for replay */
  async getReplay(sessionId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select()
      .eq('session_id', sessionId)
      .order('song_position_seconds', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  /** Delete own comment */
  async delete(commentId: string) {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) throw error;
  },
};
