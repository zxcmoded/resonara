import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

// expo-av is not available in Expo Go — load it dynamically so the app
// still runs without audio when the native module is missing.
type AVSound = {
  unloadAsync: () => Promise<void>;
  pauseAsync: () => Promise<void>;
  playAsync: () => Promise<void>;
  setPositionAsync: (ms: number) => Promise<void>;
};

let _audioAvailable: boolean | null = null;

async function getAudio(): Promise<typeof import('expo-av').Audio | null> {
  if (_audioAvailable === false) return null;
  try {
    const mod = await import('expo-av');
    _audioAvailable = true;
    return mod.Audio;
  } catch {
    _audioAvailable = false;
    return null;
  }
}

export type Track = {
  id: string;
  title: string;
  artist: string;
  artistVerified?: boolean;
  album: string;
  albumArtist?: string;
  artworkUrl?: string | null;
  audioUrl?: string | null;
  progressSec: number;
  durationSec: number;
  queue: string[];
};

type PlayerContextType = {
  currentTrack: Track | null;
  sessionId: string | null;
  isPlaying: boolean;
  progressSec: number;
  durationSec: number;
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
  const soundRef = useRef<AVSound | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressSec, setProgressSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [showNowPlaying, setShowNowPlaying] = useState(false);

  // Configure audio session (no-op if expo-av is unavailable)
  useEffect(() => {
    getAudio().then((Audio) => {
      if (!Audio) return;
      Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      }).catch(() => {});
    });
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  async function play(track: Track, sid: string | null = null) {
    if (soundRef.current) {
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }

    setCurrentTrack(track);
    setSessionId(sid);
    setProgressSec(track.progressSec);
    setDurationSec(track.durationSec);

    if (!track.audioUrl) {
      setIsPlaying(false);
      return;
    }

    const Audio = await getAudio();
    if (!Audio) {
      // expo-av not available (Expo Go) — show UI without audio
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
        (status: any) => {
          if (!status.isLoaded) return;
          setProgressSec(Math.floor(status.positionMillis / 1000));
          setDurationSec(Math.floor((status.durationMillis ?? 0) / 1000));
          setIsPlaying(status.isPlaying);
        }
      );
      soundRef.current = sound as unknown as AVSound;
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
      await soundRef.current.pauseAsync().catch(() => {});
    } else {
      await soundRef.current.playAsync().catch(() => {});
    }
  }

  async function seekTo(positionSec: number) {
    setProgressSec(positionSec);
    await soundRef.current?.setPositionAsync(positionSec * 1000).catch(() => {});
  }

  async function stop() {
    await soundRef.current?.unloadAsync().catch(() => {});
    soundRef.current = null;
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
      currentTrack, sessionId, isPlaying, progressSec, durationSec,
      showNowPlaying, play, togglePlay, seekTo, stop, openNowPlaying, closeNowPlaying,
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
