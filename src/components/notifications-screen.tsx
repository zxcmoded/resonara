import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ResonaraTheme } from '@/constants/theme';
import { usePlayer, MOCK_TRACK } from '@/context/player';

type NotifType = 'follow' | 'listen_together' | 'session_start' | 'comment' | 'like';

const NOTIFICATIONS: {
  id: string;
  type: NotifType;
  user: string;
  initials: string;
  avatarColor: string;
  body: string;
  time: string;
  isNew: boolean;
  actionLabel?: string;
}[] = [
  {
    id: '1',
    type: 'session_start',
    user: 'Taylor Swift',
    initials: 'TS',
    avatarColor: '#3D0C0C',
    body: 'started a listening session — All Too Well (10 Min Version)',
    time: '2m ago',
    isNew: true,
    actionLabel: 'Join',
  },
  {
    id: '2',
    type: 'follow',
    user: 'selenagomez',
    initials: 'SG',
    avatarColor: '#0D1A3D',
    body: 'followed you',
    time: '5m ago',
    isNew: true,
    actionLabel: 'Follow back',
  },
  {
    id: '3',
    type: 'listen_together',
    user: 'traviskelce',
    initials: 'TK',
    avatarColor: '#0D2A1A',
    body: 'joined your Listen Together session',
    time: '12m ago',
    isNew: true,
  },
  {
    id: '4',
    type: 'comment',
    user: 'andreswift',
    initials: 'AS',
    avatarColor: '#2A0D3D',
    body: 'commented on your listening session: "and maybe this thing was a masterpiece"',
    time: '24m ago',
    isNew: true,
  },
  {
    id: '5',
    type: 'follow',
    user: 'harrysstyles',
    initials: 'HS',
    avatarColor: '#1A2A0D',
    body: 'followed you',
    time: '1h ago',
    isNew: false,
    actionLabel: 'Follow back',
  },
  {
    id: '6',
    type: 'like',
    user: 'oliviarodrigo',
    initials: 'OR',
    avatarColor: '#2A1A0D',
    body: 'liked your comment on All Too Well',
    time: '2h ago',
    isNew: false,
  },
  {
    id: '7',
    type: 'session_start',
    user: 'The Weeknd',
    initials: 'TW',
    avatarColor: '#1A0D2A',
    body: 'started a listening session — Blinding Lights',
    time: '3h ago',
    isNew: false,
    actionLabel: 'Join',
  },
  {
    id: '8',
    type: 'follow',
    user: 'taylorswift13',
    initials: 'TS',
    avatarColor: '#3D0C0C',
    body: 'followed you back',
    time: '1d ago',
    isNew: false,
  },
];

function NotifIcon({ type }: { type: NotifType }) {
  const configs: Record<NotifType, { symbol: string; bg: string }> = {
    follow: { symbol: 'person.badge.plus', bg: ResonaraTheme.accent },
    listen_together: { symbol: 'headphones', bg: ResonaraTheme.accentPurple },
    session_start: { symbol: 'waveform', bg: ResonaraTheme.accentPink },
    comment: { symbol: 'bubble.left.fill', bg: '#2196F3' },
    like: { symbol: 'heart.fill', bg: '#E91E63' },
  };
  const cfg = configs[type];
  return (
    <View style={[styles.notifIcon, { backgroundColor: cfg.bg }]}>
      <SymbolView name={cfg.symbol as any} size={12} tintColor="#FFFFFF" />
    </View>
  );
}

interface Props {
  bottomInset: number;
}

export function NotificationsScreen({ bottomInset }: Props) {
  const insets = useSafeAreaInsets();
  const { play, openNowPlaying } = usePlayer();

  const newNotifs = NOTIFICATIONS.filter((n) => n.isNew);
  const earlierNotifs = NOTIFICATIONS.filter((n) => !n.isNew);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.screenTitle}>Notifications</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset }}>
        {/* New section */}
        <View style={styles.group}>
          <Text style={styles.groupLabel}>New</Text>
          {newNotifs.map((n) => (
            <Pressable
              key={n.id}
              style={[styles.notifRow, n.isNew && styles.notifRowNew]}
              onPress={() => {
                if (n.type === 'session_start' || n.type === 'listen_together') {
                  play(MOCK_TRACK);
                  openNowPlaying();
                }
              }}>
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: n.avatarColor }]}>
                  <Text style={styles.avatarText}>{n.initials}</Text>
                </View>
                <NotifIcon type={n.type} />
              </View>
              <View style={styles.notifContent}>
                <Text style={styles.notifBody} numberOfLines={2}>
                  <Text style={styles.notifUser}>{n.user} </Text>
                  {n.body}
                </Text>
                <Text style={styles.notifTime}>{n.time}</Text>
              </View>
              {n.actionLabel && (
                <Pressable style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>{n.actionLabel}</Text>
                </Pressable>
              )}
            </Pressable>
          ))}
        </View>

        {/* Earlier section */}
        <View style={styles.group}>
          <Text style={styles.groupLabel}>Earlier</Text>
          {earlierNotifs.map((n) => (
            <Pressable
              key={n.id}
              style={styles.notifRow}
              onPress={() => {
                if (n.type === 'session_start' || n.type === 'listen_together') {
                  play(MOCK_TRACK);
                  openNowPlaying();
                }
              }}>
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: n.avatarColor }]}>
                  <Text style={styles.avatarText}>{n.initials}</Text>
                </View>
                <NotifIcon type={n.type} />
              </View>
              <View style={styles.notifContent}>
                <Text style={[styles.notifBody, styles.notifBodyRead]} numberOfLines={2}>
                  <Text style={styles.notifUser}>{n.user} </Text>
                  {n.body}
                </Text>
                <Text style={styles.notifTime}>{n.time}</Text>
              </View>
              {n.actionLabel && (
                <Pressable style={styles.actionBtnOutline}>
                  <Text style={styles.actionBtnOutlineText}>{n.actionLabel}</Text>
                </Pressable>
              )}
            </Pressable>
          ))}
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
  },
  screenTitle: {
    color: ResonaraTheme.text,
    fontSize: 28,
    fontWeight: '700',
  },
  group: {
    paddingTop: 16,
  },
  groupLabel: {
    color: ResonaraTheme.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  notifRowNew: {
    backgroundColor: 'rgba(91,141,239,0.06)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: ResonaraTheme.text,
    fontSize: 14,
    fontWeight: '700',
  },
  notifIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: ResonaraTheme.background,
  },
  notifContent: {
    flex: 1,
    paddingTop: 2,
  },
  notifBody: {
    color: ResonaraTheme.text,
    fontSize: 13,
    lineHeight: 18,
  },
  notifBodyRead: {
    color: ResonaraTheme.textSecondary,
  },
  notifUser: {
    fontWeight: '700',
    color: ResonaraTheme.text,
  },
  notifTime: {
    color: ResonaraTheme.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  actionBtn: {
    backgroundColor: ResonaraTheme.accent,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignSelf: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnOutline: {
    borderWidth: 1,
    borderColor: ResonaraTheme.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignSelf: 'center',
  },
  actionBtnOutlineText: {
    color: ResonaraTheme.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
