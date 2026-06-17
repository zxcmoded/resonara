import { createContext, useContext, useState, type ReactNode } from 'react';

export type Track = {
  id: string;
  title: string;
  artist: string;
  artistVerified?: boolean;
  album: string;
  albumArtist?: string;
  progressSec: number;
  durationSec: number;
  queue: string[];
};

export const MOCK_TRACK: Track = {
  id: '1',
  title: "All Too Well (10 Minute Version) (Taylor's Version) [From The Vault]",
  artist: 'Taylor Swift',
  artistVerified: true,
  album: 'Red',
  albumArtist: 'Taylor Swift',
  progressSec: 98,
  durationSec: 613,
  queue: ["Sad Beautiful Tragic (Taylor's Version)", "Holy Ground (Taylor's Version)"],
};

type PlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  showNowPlaying: boolean;
  play: (track: Track) => void;
  togglePlay: () => void;
  openNowPlaying: () => void;
  closeNowPlaying: () => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);

  const play = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlay = () => setIsPlaying((p) => !p);
  const openNowPlaying = () => setShowNowPlaying(true);
  const closeNowPlaying = () => setShowNowPlaying(false);

  return (
    <PlayerContext.Provider value={{ currentTrack, isPlaying, showNowPlaying, play, togglePlay, openNowPlaying, closeNowPlaying }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
