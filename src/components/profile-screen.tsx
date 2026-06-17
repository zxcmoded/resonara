import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ResonaraTheme } from '@/constants/theme';
import { usePlayer, MOCK_TRACK } from '@/context/player';

type ProfileTab = 'activity' | 'history' | 'following';

const FRIENDS_ACTIVITY = [
  {
    id: '1',
    user: 'selenagomez',
    initials: 'SG',
    avatarColor: '#0D1A3D',
    track: 'Calm Down',
    artist: 'Rema, Selena Gomez',
    time: '2m ago',
    active: true,
  },
  {
    id: '2',
    user: 'traviskelce',
    initials: 'TK',
    avatarColor: '#0D2A1A',
    track: 'Player\'s Anthem',
    artist: 'Junior M.A.F.I.A.',
    time: '15m ago',
    active: false,
  },
  {
    id: '3',
    user: 'andreswift',
    initials: 'AS',
    avatarColor: '#2A0D3D',
    track: 'All Too Well',
    artist: 'Taylor Swift',
    time: '22m ago',
    active: true,
  },
];

const HISTORY = [
  { title: "All Too Well (10 Min Version)", artist: 'Taylor Swift', time: 'Just now' },
  { title: "Anti-Hero", artist: 'Taylor Swift', time: '1h ago' },
  { title: "Flowers", artist: 'Miley Cyrus', time: '2h ago' },
  { title: "As It Was", artist: 'Harry Styles', time: 'Yesterday' },
  { title: "Blinding Lights", artist: 'The Weeknd', time: 'Yesterday' },
];

const FOLLOWING = [
  { user: 'selenagomez', initials: 'SG', avatarColor: '#0D1A3D', followers: '89M', active: true },
  { user: 'taylorswift13', initials: 'TS', avatarColor: '#3D0C0C', followers: '240M', active: false },
  { user: 'traviskelce', initials: 'TK', avatarColor: '#0D2A1A', followers: '4.2M', active: false },
  { user: 'harrysstyles', initials: 'HS', avatarColor: '#1A2A0D', followers: '18M', active: true },
];

interface Props {
  bottomInset: number;
}

