import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ResonaraTheme } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { usePlayer } from '@/context/player';
import { AlbumsService } from '@/services/albums.service';
import { TracksService } from '@/services/tracks.service';
import type { Album, TrackWithAlbum } from '@/types/database';

type Filter = 'albums' | 'songs';

const COLUMN_GAP = 12;
const H_PADDING = 16;
const CARD_WIDTH = (Dimensions.get('window').width - H_PADDING * 2 - COLUMN_GAP) / 2;

function formatDuration(ms: number | null): string {
  if (!ms) return '';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Deterministic pastel-dark colour from a string (used when no artwork)
function colourFromString(str: string): string {
  const colours = [
    '#3D1A6E', '#1A3D6E', '#6E1A3D', '#1A6E3D',
    '#6E4A1A', '#1A4A6E', '#4A1A6E', '#6E1A1A',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colours[Math.abs(hash) % colours.length];
}

function AlbumCard({ album, onPress }: { album: Album; onPress: () => void }) {
  const bg = colourFromString(album.title);

  return (
    <Pressable style={styles.albumCard} onPress={onPress}>
      {({ pressed }) => (
        <View style={[styles.albumCardInner, { opacity: pressed ? 0.85 : 1 }]}>
          {/* Square artwork */}
          <View style={styles.artworkWrapper}>
            {album.artwork_url ? (
              <Image
                source={{ uri: album.artwork_url }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }]}>
                <SymbolView name="music.note" size={36} tintColor="rgba(255,255,255,0.35)" />
              </View>
            )}

            {/* Bottom gradient overlay — title/artist on top of art */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.72)']}
              start={{ x: 0, y: 0.4 }}
              end={{ x: 0, y: 1 }}
              style={styles.artGradient}
            >
              <Text style={styles.artTitle} numberOfLines={1}>{album.title}</Text>
              <Text style={styles.artArtist} numberOfLines={1}>{album.artist}</Text>
            </LinearGradient>
          </View>

          {/* Year badge below card */}
          {album.release_year != null && (
            <Text style={styles.yearBadge}>{album.release_year}</Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

function TrackRow({ track, index, onPress }: { track: TrackWithAlbum; index: number; onPress: () => void }) {
  const artwork = track.artwork_url ?? track.albums?.artwork_url;
  const bg = colourFromString(track.title);

  return (
    <Pressable style={styles.trackRow} onPress={onPress}>
      {/* Index or artwork */}
      <View style={styles.trackThumbWrapper}>
        {artwork ? (
          <Image source={{ uri: artwork }} style={styles.trackThumb} contentFit="cover" />
        ) : (
          <View style={[styles.trackThumb, { backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={styles.trackIndex}>{index + 1}</Text>
          </View>
        )}
      </View>

      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {track.artist}
          {track.albums ? <Text style={styles.trackAlbum}> · {track.albums.title}</Text> : null}
        </Text>
      </View>

      <Text style={styles.trackDuration}>{formatDuration(track.duration_ms)}</Text>
      <View style={styles.playIcon}>
        <SymbolView name="play.fill" size={11} tintColor={ResonaraTheme.textMuted} />
      </View>
    </Pressable>
  );
}

interface Props {
  bottomInset: number;
}

export function LibraryScreen({ bottomInset }: Props) {
  const [filter, setFilter] = useState<Filter>('albums');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<TrackWithAlbum[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const insets = useSafeAreaInsets();
  const { play, openNowPlaying } = usePlayer();

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'albums', label: 'Albums' },
    { id: 'songs', label: 'Songs' },
  ];

  async function loadData(isRefresh = false) {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [albumsData, tracksData] = await Promise.all([
        AlbumsService.getAll(),
        TracksService.getRecent(50),
      ]);
      setAlbums(albumsData);
      setTracks(tracksData);
    } catch (e) {
      console.error('Library load failed:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handlePlayTrack(track: TrackWithAlbum) {
    const artwork = track.artwork_url ?? track.albums?.artwork_url ?? null;
    play({
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.albums?.title ?? '',
      artworkUrl: artwork,
      audioUrl: track.audio_url,
      progressSec: 0,
      durationSec: Math.floor((track.duration_ms ?? 0) / 1000),
      queue: [],
    });
    openNowPlaying();
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.screenTitle}>Your Library</Text>
      </View>

      {/* Filter tabs (centered, equal width) */}
      <View style={styles.filterTabs}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.id}
            style={[styles.filterTab, filter === f.id && styles.filterTabActive]}
            onPress={() => setFilter(f.id)}>
            <Text style={[styles.filterTabText, filter === f.id && styles.filterTabTextActive]}>
              {f.label}
            </Text>
            {filter === f.id && <View style={styles.filterTabIndicator} />}
          </Pressable>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 16 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={ResonaraTheme.accent} />
        }>
        {loading ? (
          <ActivityIndicator style={styles.loader} color={ResonaraTheme.accent} />
        ) : filter === 'albums' ? (
          albums.length === 0 ? (
            <View style={styles.emptyState}>
              <SymbolView name="square.stack" size={48} tintColor={ResonaraTheme.textMuted} />
              <Text style={styles.emptyTitle}>No albums yet</Text>
              <Text style={styles.emptySub}>Run the seed SQL to add sample albums</Text>
            </View>
          ) : (
            <View style={styles.albumGrid}>
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} onPress={() => {}} />
              ))}
            </View>
          )
        ) : (
          tracks.length === 0 ? (
            <View style={styles.emptyState}>
              <SymbolView name="music.note.list" size={48} tintColor={ResonaraTheme.textMuted} />
              <Text style={styles.emptyTitle}>No songs yet</Text>
              <Text style={styles.emptySub}>Run the seed SQL to add sample songs</Text>
            </View>
          ) : (
            <View style={styles.trackList}>
              {tracks.map((track, i) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={i}
                  onPress={() => handlePlayTrack(track)}
                />
              ))}
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ResonaraTheme.background },

  header: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 8,
  },
  screenTitle: { color: ResonaraTheme.text, fontSize: 28, fontWeight: '800' },

  // Centered filter tabs
  filterTabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ResonaraTheme.border,
    marginBottom: 4,
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  filterTabActive: {},
  filterTabText: { color: ResonaraTheme.textMuted, fontSize: 14, fontWeight: '600' },
  filterTabTextActive: { color: ResonaraTheme.text, fontWeight: '700' },
  filterTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: ResonaraTheme.accent,
    borderRadius: 1,
  },

  content: { flexGrow: 1 },
  loader: { marginTop: 64 },

  emptyState: {
    alignItems: 'center', paddingTop: 80, paddingHorizontal: 40, gap: 12,
  },
  emptyTitle: { color: ResonaraTheme.textSecondary, fontSize: 17, fontWeight: '600', textAlign: 'center' },
  emptySub: { color: ResonaraTheme.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },

  // ── Albums grid ──────────────────────────────────────────────────────────
  albumGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: H_PADDING,
    gap: COLUMN_GAP,
    paddingTop: 12,
  },
  albumCard: {
    width: CARD_WIDTH,
  },
  albumCardInner: {},
  artworkWrapper: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,   // perfect square
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: ResonaraTheme.surface,
    marginBottom: 6,
  },
  artGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 10,
  },
  artTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  artArtist: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 1,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  yearBadge: {
    color: ResonaraTheme.textMuted,
    fontSize: 11,
    marginTop: 2,
    marginLeft: 2,
  },

  // ── Tracks list ──────────────────────────────────────────────────────────
  trackList: { paddingHorizontal: H_PADDING, paddingTop: 8 },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ResonaraTheme.border,
  },
  trackThumbWrapper: {},
  trackThumb: { width: 48, height: 48, borderRadius: 6 },
  trackIndex: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '700' },
  trackInfo: { flex: 1 },
  trackTitle: { color: ResonaraTheme.text, fontSize: 14, fontWeight: '600' },
  trackArtist: { color: ResonaraTheme.textSecondary, fontSize: 12, marginTop: 2 },
  trackAlbum: { color: ResonaraTheme.textMuted },
  trackDuration: { color: ResonaraTheme.textMuted, fontSize: 12 },
  playIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: ResonaraTheme.surface,
    justifyContent: 'center', alignItems: 'center',
  },
});
