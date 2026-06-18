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

import { ResonaraTheme } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { usePlayer } from '@/context/player';
import { AlbumsService } from '@/services/albums.service';
import { TracksService } from '@/services/tracks.service';
import type { Album, TrackWithAlbum } from '@/types/database';

type Filter = 'albums' | 'songs';

function formatDuration(ms: number | null): string {
  if (!ms) return '';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function AlbumCard({ album, onPress }: { album: Album; onPress: () => void }) {
  return (
    <Pressable style={styles.albumCard} onPress={onPress}>
      {album.artwork_url ? (
        <Image source={{ uri: album.artwork_url }} style={styles.albumArt} contentFit="cover" />
      ) : (
        <View style={[styles.albumArt, styles.albumArtFallback]}>
          <SymbolView name="music.note" size={28} tintColor={ResonaraTheme.textMuted} />
        </View>
      )}
      <Text style={styles.albumTitle} numberOfLines={1}>{album.title}</Text>
      <Text style={styles.albumArtist} numberOfLines={1}>{album.artist}</Text>
      {album.release_year && (
        <Text style={styles.albumYear}>{album.release_year}</Text>
      )}
    </Pressable>
  );
}

function TrackRow({ track, onPress }: { track: TrackWithAlbum; onPress: () => void }) {
  const artwork = track.artwork_url ?? track.albums?.artwork_url;
  return (
    <Pressable style={styles.trackRow} onPress={onPress}>
      {artwork ? (
        <Image source={{ uri: artwork }} style={styles.trackThumb} contentFit="cover" />
      ) : (
        <View style={[styles.trackThumb, styles.trackThumbFallback]}>
          <SymbolView name="music.note" size={16} tintColor={ResonaraTheme.textMuted} />
        </View>
      )}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {track.artist}{track.albums ? ` · ${track.albums.title}` : ''}
        </Text>
      </View>
      <Text style={styles.trackDuration}>{formatDuration(track.duration_ms)}</Text>
      <SymbolView name="play.fill" size={12} tintColor={ResonaraTheme.textMuted} />
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
  const { user } = useAuth();
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
        <Text style={styles.screenTitle}>Library</Text>
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.id}
            style={[styles.filterPill, filter === f.id && styles.filterPillActive]}
            onPress={() => setFilter(f.id)}>
            <Text style={[styles.filterPillText, filter === f.id && styles.filterPillTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            tintColor={ResonaraTheme.accent}
          />
        }>
        {loading ? (
          <ActivityIndicator style={styles.loader} color={ResonaraTheme.accent} />
        ) : filter === 'albums' ? (
          albums.length === 0 ? (
            <View style={styles.emptyState}>
              <SymbolView name="square.stack" size={48} tintColor={ResonaraTheme.textMuted} />
              <Text style={styles.emptyTitle}>No albums yet</Text>
              <Text style={styles.emptySub}>
                Albums uploaded to Resonara will appear here
              </Text>
            </View>
          ) : (
            <View style={styles.albumGrid}>
              {albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onPress={() => {
                    // TODO: navigate to album detail screen
                  }}
                />
              ))}
            </View>
          )
        ) : (
          tracks.length === 0 ? (
            <View style={styles.emptyState}>
              <SymbolView name="music.note.list" size={48} tintColor={ResonaraTheme.textMuted} />
              <Text style={styles.emptyTitle}>No songs yet</Text>
              <Text style={styles.emptySub}>
                Songs uploaded to Resonara will appear here
              </Text>
            </View>
          ) : (
            <View style={styles.trackList}>
              {tracks.map((track) => (
                <TrackRow
                  key={track.id}
                  track={track}
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  screenTitle: { color: ResonaraTheme.text, fontSize: 28, fontWeight: '700' },
  filtersRow: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterPill: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: ResonaraTheme.surface,
    borderWidth: StyleSheet.hairlineWidth, borderColor: ResonaraTheme.border,
  },
  filterPillActive: { backgroundColor: ResonaraTheme.text },
  filterPillText: { color: ResonaraTheme.textSecondary, fontSize: 13, fontWeight: '600' },
  filterPillTextActive: { color: ResonaraTheme.background },
  content: { flexGrow: 1 },
  loader: { marginTop: 48 },
  emptyState: {
    alignItems: 'center', paddingTop: 72, paddingHorizontal: 40, gap: 12,
  },
  emptyTitle: { color: ResonaraTheme.textSecondary, fontSize: 17, fontWeight: '600', textAlign: 'center' },
  emptySub: { color: ResonaraTheme.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },

  // Albums grid (2 columns)
  albumGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 16,
  },
  albumCard: { width: '46%' },
  albumArt: { width: '100%', aspectRatio: 1, borderRadius: 8, marginBottom: 6 },
  albumArtFallback: {
    backgroundColor: ResonaraTheme.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth, borderColor: ResonaraTheme.border,
  },
  albumTitle: { color: ResonaraTheme.text, fontSize: 13, fontWeight: '600' },
  albumArtist: { color: ResonaraTheme.textSecondary, fontSize: 12, marginTop: 2 },
  albumYear: { color: ResonaraTheme.textMuted, fontSize: 11, marginTop: 1 },

  // Tracks list
  trackList: { paddingHorizontal: 16 },
  trackRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: ResonaraTheme.border,
  },
  trackThumb: { width: 44, height: 44, borderRadius: 6 },
  trackThumbFallback: {
    backgroundColor: ResonaraTheme.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth, borderColor: ResonaraTheme.border,
  },
  trackInfo: { flex: 1 },
  trackTitle: { color: ResonaraTheme.text, fontSize: 14, fontWeight: '600' },
  trackArtist: { color: ResonaraTheme.textSecondary, fontSize: 12, marginTop: 2 },
  trackDuration: { color: ResonaraTheme.textMuted, fontSize: 12 },
});
