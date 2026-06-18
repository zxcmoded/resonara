import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ResonaraTheme } from '@/constants/theme';
import { usePlayer } from '@/context/player';
import { TracksService } from '@/services/tracks.service';
import type { Track } from '@/types/database';

type Genre = {
  label: string;
  topColor: string;
  bottomColor: string;
  icon: keyof typeof Ionicons.glyphMap;
};

// Staggered layout: pairs alternate which side is wider (62% / 36%)
const GENRE_PAIRS: [Genre, Genre][] = [
  [
    { label: 'Hip-Hop',    topColor: '#9B40E0', bottomColor: '#5A0FA8', icon: 'disc-outline' },
    { label: 'Pop',        topColor: '#24B8E8', bottomColor: '#0B6CA0', icon: 'star-outline' },
  ],
  [
    { label: 'Rock',       topColor: '#E03040', bottomColor: '#980818', icon: 'flash-outline' },
    { label: 'Electronic', topColor: '#18C818', bottomColor: '#076007', icon: 'radio-outline' },
  ],
  [
    { label: 'R&B',        topColor: '#E89000', bottomColor: '#A05000', icon: 'heart-outline' },
    { label: 'Country',    topColor: '#58A200', bottomColor: '#285800', icon: 'leaf-outline' },
  ],
  [
    { label: 'Jazz',       topColor: '#2080E8', bottomColor: '#083898', icon: 'musical-note-outline' },
    { label: 'Classical',  topColor: '#A04828', bottomColor: '#501808', icon: 'musical-notes-outline' },
  ],
  [
    { label: 'K-Pop',      topColor: '#E020A8', bottomColor: '#880068', icon: 'sparkles-outline' },
    { label: 'Latin',      topColor: '#E04818', bottomColor: '#900808', icon: 'flame-outline' },
  ],
];

function GenreCard({ genre, wide }: { genre: Genre; wide: boolean }) {
  return (
    <Pressable
      style={[styles.genreCard, wide ? styles.genreCardWide : styles.genreCardNarrow]}
      android_ripple={{ color: 'rgba(255,255,255,0.15)' }}>
      {({ pressed }) => (
        <View style={[StyleSheet.absoluteFill, { opacity: pressed ? 0.85 : 1 }]}>
          {/* Gradient background */}
          <LinearGradient
            colors={[genre.topColor, genre.bottomColor]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Decorative shine bubble */}
          <View style={styles.shineBubble} />

          {/* Large decorative icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name={genre.icon}
              size={56}
              color="rgba(255,255,255,0.22)"
              style={styles.iconRotated}
            />
          </View>

          {/* Genre label */}
          <View style={styles.genreLabelContainer}>
            <Text style={styles.genreLabel} numberOfLines={1}>{genre.label}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

interface Props {
  bottomInset: number;
}

export function SearchScreen({ bottomInset }: Props) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const insets = useSafeAreaInsets();
  const { play, openNowPlaying } = usePlayer();

  async function handleSearch(text: string) {
    setQuery(text);
    if (!text.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const data = await TracksService.search(text.trim());
      setResults(data);
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setSearching(false);
    }
  }

  function playTrack(track: Track) {
    play({
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album_id ?? '',
      artworkUrl: track.artwork_url,
      audioUrl: track.audio_url,
      progressSec: 0,
      durationSec: Math.floor((track.duration_ms ?? 0) / 1000),
      queue: [],
    });
    openNowPlaying();
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.screenTitle}>Search</Text>
        <View style={[styles.searchBar, focused && styles.searchBarFocused]}>
          <SymbolView name="magnifyingglass" size={16} tintColor={ResonaraTheme.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Artists, songs, albums..."
            placeholderTextColor={ResonaraTheme.textMuted}
            value={query}
            onChangeText={handleSearch}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); setResults([]); }}>
              <SymbolView name="xmark.circle.fill" size={16} tintColor={ResonaraTheme.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset }}>

        {/* ── Search results ──────────────────────────────────────── */}
        {query.length > 0 && (
          <View style={styles.section}>
            {searching ? (
              <ActivityIndicator color={ResonaraTheme.accent} style={styles.loader} />
            ) : results.length === 0 ? (
              <View style={styles.emptySearch}>
                <SymbolView name="magnifyingglass" size={32} tintColor={ResonaraTheme.textMuted} />
                <Text style={styles.emptyText}>No results for "{query}"</Text>
              </View>
            ) : (
              results.map((track) => (
                <Pressable key={track.id} style={styles.trackRow} onPress={() => playTrack(track)}>
                  <View style={styles.trackThumb} />
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
                  </View>
                  <SymbolView name="play.fill" size={14} tintColor={ResonaraTheme.textMuted} />
                </Pressable>
              ))
            )}
          </View>
        )}

        {/* ── Browse by Genre ─────────────────────────────────────── */}
        {query.length === 0 && (
          <View style={styles.genreSection}>
            {/* Section header */}
            <View style={styles.sectionHeader}>
              <Ionicons name="musical-notes" size={18} color={ResonaraTheme.accent} />
              <Text style={styles.sectionTitle}>Browse by Genre</Text>
            </View>

            {/* Staggered pairs: odd rows → left card wide; even rows → right card wide */}
            {GENRE_PAIRS.map(([left, right], index) => (
              <View key={index} style={styles.genreRow}>
                <GenreCard genre={left}  wide={index % 2 === 0} />
                <GenreCard genre={right} wide={index % 2 !== 0} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ResonaraTheme.background },
  header: { paddingHorizontal: 16, paddingBottom: 8, gap: 12 },
  screenTitle: { color: ResonaraTheme.text, fontSize: 28, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: ResonaraTheme.surface, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
    borderWidth: StyleSheet.hairlineWidth, borderColor: ResonaraTheme.border,
  },
  searchBarFocused: { borderColor: ResonaraTheme.accent },
  searchInput: { flex: 1, color: ResonaraTheme.text, fontSize: 15 },

  section: { paddingHorizontal: 16, paddingTop: 16 },
  loader: { marginVertical: 24 },
  emptySearch: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { color: ResonaraTheme.textSecondary, fontSize: 14 },
  trackRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: ResonaraTheme.border,
  },
  trackThumb: {
    width: 44, height: 44, borderRadius: 6,
    backgroundColor: ResonaraTheme.surface, borderWidth: 1, borderColor: ResonaraTheme.border,
  },
  trackInfo: { flex: 1 },
  trackTitle: { color: ResonaraTheme.text, fontSize: 14, fontWeight: '600' },
  trackArtist: { color: ResonaraTheme.textSecondary, fontSize: 12, marginTop: 2 },

  // Genre section
  genreSection: { paddingHorizontal: 16, paddingTop: 20, gap: 10 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4,
  },
  sectionTitle: { color: ResonaraTheme.text, fontSize: 20, fontWeight: '800' },

  // Staggered row
  genreRow: { flexDirection: 'row', gap: 10 },

  // Card base
  genreCard: {
    height: 110,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  genreCardWide:   { flex: 1.65 },
  genreCardNarrow: { flex: 1 },

  // Decorative shine bubble top-left
  shineBubble: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  // Icon top-right
  iconContainer: {
    position: 'absolute',
    top: 6,
    right: 6,
    transform: [{ rotate: '-12deg' }],
  },
  iconRotated: {},

  // Label bottom-left
  genreLabelContainer: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 8,
  },
  genreLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