export function ProfileScreen({ bottomInset }: Props) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('activity');
  const insets = useSafeAreaInsets();
  const { currentTrack, isPlaying, play, openNowPlaying } = usePlayer();

  const TABS: { id: ProfileTab; label: string }[] = [
    { id: 'activity', label: 'Activity' },
    { id: 'history', label: 'History' },
    { id: 'following', label: 'Following' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset }}>
        {/* Profile hero */}
        <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
          {/* Settings button */}
          <View style={styles.heroActions}>
            <Pressable>
              <SymbolView name="gearshape" size={22} tintColor={ResonaraTheme.textSecondary} />
            </Pressable>
          </View>

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarRing as any}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>KM</Text>
              </View>
            </View>
            {isPlaying && (
              <View style={styles.nowPlayingBadge}>
                <SymbolView name="waveform" size={10} tintColor="#FFFFFF" />
              </View>
            )}
          </View>

          {/* Name & handle */}
          <Text style={styles.displayName}>Kenneth M.</Text>
          <Text style={styles.handle}>@kennethmontealto</Text>
          <Text style={styles.bio}>Music is life 🎵 Always listening.</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>124</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>89</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>42</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.profileButtons}>
            <Pressable style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </Pressable>
            <Pressable style={styles.shareBtn}>
              <SymbolView name="square.and.arrow.up" size={16} tintColor={ResonaraTheme.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Currently playing card */}
        {currentTrack && (
          <Pressable style={styles.nowPlayingCard} onPress={openNowPlaying}>
            <View style={styles.nowPlayingLeft}>
              <View style={[styles.nowPlayingThumb, styles.nowPlayingThumbBg as any]}>
                <Text style={styles.nowPlayingThumbText}>RED</Text>
              </View>
              <View style={styles.nowPlayingInfo}>
                <View style={styles.nowPlayingLabelRow}>
                  <SymbolView name="waveform" size={12} tintColor={ResonaraTheme.accentPink} />
                  <Text style={styles.nowPlayingLabel}>Now Playing</Text>
                </View>
                <Text style={styles.nowPlayingTitle} numberOfLines={1}>{currentTrack.title}</Text>
                <Text style={styles.nowPlayingArtist}>{currentTrack.artist}</Text>
              </View>
            </View>
            <SymbolView name="chevron.right" size={14} tintColor={ResonaraTheme.textMuted} />
          </Pressable>
        )}

        {/* Tabs */}
        <View style={styles.tabBar}>
          {TABS.map((t) => (
            <Pressable key={t.id} style={styles.tab} onPress={() => setActiveTab(t.id)}>
              <Text style={[styles.tabText, activeTab === t.id && styles.tabTextActive]}>{t.label}</Text>
              {activeTab === t.id && <View style={styles.tabIndicator} />}
            </Pressable>
          ))}
        </View>

        {/* Activity tab */}
        {activeTab === 'activity' && (
          <View style={styles.tabContent}>
            <Text style={styles.tabSectionLabel}>Friends Listening Now</Text>
            {FRIENDS_ACTIVITY.map((f) => (
              <Pressable
                key={f.id}
                style={styles.activityRow}
                onPress={() => { play(MOCK_TRACK); openNowPlaying(); }}>
                <View style={[styles.friendAvatar, { backgroundColor: f.avatarColor }, f.active && styles.friendAvatarActive]}>
                  <Text style={styles.friendInitials}>{f.initials}</Text>
                  {f.active && <View style={styles.onlineDot} />}
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityUser}>{f.user}</Text>
                  <Text style={styles.activityTrack} numberOfLines={1}>{f.track} · {f.artist}</Text>
                </View>
                <Text style={styles.activityTime}>{f.time}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* History tab */}
        {activeTab === 'history' && (
          <View style={styles.tabContent}>
            {HISTORY.map((h, i) => (
              <Pressable
                key={i}
                style={styles.historyRow}
                onPress={() => { play(MOCK_TRACK); openNowPlaying(); }}>
                <View style={styles.historyThumb} />
                <View style={styles.historyInfo}>
                  <Text style={styles.historyTitle}>{h.title}</Text>
                  <Text style={styles.historyArtist}>{h.artist}</Text>
                </View>
                <Text style={styles.historyTime}>{h.time}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Following tab */}
        {activeTab === 'following' && (
          <View style={styles.tabContent}>
            {FOLLOWING.map((f) => (
              <View key={f.user} style={styles.followingRow}>
                <View style={[styles.followingAvatar, { backgroundColor: f.avatarColor }, f.active && styles.followingAvatarActive]}>
                  <Text style={styles.followingInitials}>{f.initials}</Text>
                  {f.active && <View style={styles.onlineDot} />}
                </View>
                <View style={styles.followingInfo}>
                  <Text style={styles.followingUser}>{f.user}</Text>
                  <Text style={styles.followingFollowers}>{f.followers} followers</Text>
                </View>
                <Pressable style={styles.followingBtn}>
                  <Text style={styles.followingBtnText}>Following</Text>
                </Pressable>
              </View>
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
  hero: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  heroActions: {
    alignSelf: 'flex-end',
    paddingBottom: 8,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 46,
    experimental_backgroundImage: 'linear-gradient(135deg, #FF3378, #9B51E0)',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ResonaraTheme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: ResonaraTheme.background,
  },
  avatarText: {
    color: ResonaraTheme.text,
    fontSize: 26,
    fontWeight: '700',
  },
  nowPlayingBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: ResonaraTheme.accentPink,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: ResonaraTheme.background,
  },
  displayName: {
    color: ResonaraTheme.text,
    fontSize: 22,
    fontWeight: '700',
  },
  handle: {
    color: ResonaraTheme.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  bio: {
    color: ResonaraTheme.textSecondary,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statNumber: {
    color: ResonaraTheme.text,
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: ResonaraTheme.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: ResonaraTheme.border,
  },
  profileButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  editBtn: {
    backgroundColor: ResonaraTheme.surface,
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 9,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ResonaraTheme.border,
  },
  editBtnText: {
    color: ResonaraTheme.text,
    fontSize: 14,
    fontWeight: '600',
  },
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: ResonaraTheme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ResonaraTheme.border,
  },
  nowPlayingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: ResonaraTheme.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ResonaraTheme.border,
  },
  nowPlayingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nowPlayingThumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  nowPlayingThumbBg: {
    experimental_backgroundImage: 'linear-gradient(180deg, #3D0C0C, #0D0208)',
  },
  nowPlayingThumbText: {
    color: 'rgba(160,20,20,0.8)',
    fontSize: 11,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  nowPlayingInfo: {
    flex: 1,
  },
  nowPlayingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  nowPlayingLabel: {
    color: ResonaraTheme.accentPink,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  nowPlayingTitle: {
    color: ResonaraTheme.text,
    fontSize: 13,
    fontWeight: '600',
  },
  nowPlayingArtist: {
    color: ResonaraTheme.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ResonaraTheme.border,
    marginTop: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabText: {
    color: ResonaraTheme.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: ResonaraTheme.text,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: ResonaraTheme.text,
    borderRadius: 1,
  },
  tabContent: {
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  tabSectionLabel: {
    color: ResonaraTheme.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ResonaraTheme.border,
  },
  friendAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  friendAvatarActive: {
    borderWidth: 2,
    borderColor: ResonaraTheme.accentPink,
  },
  friendInitials: {
    color: ResonaraTheme.text,
    fontSize: 13,
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: ResonaraTheme.background,
  },
  activityInfo: {
    flex: 1,
  },
  activityUser: {
    color: ResonaraTheme.text,
    fontSize: 13,
    fontWeight: '600',
  },
  activityTrack: {
    color: ResonaraTheme.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  activityTime: {
    color: ResonaraTheme.textMuted,
    fontSize: 11,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ResonaraTheme.border,
  },
  historyThumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: ResonaraTheme.surface,
    borderWidth: 1,
    borderColor: ResonaraTheme.border,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    color: ResonaraTheme.text,
    fontSize: 13,
    fontWeight: '600',
  },
  historyArtist: {
    color: ResonaraTheme.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  historyTime: {
    color: ResonaraTheme.textMuted,
    fontSize: 11,
  },
  followingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ResonaraTheme.border,
  },
  followingAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  followingAvatarActive: {
    borderWidth: 2,
    borderColor: ResonaraTheme.accentPink,
  },
  followingInitials: {
    color: ResonaraTheme.text,
    fontSize: 14,
    fontWeight: '700',
  },
  followingInfo: {
    flex: 1,
  },
  followingUser: {
    color: ResonaraTheme.text,
    fontSize: 14,
    fontWeight: '600',
  },
  followingFollowers: {
    color: ResonaraTheme.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  followingBtn: {
    borderWidth: 1,
    borderColor: ResonaraTheme.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  followingBtnText: {
    color: ResonaraTheme.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
