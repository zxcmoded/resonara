import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ResonaraTheme } from '@/constants/theme';
import { usePlayer, MOCK_TRACK } from '@/context/player';

type Filter = 'playlists' | 'albums' | 'artists';

const PLAYLISTS = [
  {
    id: '1',
    name: 'Liked Songs',
    subtitle: '247 songs',
    isLiked: true,
    color: '#5B8DEF',
  },
  {
    id: '2',
    name: 'Late Night Drives',
    subtitle: 'By you • 34 songs',
    isLiked: false,
    color: '#1A1E35',
  },
  {
    id: '3',
    name: 'Taylor Swift Radio',
    subtitle: 'Based on Taylor Swift • 50 songs',
    isLiked: false,
    color: '#3D0C0C',
  },
  {
    id: '4',
    name: 'Workout Mix 2024',
    subtitle: 'By you • 28 songs',
    isLiked: false,
    color: '#0D2A1A',
  },
  {
    id: '5',
    name: 'Chill Vibes',
    subtitle: 'By selenagomez • 41 songs',
    isLiked: false,
    color: '#1A0D2A',
  },
];

const ALBUMS = [
  { id: '1', name: 'Red (Taylor\'s Version)', artist: 'Taylor Swift', year: '2021', color: '#3D0C0C' },
  { id: '2', name: 'Harry\'s House', artist: 'Harry Styles', year: '2022', color: '#1A2A0D' },
  { id: '3', name: 'Endless Summer Vacation', artist: 'Miley Cyrus', year: '2023', color: '#0D1A3D' },
];

const FOLLOWED_ARTISTS = [
  { id: '1', name: 'Taylor Swift', followers: '89.4M', active: true },
  { id: '2', name: 'Harry Styles', followers: '52.1M', active: false },
  { id: '3', name: 'Miley Cyrus', followers: '44.8M', active: true },
  { id: '4', name: 'The Weeknd', followers: '61.2M', active: false },
  { id: '5', name: 'Olivia Rodrigo', followers: '38.7M', active: false },
];

const RECENT_TRACKS = [
  { title: "Anti-Hero", artist: 'Taylor Swift' },
  { title: "Flowers", artist: 'Miley Cyrus' },
  { title: "As It Was", artist: 'Harry Styles' },
];

interface Props {
  bottomInset: number;
}

export function LibraryScreen({ bottomInset }: Props) {
  const [filter, setFilter] = useState<Filter>('playlists');
  const insets = useSafeAreaInsets();
  const { play, openNowPlaying } = usePlayer();

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'playlists', label: 'Playlists' },
    { id: 'albums', label: 'Albums' },
    { id: 'artists', label: 'Artists' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Your Library</Text>
          <Pressable style={styles.addBtn}>
            <SymbolView name="plus" size={18} tintColor={ResonaraTheme.text} />
          </Pressable>
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.id}
              style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
              onPress={() => setFilter(f.id)}>
              <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset }}>

        {/* Recently played */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Recently Played</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
            {RECENT_TRACKS.map((t, i) => (
              <Pressable
                key={i}
                style={styles.recentCard}
                onPress={() => { play(MOCK_TRACK); openNowPlaying(); }}>
                <View style={[styles.recentArt, { backgroundColor: i === 0 ? '#3D0C0C' : i === 1 ? '#0D1A3D' : '#1A2A0D' }]} />
                <Text style={styles.recentTitle} numberOfLines={1}>{t.title}</Text>
                <Text style={styles.recentArtist} numberOfLines={1}>{t.artist}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Playlists */}
        {filter === 'playlists' && (
          <View style={styles.section}>
            {PLAYLISTS.map((pl) => (
              <Pressable
                key={pl.id}
                style={styles.listItem}
                onPress={() => { play(MOCK_TRACK); openNowPlaying(); }}>
                <View style={[styles.listThumb, { backgroundColor: pl.color }]}>
                  {pl.isLiked && (
                    <SymbolView name="heart.fill" size={22} tintColor="#FFFFFF" />
                  )}
                </View>
                <View style={styles.listInfo}>
                  <Text style={styles.listName}>{pl.name}</Text>
                  <Text style={styles.listSub}>{pl.subtitle}</Text>
                </View>
                <SymbolView name="ellipsis" size={18} tintColor={ResonaraTheme.textMuted} />
              </Pressable>
            ))}
          </View>
        )}

        {/* Albums */}
        {filter === 'albums' && (
          <View style={styles.section}>
            {ALBUMS.map((al) => (
              <Pressable
                key={al.id}
                style={styles.listItem}
                onPress={() => { play(MOCK_TRACK); openNowPlaying(); }}>
                <View style={[styles.listThumb, { backgroundColor: al.color }]} />
                <View style={styles.listInfo}>
                  <Text style={styles.listName}>{al.name}</Text>
                  <Text style={styles.listSub}>{al.artist} • {al.year}</Text>
                </View>
                <SymbolView name="ellipsis" size={18} tintColor={ResonaraTheme.textMuted} />
              </Pressable>
            ))}
          </View>
        )}

        {/* Artists */}
        {filter === 'artists' && (
          <View style={styles.section}>
            {FOLLOWED_ARTISTS.map((artist) => (
              <Pressable key={artist.id} style={styles.listItem}>
                <View style={[styles.artistAvatar, artist.active && styles.artistAvatarActive]}>
                  <Text style={styles.artistInitials}>{artist.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</Text>
                  {artist.active && <View style={styles.activeDot} />}
                </View>
                <View style={styles.listInfo}>
                  <Text style={styles.listName}>{artist.name}</Text>
                  <Text style={styles.listSub}>{artist.followers} followers{artist.active ? ' • listening now' : ''}</Text>
                </View>
                <SymbolView name="chevron.right" size={14} tintColor={ResonaraTheme.textMuted} />
              </Pressable>
            ))}
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
  header: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  screenTitle: {
    color: ResonaraTheme.text,
    fontSize: 28,
    fontWeight: '700',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ResonaraTheme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ResonaraTheme.border,
  },
  filtersRow: {
    gap: 8,
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: ResonaraTheme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ResonaraTheme.border,
  },
  filterChipActive: {
    backgroundColor: ResonaraTheme.text,
  },
  filterText: {
    color: ResonaraTheme.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: ResonaraTheme.background,
  },
  section: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    color: ResonaraTheme.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  recentRow: {
    gap: 12,
    paddingRight: 8,
  },
  recentCard: {
    width: 120,
  },
  recentArt: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 6,
  },
  recentTitle: {
    color: ResonaraTheme.text,
    fontSize: 13,
    fontWeight: '600',
  },
  recentArtist: {
    color: ResonaraTheme.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ResonaraTheme.border,
  },
  listThumb: {
    width: 52,
    height: 52,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    color: ResonaraTheme.text,
    fontSize: 14,
    fontWeight: '600',
  },
  listSub: {
    color: ResonaraTheme.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  artistAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: ResonaraTheme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  artistAvatarActive: {
    borderWidth: 2,
    borderColor: ResonaraTheme.accentPink,
  },
  artistInitials: {
    color: ResonaraTheme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  activeDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: ResonaraTheme.background,
  },
});
