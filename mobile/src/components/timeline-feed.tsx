import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListenTogetherView } from '@/components/listen-together-view';
import { ResonaraTheme } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { usePlayer } from '@/context/player';
import { SessionsService, sessionToPlayerTrack, type FeedSession } from '@/services/sessions.service';

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}

function ActivityCard({
  session,
  onListenTogether,
  onPlay,
}: {
  session: FeedSession;
  onListenTogether: () => void;
  onPlay: () => void;
}) {
  const track = session.tracks;
  const profile = session.profiles;
  const progressSec = Math.floor(session.position_ms / 1000);
  const durationSec = Math.floor((track?.duration_ms ?? 0) / 1000);
  const progressPercent = durationSec > 0 ? (progressSec / durationSec) * 100 : 0;
  const userInitials = initials(profile.username);

  return (
    <View style={styles.card}>
      {/* Host header */}
      <View style={styles.artistRow}>
        {profile.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{userInitials}</Text>
          </View>
        )}
        <View style={styles.artistInfo}>
          <Text style={styles.artistName}>@{profile.username}</Text>
          {track && (
            <Text style={styles.listeningTo}>
              Now listening to:{' '}
              <Text style={styles.listeningToLink}>{track.album ?? track.title}</Text>
              {' '}by{' '}
              <Text style={styles.listeningToLink}>{track.artist}</Text>
            </Text>
          )}
        </View>
      </View>

      {/* Album art */}
      <Pressable style={styles.albumArt as any} onPress={onPlay}>
        {track?.artwork_url ? (
          <Image source={{ uri: track.artwork_url }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <>
            <View style={styles.albumGradient as any} />
            <View style={styles.albumTextOverlay}>
              <Text style={styles.albumTitleText} numberOfLines={1}>
                {track?.album?.toUpperCase() ?? track?.title?.toUpperCase() ?? '—'}
              </Text>
              <Text style={styles.albumArtistText} numberOfLines={1}>
                {track?.artist?.toUpperCase() ?? ''}
              </Text>
            </View>
          </>
        )}
      </Pressable>

      {/* Track info */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={2}>
          {track?.title ?? 'Unknown track'}
        </Text>

        {durationSec > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <View style={styles.progressTimes}>
              <Text style={styles.progressTime}>{formatTime(progressSec)}</Text>
              <Text style={styles.progressTime}>{formatTime(durationSec)}</Text>
            </View>
          </View>
        )}

        <Pressable style={styles.listenTogetherButton} onPress={onListenTogether}>
          <Text style={styles.listenTogetherText}>Listen Together</Text>
        </Pressable>

        <View style={styles.queueRow}>
          <SymbolView name="plus.circle" size={14} tintColor={ResonaraTheme.textSecondary} />
          <Text style={styles.queueSong}>Add song to playlist</Text>
        </View>
      </View>
    </View>
  );
}

type SubTab = 'friends' | 'following' | 'topArtists';

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'friends', label: 'Friends' },
  { id: 'following', label: 'Following' },
  { id: 'topArtists', label: 'Top Artists' },
];

interface Props {
  bottomInset: number;
}

