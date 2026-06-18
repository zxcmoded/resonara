import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

export type CommentWithProfile = {
  id: string;
  session_id: string;
  user_id: string;
  body: string;
  song_position_seconds: number;
  created_at: string;
  profiles: { username: string; avatar_url: string | null } | null;
};

/**
 * Subscribes to live comments for a session.
 * - Initial load joins profiles for usernames.
 * - Realtime INSERTs enrich the profile inline via a secondary fetch.
 */
export function useCommentsRealtime(sessionId: string | null) {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);

  useEffect(() => {
    if (!sessionId) return;
    setComments([]);

    // Load existing comments with profile info
    supabase
      .from('comments')
      .select('*, profiles(username, avatar_url)')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setComments(data as CommentWithProfile[]);
      });

    // Subscribe to new comments
    const channel = supabase
      .channel(`comments:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `session_id=eq.${sessionId}`,
        },
        async (payload) => {
          const raw = payload.new as CommentWithProfile;
          // Enrich with profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', raw.user_id)
            .single();
          setComments((prev) => [...prev, { ...raw, profiles: profile ?? null }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { comments };
}
