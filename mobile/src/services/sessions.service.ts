import { supabase } from '@/lib/supabase';
import type { Session, Track } from '@/types/database';

export type FeedSession = Session & {
  profiles: { username: string; avatar_url: string | null };
  tracks: Track | null;
};

export const SessionsService = {
  /** Create or replace the host's active session */
  async upsert(hostId: string, trackId: string, positionMs = 0, isPlaying = true): Promise<Session> {
    const { data, error } = await supabase
      .from('sessions')
      .upsert(
        { host_id: hostId, track_id: trackId, position_ms: positionMs, is_playing: isPlaying },
        { onConflict: 'host_id' }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Update playback state for an existing session */
  async update(sessionId: string, patch: { position_ms?: number; is_playing?: boolean; track_id?: string }) {
    const { error } = await supabase
      .from('sessions')
      .update(patch)
      .eq('id', sessionId);
    if (error) throw error;
  },

  /** Fetch a session by ID with track + host profile */
  async getById(sessionId: string): Promise<FeedSession | null> {
    const { data } = await supabase
      .from('sessions')
      .select('*, profiles!sessions_host_id_fkey(username, avatar_url), tracks(*)')
      .eq('id', sessionId)
      .single();
    return data ? (data as FeedSession) : null;
  },

  /** Fetch active sessions from accounts a user follows, with track + profile info */
  async getFollowingFeed(userId: string): Promise<FeedSession[]> {
    // Step 1: resolve following IDs to a plain array (supabase-js .in() doesn't accept subqueries)
    const { data: followRows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    const followingIds = followRows?.map((r) => r.following_id) ?? [];
    if (followingIds.length === 0) return [];

    // Step 2: fetch sessions for those hosts
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        profiles!sessions_host_id_fkey ( username, avatar_url ),
        tracks ( * )
      `)
      .in('host_id', followingIds)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as FeedSession[];
  },

  /** End the host's session */
  async end(sessionId: string) {
    const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
    if (error) throw error;
  },

  /** Broadcast a playback control event (Realtime broadcast, bypasses DB — sub-50ms) */
  broadcastControl(
    sessionId: string,
    payload: { type: 'play' | 'pause' | 'seek' | 'skip'; position_ms?: number; track_id?: string }
  ) {
    const channel = supabase.channel(`session:${sessionId}`);
    channel.send({ type: 'broadcast', event: 'control', payload });
  },
};

/** Map a FeedSession to the player's Track type */
export function sessionToPlayerTrack(session: FeedSession) {
  const t = session.tracks;
  return {
    id: session.track_id ?? '',
    title: t?.title ?? 'Unknown track',
    artist: t?.artist ?? 'Unknown artist',
    album: t?.album ?? '',
    artworkUrl: t?.artwork_url ?? null,
    progressSec: Math.floor(session.position_ms / 1000),
    durationSec: Math.floor((t?.duration_ms ?? 0) / 1000),
    queue: [] as string[],
  };
}
