import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ResonaraTheme } from '@/constants/theme';
import { ListenTogetherView } from '@/components/listen-together-view';
import { usePlayer, MOCK_TRACK as PLAYER_TRACK } from '@/context/player';

export type MockTrack = {
  artist: { name: string; verified: boolean };
  album: string;
  albumArtist: string;
  trackTitle: string;
  progressSec: number;
  durationSec: number;
  queue: string[];
};

const MOCK_TRACK: MockTrack = {
  artist: { name: 'Taylor Swift', verified: true },
  album: 'Red',
  albumArtist: 'Taylor Swift',
  trackTitle: "All Too Well (10 Minute Version) (Taylor's Version) [From The Vault]",
  progressSec: 98,
  durationSec: 613,
  queue: ["Sad Beautiful Tragic (Taylor's Version)"],
};

type SubTab = 'friends' | 'following' | 'topArtists';

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'friends', label: 'Friends' },
  { id: 'following', label: 'Following' },
  { id: 'topArtists', label: 'Top Artists' },
];

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function ActivityCard({ track, onListenTogether, onPlay }: { track: MockTrack; onListenTogether: () => void; onPlay: () => void }) {
  const progressPercent = (track.progressSec / track.durationSec) * 100;

  return (
    <View style={styles.card}>
      {/* Artist header */}
      <View style={styles.artistRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitials}>TS</Text>
        </View>
        <View style={styles.artistInfo}>
          <View style={styles.artistNameRow}>
            <Text style={styles.artistName}>{track.artist.name}</Text>
            {track.artist.verified && (
              <SymbolView name="checkmark.seal.fill" size={15} tintColor={ResonaraTheme.verified} />
            )}
          </View>
          <Text style={styles.listeningTo}>
            Now listening to:{' '}
            <Text style={styles.listeningToLink}>{track.album}</Text>
            {' '}by{' '}
            <Text style={styles.listeningToLink}>{track.albumArtist}</Text>
          </Text>
        </View>
      </View>

      {/* Album art — tap to open Now Playing */}
      <Pressable style={styles.albumArt as any} onPress={onPlay}>
        <View style={styles.albumGradient as any} />
        <View style={styles.albumTextOverlay}>
          <Text style={styles.albumTitleText}>RED</Text>
          <Text style={styles.albumArtistText}>TAYLOR SWIFT</Text>
        </View>
      </Pressable>

      {/* Track info */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={2}>{track.trackTitle}</Text>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <View style={styles.progressTimes}>
            <Text style={styles.progressTime}>{formatTime(track.progressSec)}</Text>
            <Text style={styles.progressTime}>{formatTime(track.durationSec)}</Text>
          </View>
        </View>

        {/* Listen Together button */}
        <Pressable style={styles.listenTogetherButton} onPress={onListenTogether}>
          <Text style={styles.listenTogetherText}>Listen Together</Text>
        </Pressable>

        {/* Queue */}
        {track.queue.map((song, i) => (
          <View key={i} style={styles.queueRow}>
            <SymbolView name="text.justify" size={14} tintColor={ResonaraTheme.textSecondary} />
            <Text style={styles.queueSong} numberOfLines={1}>{song}</Text>
          </View>
        ))}

        <View style={styles.queueRow}>
          <SymbolView name="plus.circle" size={14} tintColor={ResonaraTheme.textSecondary} />
          <Text style={styles.queueSong}>Add song to playlist</Text>
        </View>
      </View>
    </View>
  );
}

interface Props {
  bottomInset: number;
}

export function TimelineFeed({ bottomInset }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('following');
  const [showListenTogether, setShowListenTogether] = useState(false);
  const insets = useSafeAreaInsets();
  const { play, openNowPlaying } = usePlayer();

  const handlePlay = () => {
    play(PLAYER_TRACK);
    openNowPlaying();
  };

  if (showListenTogether) {
    return (
      <ListenTogetherView
        track={PLAYER_TRACK}
        onBack={() => setShowListenTogether(false)}
        bottomInset={bottomInset}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Sub-tabs */}
      <View style={[styles.subTabBar, { paddingTop: insets.top }]}>
        {SUB_TABS.map((tab) => {
          const isActive = subTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={styles.subTab}
              onPress={() => setSubTab(tab.id)}>
              <Text style={[styles.subTabText, isActive && styles.subTabTextActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.subTabIndicator} />}
            </Pressable>
          );
        })}
      </View>

      {/* Feed */}
      <ScrollView
        style={styles.feed}
        contentContainerStyle={{ paddingBottom: bottomInset }}
        showsVerticalScrollIndicator={false}>
        {subTab === 'following' && (
          <ActivityCard
            track={MOCK_TRACK}
            onPlay={handlePlay}
            onListenTogether={() => setShowListenTogether(true)}
          />
        )}
        {subTab === 'friends' && (
          <View style={styles.emptyState}>
            <SymbolView name="person.2" size={40} tintColor={ResonaraTheme.textMuted} />
            <Text style={styles.emptyText}>No friends activity yet</Text>
            <Text style={styles.emptySubText}>Follow your friends to see what they're listening to</Text>
          </View>
        )}
        {subTab === 'topArtists' && (
          <View style={styles.emptyState}>
            <SymbolView name="music.mic" size={40} tintColor={ResonaraTheme.textMuted} />
            <Text style={styles.emptyText}>Top artists coming soon</Text>
            <Text style={styles.emptySubText}>Follow artists to see their latest activity</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ResonaraTheme.background,
  },
  subTabBar: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ResonaraTheme.border,
  },
  subTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  subTabText: {
    color: ResonaraTheme.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  subTabTextActive: {
    color: ResonaraTheme.text,
    fontWeight: '700',
  },
  subTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: ResonaraTheme.text,
    borderRadius: 1,
  },
  feed: {
    flex: 1,
  },
  card: {
    backgroundColor: ResonaraTheme.background,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: ResonaraTheme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: ResonaraTheme.accentPink,
  },
  avatarInitials: {
    color: ResonaraTheme.text,
    fontSize: 13,
    fontWeight: '700',
  },
  artistInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  artistNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  artistName: {
    color: ResonaraTheme.text,
    fontSize: 15,
    fontWeight: '700',
  },
  listeningTo: {
    color: ResonaraTheme.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  listeningToLink: {
    color: ResonaraTheme.accent,
    textDecorationLine: 'underline',
  },
  albumArt: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#2A0808',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  albumGradient: {
    ...StyleSheet.absoluteFill,
    experimental_backgroundImage: 'linear-gradient(180deg, #3D0C0C 0%, #1A0404 65%, #0D0208 100%)',
  },
  albumTextOverlay: {
    padding: 20,
  },
  albumTitleText: {
    color: 'rgba(160, 20, 20, 0.65)',
    fontSize: 90,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -4,
    lineHeight: 80,
  },
  albumArtistText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 5,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  trackInfo: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  trackTitle: {
    color: ResonaraTheme.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 10,
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressTrack: {
    height: 3,
    backgroundColor: ResonaraTheme.progressTrack,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: ResonaraTheme.accent,
    borderRadius: 2,
  },
  progressTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTime: {
    color: ResonaraTheme.textSecondary,
    fontSize: 11,
  },
  listenTogetherButton: {
    borderWidth: 1,
    borderColor: ResonaraTheme.text,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  listenTogetherText: {
    color: ResonaraTheme.text,
    fontSize: 15,
    fontWeight: '600',
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  queueSong: {
    color: ResonaraTheme.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyText: {
    color: ResonaraTheme.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubText: {
    color: ResonaraTheme.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
