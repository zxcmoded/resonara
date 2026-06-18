import { Audio, type AVPlaybackStatus } from 'expo-av';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

export type Track = {
  id: string;
  title: string;
  artist: string;
  artistVerified?: boolean;
  album: string;
  albumArtist?: string;
  artworkUrl?: string | null;
  audioUrl?: string | null;      // Supabase Storage URL — required for local playback
  progressSec: number;           // Initial seek position (used for session sync)
  durationSec: number;           // Expected duration (overridden by actual audio length)
  queue: string[];
};

type PlayerContextType = {
  currentTrack: Track | null;
  sessionId: string | null;
  isPlaying: boolean;
  progressSec: number;           // Live position from expo-av
  durationSec: number;           // Actual duration from expo-av
  showNowPlaying: boolean;
  play: (track: Track, sessionId?: string | null) => Promise<void>;
  togglePlay: () => Promise<void>;
  seekTo: (positionSec: number) => Promise<void>;
  stop: () => Promise<void>;
  openNowPlaying: () => void;
  closeNowPlaying: () => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const soundRef = useRef<Audio.Sound | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressSec, setProgressSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [showNowPlaying, setShowNowPlaying] = useState(false);

  // Configure audio session for background playback on iOS
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  function onPlaybackStatus(status: AVPlaybackStatus) {
    if (!status.isLoaded) return;
    setProgressSec(Math.floor(status.positionMillis / 1000));
    setDurationSec(Math.floor((status.durationMillis ?? 0) / 1000));
    setIsPlaying(status.isPlaying);
  }

  async function play(track: Track, sid: string | null = null) {
    // Unload previous sound
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    setCurrentTrack(track);
    setSessionId(sid);
    setProgressSec(track.progressSec);
    setDurationSec(track.durationSec);

    if (!track.audioUrl) {
      // No local audio (e.g. viewing a friend's session without the file) — show UI only
      setIsPlaying(false);
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.audioUrl },
        {
          shouldPlay: true,
          positionMillis: track.progressSec * 1000,
          progressUpdateIntervalMillis: 500,
        },
        onPlaybackStatus
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } catch (err) {
      console.error('Audio load failed:', err);
      setIsPlaying(false);
    }
  }

  async function togglePlay() {
    if (!soundRef.current) {
      setIsPlaying((p) => !p);
      return;
    }
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  }

  async function seekTo(positionSec: number) {
    setProgressSec(positionSec);
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(positionSec * 1000);
    }
  }

  async function stop() {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setCurrentTrack(null);
    setSessionId(null);
    setIsPlaying(false);
    setProgressSec(0);
    setDurationSec(0);
    setShowNowPlaying(false);
  }

  const openNowPlaying = () => setShowNowPlaying(true);
  const closeNowPlaying = () => setShowNowPlaying(false);

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      sessionId,
      isPlaying,
      progressSec,
      durationSec,
      showNowPlaying,
      play,
      togglePlay,
      seekTo,
      stop,
      openNowPlaying,
      closeNowPlaying,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
