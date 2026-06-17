import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ResonaraTheme } from '@/constants/theme';
import { usePlayer, MOCK_TRACK } from '@/context/player';

const GENRES = [
  { label: 'Hip-Hop', color: '#8B2FC9' },
  { label: 'Pop', color: '#1DA0C3' },
  { label: 'Rock', color: '#E61E32' },
  { label: 'Electronic', color: '#148A08' },
  { label: 'R&B', color: '#D67900' },
  { label: 'Country', color: '#477D00' },
  { label: 'Jazz', color: '#0053B3' },
  { label: 'Classical', color: '#7D3C1C' },
  { label: 'K-Pop', color: '#C71585' },
  { label: 'Latin', color: '#CC4400' },
];

const TRENDING = [
  { rank: 1, title: "Anti-Hero", artist: 'Taylor Swift', listeners: '2.4M' },
  { rank: 2, title: "Flowers", artist: 'Miley Cyrus', listeners: '1.8M' },
  { rank: 3, title: "Cruel Summer", artist: 'Taylor Swift', listeners: '1.6M' },
  { rank: 4, title: "As It Was", artist: 'Harry Styles', listeners: '1.4M' },
  { rank: 5, title: "Escapism.", artist: 'RAYE ft. 070 Shake', listeners: '1.1M' },
];

const TOP_ARTISTS = [
  { name: 'Taylor Swift', listeners: '12.4M', active: true },
  { name: 'Harry Styles', listeners: '8.1M', active: true },
  { name: 'Miley Cyrus', listeners: '6.9M', active: false },
  { name: 'The Weeknd', listeners: '6.2M', active: true },
];

interface Props {
  bottomInset: number;
}

export function SearchScreen({ bottomInset }: Props) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const insets = useSafeAreaInsets();
  const { play, openNowPlaying } = usePlayer();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.screenTitle}>Search</Text>
        <View style={[styles.searchBar, focused && styles.searchBarFocused]}>
          <SymbolView name="magnifyingglass" size={16} tintColor={ResonaraTheme.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Artists, songs, albums..."
            placeholderTextColor={ResonaraTheme.textMuted}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <SymbolView name="xmark.circle.fill" size={16} tintColor={ResonaraTheme.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomInset }}>

        {/* Trending Now */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          {TRENDING.map((item) => (
            <Pressable
              key={item.rank}
              style={styles.trendingRow}
              onPress={() => { play(MOCK_TRACK); openNowPlaying(); }}>
              <Text style={styles.trendingRank}>{item.rank}</Text>
              <View style={styles.trendingThumb} />
              <View style={styles.trendingInfo}>
                <Text style={styles.trendingTitle}>{item.title}</Text>
                <Text style={styles.trendingArtist}>{item.artist}</Text>
              </View>
              <View style={styles.listenersRow}>
                <View style={styles.listenersDot} />
                <Text style={styles.listenersCount}>{item.listeners}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Top Artists Live */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Artists & Trending</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.artistsRow}>
            {TOP_ARTISTS.map((artist) => (
              <Pressable key={artist.name} style={styles.artistCard}>
                <View style={[styles.artistAvatar, artist.active && styles.artistAvatarActive]}>
                  <Text style={styles.artistAvatarText}>{artist.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</Text>
                  {artist.active && <View style={styles.activeIndicator} />}
                </View>
                <Text style={styles.artistCardName} numberOfLines={1}>{artist.name}</Text>
                <Text style={styles.artistCardListeners}>{artist.listeners} listening</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Browse by genre */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Genre</Text>
          <View style={styles.genreGrid}>
            {GENRES.map((genre) => (
              <Pressable key={genre.label} style={[styles.genreCard, { backgroundColor: genre.color }]}>
                <Text style={styles.genreLabel}>{genre.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ResonaraTheme.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  screenTitle: {
    color: ResonaraTheme.text,
    fontSize: 28,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ResonaraTheme.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ResonaraTheme.border,
  },
  searchBarFocused: {
    borderColor: ResonaraTheme.accent,
  },
  searchInput: {
    flex: 1,
    color: ResonaraTheme.text,
    fontSize: 15,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: ResonaraTheme.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,51,120,0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ResonaraTheme.accentPink,
  },
  liveText: {
    color: ResonaraTheme.accentPink,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  trendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ResonaraTheme.border,
  },
  trendingRank: {
    color: ResonaraTheme.textMuted,
    fontSize: 14,
    fontWeight: '700',
    width: 20,
    textAlign: 'center',
  },
  trendingThumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: ResonaraTheme.surface,
    borderWidth: 1,
    borderColor: ResonaraTheme.border,
  },
  trendingInfo: {
    flex: 1,
  },
  trendingTitle: {
    color: ResonaraTheme.text,
    fontSize: 14,
    fontWeight: '600',
  },
  trendingArtist: {
    color: ResonaraTheme.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  listenersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listenersDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  listenersCount: {
    color: ResonaraTheme.textSecondary,
    fontSize: 11,
  },
  artistsRow: {
    gap: 16,
    paddingRight: 16,
  },
  artistCard: {
    alignItems: 'center',
    width: 80,
  },
  artistAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ResonaraTheme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  artistAvatarActive: {
    borderWidth: 2,
    borderColor: ResonaraTheme.accentPink,
  },
  artistAvatarText: {
    color: ResonaraTheme.text,
    fontSize: 18,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: ResonaraTheme.background,
  },
  artistCardName: {
    color: ResonaraTheme.text,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  artistCardListeners: {
    color: ResonaraTheme.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genreCard: {
    width: '47%',
    height: 80,
    borderRadius: 10,
    justifyContent: 'flex-end',
    padding: 12,
    overflow: 'hidden',
  },
  genreLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
