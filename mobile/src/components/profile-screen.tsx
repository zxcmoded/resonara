import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EditProfileModal } from '@/components/edit-profile-modal';
import { PageHeader } from '@/components/page-header';
import { ResonaraTheme } from '@/constants/theme';
import { useErrorAlert } from '@/hooks/use-error-alert';
import { useAuth } from '@/context/auth';
import { usePlayer } from '@/context/player';
import { FollowsService } from '@/services/follows.service';
import { SessionsService, type FeedSession } from '@/services/sessions.service';
import type { Profile } from '@/types/database';

type ProfileTab = 'activity' | 'history' | 'following';

function initials(name: string) {
  return name.split(' ').map((w) => w[0]?.toUpperCase() ?? '').slice(0, 2).join('');
}

interface Props {
  bottomInset: number;
}

export function ProfileScreen({ bottomInset }: Props) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('activity');
  const [feedSessions, setFeedSessions] = useState<FeedSession[]>([]);
  const [following, setFollowing] = useState<Profile[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const { user, signOut } = useAuth();
  const { currentTrack, isPlaying, openNowPlaying, stop } = usePlayer();

  function confirmSignOut() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await stop();   // stop audio before clearing session
            await signOut();
          },
        },
      ]
    );
  }

  const TABS: { id: ProfileTab; label: string }[] = [
    { id: 'activity', label: 'Activity' },
    { id: 'history', label: 'History' },
    { id: 'following', label: 'Following' },
  ];

  const { handleError } = useErrorAlert();

  useEffect(() => {
    if (activeTab === 'activity' && user) {
      setLoadingFeed(true);
      SessionsService.getFollowingFeed(user.id)
        .then(setFeedSessions)
        .catch((e) => handleError(e, 'Failed to load activity. Please try again.'))
        .finally(() => setLoadingFeed(false));
    }
    if (activeTab === 'following' && user) {
      setLoadingFollowing(true);
      FollowsService.getFollowing(user.id)
        .then(setFollowing)
        .catch((e) => handleError(e, 'Failed to load following list. Please try again.'))
        .finally(() => setLoadingFollowing(false));
    }
  }, [activeTab, user]);

  const userInitials = user?.name ? initials(user.name) : '?';

  return (
    <View style={styles.container}>
      <EditProfileModal visible={showEditProfile} onClose={() => setShowEditProfile(false)} />

      {/* Consistent top nav — logout on the right */}
      <PageHeader
        title="Profile"
        right={
          <Pressable style={styles.headerLogoutBtn} onPress={confirmSignOut} hitSlop={8}>
            <Ionicons name="log-out-outline" size={22} color={ResonaraTheme.accentPink} />
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset }}>
        {/* Hero — remove duplicate top spacing since PageHeader provides it */}
        <View style={styles.hero}>

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarRing as any}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{userInitials}</Text>
                </View>
              )}
            </View>
            {isPlaying && (
              <View style={styles.nowPlayingBadge}>
                <SymbolView name="waveform" size={10} tintColor="#FFFFFF" />
              </View>
            )}
          </View>

          <Text style={styles.displayName}>{user?.name ?? 'User'}</Text>
          <Text style={styles.handle}>@{user?.username ?? user?.email?.split('@')[0] ?? ''}</Text>

          <View style={styles.profileButtons}>
            <Pressable style={styles.editBtn} onPress={() => setShowEditProfile(true)}>
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </Pressable>
            <Pressable style={styles.logoutBtn} onPress={confirmSignOut} hitSlop={8}>
              <Ionicons name="log-out-outline" size={22} color={ResonaraTheme.accentPink} />
            </Pressable>
          </View>
        </View>

        {/* Currently playing card */}
        {currentTrack && (
          <Pressable style={styles.nowPlayingCard} onPress={openNowPlaying}>
            <View style={styles.nowPlayingLeft}>
              <View style={styles.nowPlayingThumb}>
                <Text style={styles.nowPlayingThumbText} numberOfLines={1}>
                  {currentTrack.album?.slice(0, 3).toUpperCase() ?? '♪'}
                </Text>
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

        {/* Activity */}
        {activeTab === 'activity' && (
          <View style={styles.tabContent}>
            {loadingFeed ? (
              <ActivityIndicator style={styles.loader} color={ResonaraTheme.accent} />
            ) : feedSessions.length === 0 ? (
              <View style={styles.emptyState}>
                <SymbolView name="music.note" size={36} tintColor={ResonaraTheme.textMuted} />
                <Text style={styles.emptyText}>No activity yet</Text>
                <Text style={styles.emptySubText}>Follow people to see what they're listening to</Text>
              </View>
            ) : (
              feedSessions.map((s) => {
                const t = s.tracks;
                const p = s.profiles;
                return (
                  <View key={s.id} style={styles.activityRow}>
                    <View style={styles.friendAvatar}>
                      <Text style={styles.friendInitials}>{initials(p.username)}</Text>
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityUser}>@{p.username}</Text>
                      <Text style={styles.activityTrack} numberOfLines={1}>
                        {t?.title ?? 'Unknown'} · {t?.artist ?? ''}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <View style={styles.emptyState}>
            <SymbolView name="clock" size={36} tintColor={ResonaraTheme.textMuted} />
            <Text style={styles.emptyText}>No history yet</Text>
            <Text style={styles.emptySubText}>Your listening history will appear here</Text>
          </View>
        )}

        {/* Following */}
        {activeTab === 'following' && (
          <View style={styles.tabContent}>
            {loadingFollowing ? (
              <ActivityIndicator style={styles.loader} color={ResonaraTheme.accent} />
            ) : following.length === 0 ? (
              <View style={styles.emptyState}>
                <SymbolView name="person.2" size={36} tintColor={ResonaraTheme.textMuted} />
                <Text style={styles.emptyText}>Not following anyone yet</Text>
                <Text style={styles.emptySubText}>Search for people to follow</Text>
              </View>
            ) : (
              following.map((f) => (
                <View key={f.id} style={styles.followingRow}>
                  {f.avatar_url ? (
                    <Image source={{ uri: f.avatar_url }} style={styles.followingAvatarImg} />
                  ) : (
                    <View style={styles.followingAvatar}>
                      <Text style={styles.followingInitials}>{initials(f.username)}</Text>
                    </View>
                  )}
                  <View style={styles.followingInfo}>
                    <Text style={styles.followingUser}>@{f.username}</Text>
                    {f.full_name && <Text style={styles.followingName}>{f.full_name}</Text>}
                  </View>
                  <Pressable style={styles.followingBtn}>
                    <Text style={styles.followingBtnText}>Following</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ResonaraTheme.background },
  hero: { alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  heroActions: { alignSelf: 'flex-end', paddingBottom: 8 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatarRing: {
    padding: 3, borderRadius: 46,
    experimental_backgroundImage: 'linear-gradient(135deg, #FF3378, #9B51E0)',
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: ResonaraTheme.surface, justifyContent: 'center', alignItems: 'center',
  },
  avatarImg: { width: 80, height: 80, borderRadius: 40 },
  avatarText: { color: ResonaraTheme.text, fontSize: 24, fontWeight: '700' },
  nowPlayingBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: ResonaraTheme.accentPink,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: ResonaraTheme.background,
  },
  headerLogoutBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1, borderColor: ResonaraTheme.accentPink,
    justifyContent: 'center', alignItems: 'center',
  },
  displayName: { color: ResonaraTheme.text, fontSize: 20, fontWeight: '700', marginBottom: 2 },
  handle: { color: ResonaraTheme.textSecondary, fontSize: 14, marginBottom: 16 },
  profileButtons: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  editBtn: {
    borderWidth: 1, borderColor: ResonaraTheme.border, borderRadius: 20,
    paddingHorizontal: 24, paddingVertical: 8,
  },
  editBtnText: { color: ResonaraTheme.text, fontSize: 14, fontWeight: '600' },
  logoutBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1, borderColor: ResonaraTheme.accentPink,
    justifyContent: 'center', alignItems: 'center',
  },
  nowPlayingCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginVertical: 8, padding: 12,
    backgroundColor: ResonaraTheme.surface, borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth, borderColor: ResonaraTheme.border,
  },
  nowPlayingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  nowPlayingThumb: {
    width: 44, height: 44, borderRadius: 8,
    backgroundColor: '#2A0808', justifyContent: 'center', alignItems: 'center',
  },
  nowPlayingThumbText: { color: 'rgba(160,20,20,0.8)', fontSize: 10, fontWeight: '900' },
  nowPlayingInfo: { flex: 1 },
  nowPlayingLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  nowPlayingLabel: { color: ResonaraTheme.accentPink, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  nowPlayingTitle: { color: ResonaraTheme.text, fontSize: 13, fontWeight: '600' },
  nowPlayingArtist: { color: ResonaraTheme.textSecondary, fontSize: 11, marginTop: 1 },
  tabBar: {
    flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ResonaraTheme.border, marginTop: 8,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, position: 'relative' },
  tabText: { color: ResonaraTheme.textMuted, fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: ResonaraTheme.text, fontWeight: '700' },
  tabIndicator: {
    position: 'absolute', bottom: 0, left: 16, right: 16,
    height: 2, backgroundColor: ResonaraTheme.text, borderRadius: 1,
  },
  tabContent: { paddingTop: 4 },
  loader: { marginTop: 40 },
  emptyState: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 32, gap: 8 },
  emptyText: { color: ResonaraTheme.textSecondary, fontSize: 15, fontWeight: '600', textAlign: 'center' },
  emptySubText: { color: ResonaraTheme.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 18 },
  activityRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  friendAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: ResonaraTheme.surface, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: ResonaraTheme.border,
  },
  friendInitials: { color: ResonaraTheme.text, fontSize: 13, fontWeight: '700' },
  activityInfo: { flex: 1 },
  activityUser: { color: ResonaraTheme.text, fontSize: 14, fontWeight: '600' },
  activityTrack: { color: ResonaraTheme.textSecondary, fontSize: 12, marginTop: 2 },
  followingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, gap: 12,
  },
  followingAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: ResonaraTheme.surface, justifyContent: 'center', alignItems: 'center',
  },
  followingAvatarImg: { width: 44, height: 44, borderRadius: 22 },
  followingInitials: { color: ResonaraTheme.text, fontSize: 14, fontWeight: '700' },
  followingInfo: { flex: 1 },
  followingUser: { color: ResonaraTheme.text, fontSize: 14, fontWeight: '600' },
  followingName: { color: ResonaraTheme.textSecondary, fontSize: 12, marginTop: 1 },
  followingBtn: {
    borderWidth: 1, borderColor: ResonaraTheme.border, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  followingBtnText: { color: ResonaraTheme.textSecondary, fontSize: 12, fontWeight: '600' },
  signOutSection: {
    marginTop: 24,
    marginHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: ResonaraTheme.border,
    paddingTop: 8,
    paddingBottom: 16,
  },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  signOutText: {
    color: ResonaraTheme.accentPink,
    fontSize: 15,
    fontWeight: '600',
  },
});