export function TimelineFeed({ bottomInset }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('following');
  const [sessions, setSessions] = useState<FeedSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeLTSession, setActiveLTSession] = useState<FeedSession | null>(null);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { play, openNowPlaying } = usePlayer();

  async function loadFeed(isRefresh = false) {
    if (!user) return;
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const data = await SessionsService.getFollowingFeed(user.id);
      setSessions(data);
    } catch (e) {
      console.error('Failed to load feed:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (subTab === 'following') loadFeed();
  }, [subTab, user]);

  function handlePlay(session: FeedSession) {
    const track = sessionToPlayerTrack(session);
    play(track, session.id);
    openNowPlaying();
  }

  if (activeLTSession) {
    return (
      <ListenTogetherView
        track={sessionToPlayerTrack(activeLTSession)}
        sessionId={activeLTSession.id}
        onBack={() => setActiveLTSession(null)}
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
            <Pressable key={tab.id} style={styles.subTab} onPress={() => setSubTab(tab.id)}>
              <Text style={[styles.subTabText, isActive && styles.subTabTextActive]}>{tab.label}</Text>
              {isActive && <View style={styles.subTabIndicator} />}
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        style={styles.feed}
        contentContainerStyle={{ paddingBottom: bottomInset }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadFeed(true)}
            tintColor={ResonaraTheme.accent}
          />
        }>
        {subTab === 'following' && (
          <>
            {loading ? (
              <ActivityIndicator style={styles.loader} color={ResonaraTheme.accent} />
            ) : sessions.length === 0 ? (
              <View style={styles.emptyState}>
                <SymbolView name="music.note.list" size={40} tintColor={ResonaraTheme.textMuted} />
                <Text style={styles.emptyText}>No active sessions</Text>
                <Text style={styles.emptySubText}>
                  Follow people to see what they're listening to right now
                </Text>
              </View>
            ) : (
              sessions.map((s) => (
                <ActivityCard
                  key={s.id}
                  session={s}
                  onPlay={() => handlePlay(s)}
                  onListenTogether={() => setActiveLTSession(s)}
                />
              ))
            )}
          </>
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
  container: { flex: 1, backgroundColor: ResonaraTheme.background },
  subTabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ResonaraTheme.border,
  },
  subTab: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  subTabText: { color: ResonaraTheme.textMuted, fontSize: 14, fontWeight: '600' },
  subTabTextActive: { color: ResonaraTheme.text, fontWeight: '700' },
  subTabIndicator: {
    position: 'absolute', bottom: 0, left: '15%', right: '15%',
    height: 2, backgroundColor: ResonaraTheme.accent, borderRadius: 1,
  },
  feed: { flex: 1 },
  loader: { marginTop: 60 },
  card: { backgroundColor: ResonaraTheme.background },
  artistRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 14, gap: 10,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: ResonaraTheme.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: ResonaraTheme.accentPink,
  },
  avatarImage: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: ResonaraTheme.accentPink },
  avatarInitials: { color: ResonaraTheme.text, fontSize: 13, fontWeight: '700' },
  artistInfo: { flex: 1, justifyContent: 'center' },
  artistName: { color: ResonaraTheme.text, fontSize: 15, fontWeight: '700' },
  listeningTo: { color: ResonaraTheme.textSecondary, fontSize: 12, marginTop: 2 },
  listeningToLink: { color: ResonaraTheme.accent, textDecorationLine: 'underline' },
  albumArt: {
    width: '100%', aspectRatio: 1, backgroundColor: '#2A0808',
    justifyContent: 'flex-end', overflow: 'hidden',
  },
  albumGradient: {
    ...StyleSheet.absoluteFill,
    experimental_backgroundImage: 'linear-gradient(180deg, #3D0C0C 0%, #1A0404 65%, #0D0208 100%)',
  },
  albumTextOverlay: { padding: 20 },
  albumTitleText: {
    color: 'rgba(160, 20, 20, 0.65)', fontSize: 72, fontWeight: '900',
    fontStyle: 'italic', letterSpacing: -4, lineHeight: 72,
  },
  albumArtistText: {
    color: 'rgba(255,255,255,0.3)', fontSize: 15, fontWeight: '700',
    letterSpacing: 5, textTransform: 'uppercase', marginTop: 6,
  },
  trackInfo: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  trackTitle: { color: ResonaraTheme.text, fontSize: 14, fontWeight: '700', lineHeight: 20, marginBottom: 10 },
  progressContainer: { marginBottom: 14 },
  progressTrack: {
    height: 3, backgroundColor: ResonaraTheme.progressTrack,
    borderRadius: 2, overflow: 'hidden', marginBottom: 5,
  },
  progressFill: { height: '100%', backgroundColor: ResonaraTheme.accent, borderRadius: 2 },
  progressTimes: { flexDirection: 'row', justifyContent: 'space-between' },
  progressTime: { color: ResonaraTheme.textSecondary, fontSize: 11 },
  listenTogetherButton: {
    borderWidth: 1, borderColor: ResonaraTheme.text, borderRadius: 24,
    paddingVertical: 12, alignItems: 'center', marginBottom: 12,
  },
  listenTogetherText: { color: ResonaraTheme.text, fontSize: 15, fontWeight: '600' },
  queueRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  queueSong: { color: ResonaraTheme.textSecondary, fontSize: 13, flex: 1 },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingTop: 80, paddingHorizontal: 32, gap: 12,
  },
  emptyText: { color: ResonaraTheme.textSecondary, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  emptySubText: { color: ResonaraTheme.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
