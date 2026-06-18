import { useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Session } from '@/types/database';

type ControlPayload = {
  type: 'play' | 'pause' | 'seek' | 'skip';
  position_ms?: number;
  track_id?: string;
};

type Options = {
  onControl?: (payload: ControlPayload) => void;
};

/**
 * Subscribes to a Realtime session channel.
 * - Listens for postgres-changes on the `sessions` row (position, is_playing)
 * - Listens for host broadcast control events (play/pause/seek/skip)
 *
 * Returns the latest synced session state.
 */
export function useSessionRealtime(sessionId: string | null, options: Options = {}) {
  const [session, setSession] = useState<Session | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session:${sessionId}`)
      // Live DB row changes (host updates position/is_playing)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          setSession(payload.new as Session);
        }
      )
      // Host broadcast events (faster than DB round-trip)
      .on('broadcast', { event: 'control' }, ({ payload }) => {
        options.onControl?.(payload as ControlPayload);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { session };
}
