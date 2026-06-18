import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Image } from 'expo-image';
import { ResonaraTheme, TAB_BAR_HEIGHT } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { usePlayer, type Track } from '@/context/player';
import { useCommentsRealtime, type CommentWithProfile } from '@/hooks/use-comments-realtime';
import { CommentsService } from '@/services/comments.service';

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function FloatingComment({ text, user, bottom }: { text: string; user: string; bottom: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(3500),
      Animated.timing(opacity, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
    Animated.timing(translateY, { toValue: -50, duration: 5000, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.commentBubble, { bottom, opacity, transform: [{ translateY }] }]}>
      <Text style={styles.commentBubbleUser}>@{user}</Text>
      <Text style={styles.commentBubbleText}> {text}</Text>
    </Animated.View>
  );
}

function LiveCommentsOverlay({ sessionId, progressSec }: { sessionId: string | null; progressSec: number }) {
  const { comments } = useCommentsRealtime(sessionId);
  const [visible, setVisible] = useState<(CommentWithProfile & { key: number })[]>([]);
  const seenIds = useRef(new Set<string>());
  const keyRef = useRef(0);

  useEffect(() => {
    const newOnes = comments.filter((c) => !seenIds.current.has(c.id));
    if (newOnes.length === 0) return;
    newOnes.forEach((c) => seenIds.current.add(c.id));
    keyRef.current++;
    setVisible((prev) => [...prev, ...newOnes.map((c) => ({ ...c, key: keyRef.current++ }))].slice(-5));
  }, [comments]);

  if (!sessionId) return null;

  return (
    <View style={styles.commentsOverlay} pointerEvents="none">
      {visible.map((c, i) => (
        <FloatingComment
          key={c.key}
          user={c.profiles?.username ?? c.user_id.substring(0, 8)}
          text={c.body}
          bottom={20 + i * 38}
        />
      ))}
    </View>
  );
}

interface Props {
  track: Track;
  sessionId: string | null;
  onBack: () => void;
  onListenTogether: () => void;
}

export function NowPlayingView({ track, sessionId, onBack, onListenTogether }: Props) {
  const { isPlaying, progressSec, durationSec, togglePlay, seekTo } = usePlayer();
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const insets = useSafeAreaInsets();

  // Use live values from expo-av; fall back to track metadata while loading
  const liveDuration = durationSec > 0 ? durationSec : track.durationSec;
  const liveProgress = progressSec;
  const progressPercent = liveDuration > 0 ? (liveProgress / liveDuration) * 100 : 0;

  const userInitials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  async function handleSendComment() {
    if (!comment.trim() || !user || !sessionId || sending) return;
    setSending(true);
    try {
      await CommentsService.post(sessionId, user.id, comment.trim(), liveProgress);
      setComment('');
    } catch (e) {
      console.error('Failed to post comment:', e);
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerBtn} onPress={onBack}>
          <SymbolView name="chevron.down" size={20} tintColor={ResonaraTheme.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>NOW PLAYING</Text>
        </View>
        <Pressable style={styles.headerBtn}>
          <SymbolView name="ellipsis" size={20} tintColor={ResonaraTheme.text} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 16 }}>
        {/* Album art with live comments */}
        <View style={styles.albumContainer}>
          <View style={styles.albumArt as any}>
            {track.artworkUrl ? (
              <Image source={{ uri: track.artworkUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
            ) : (
              <>
                <View style={styles.albumGradient as any} />
                <View style={styles.albumTextOverlay}>
                  <Text style={styles.albumTitleText} numberOfLines={1}>
                    {(track.album || track.title).toUpperCase()}
                  </Text>
                  <Text style={styles.albumArtistText} numberOfLines={1}>
                    {track.artist.toUpperCase()}
                  </Text>
                </View>
              </>
            )}
          </View>
          <LiveCommentsOverlay sessionId={sessionId} progressSec={liveProgress} />
        </View>

        {/* Track identity */}
        <View style={styles.trackRow}>
          <Pressable style={styles.likeBtn} onPress={() => setLiked(!liked)}>
            <SymbolView
              name={liked ? 'heart.fill' : 'heart'}
              size={24}
              tintColor={liked ? ResonaraTheme.accentPink : ResonaraTheme.textSecondary}
            />
          </Pressable>
          <View style={styles.trackIdentity}>
            <Text style={styles.trackTitle} numberOfLines={2}>{track.title}</Text>
            <Text style={styles.trackArtist}>{track.artist}</Text>
          </View>
          <Pressable style={styles.likeBtn}>
            <SymbolView name="plus.circle" size={24} tintColor={ResonaraTheme.textSecondary} />
          </Pressable>
        </View>

        {/* Progress */}
        {liveDuration > 0 && (
          <View style={styles.progressSection}>
            <Pressable
              style={styles.progressTrack}
              onPress={(e) => {
                // Tap-to-seek: calculate position from touch X relative to bar width
                const { locationX, target } = e.nativeEvent;
                // We don't have the bar width here, so use a rough estimate via layout
                seekTo(Math.floor((locationX / 300) * liveDuration));
              }}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              <View style={[styles.progressThumb, { left: `${progressPercent}%` }]} />
            </Pressable>
            <View style={styles.progressTimes}>
              <Text style={styles.progressTime}>{formatTime(liveProgress)}</Text>
              <Text style={styles.progressTime}>{formatTime(liveDuration)}</Text>
            </View>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable onPress={() => setShuffle(!shuffle)}>
            <SymbolView name="shuffle" size={22} tintColor={shuffle ? ResonaraTheme.accentPink : ResonaraTheme.textSecondary} />
          </Pressable>
          <Pressable style={styles.controlBtn}>
            <SymbolView name="backward.fill" size={28} tintColor={ResonaraTheme.text} />
          </Pressable>
          <Pressable style={styles.playPauseBtn} onPress={togglePlay}>
            <SymbolView name={isPlaying ? 'pause.fill' : 'play.fill'} size={30} tintColor={ResonaraTheme.text} />
          </Pressable>
          <Pressable style={styles.controlBtn}>
            <SymbolView name="forward.fill" size={28} tintColor={ResonaraTheme.text} />
          </Pressable>
          <Pressable onPress={() => setRepeat(!repeat)}>
            <SymbolView name="repeat" size={22} tintColor={repeat ? ResonaraTheme.accentPink : ResonaraTheme.textSecondary} />
          </Pressable>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          {[
            { icon: 'bubble.left', label: 'Comment' },
            { icon: 'list.bullet.below.rectangle', label: 'Queue' },
            { icon: 'square.and.arrow.up', label: 'Share' },
            { icon: 'ellipsis.circle', label: 'More' },
          ].map(({ icon, label }) => (
            <Pressable key={label} style={styles.actionItem}>
              <SymbolView name={icon as any} size={22} tintColor={ResonaraTheme.textSecondary} />
              <Text style={styles.actionLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Listen Together */}
        <View style={styles.listenTogetherContainer}>
          <Pressable style={styles.listenTogetherBtn} onPress={onListenTogether}>
            <SymbolView name="person.2.fill" size={16} tintColor={ResonaraTheme.text} />
            <Text style={styles.listenTogetherText}>Listen Together</Text>
          </Pressable>
        </View>

        {/* Queue */}
        {track.queue.length > 0 && (
          <View style={styles.queueSection}>
            <Text style={styles.queueTitle}>Next Up</Text>
            {track.queue.map((song, i) => (
              <View key={i} style={styles.queueItem}>
                <View style={styles.queueThumb} />
                <Text style={styles.queueSong} numberOfLines={1}>{song}</Text>
                <SymbolView name="line.3.horizontal" size={16} tintColor={ResonaraTheme.textMuted} />
              </View>
            ))}
          </View>
        )}

        {/* Comment input (only when in a session) */}
        {sessionId && (
          <View style={styles.commentInputRow}>
            <View style={styles.commentAvatar}>
              <Text style={styles.commentAvatarText}>{userInitials}</Text>
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Drop a live comment..."
              placeholderTextColor={ResonaraTheme.textMuted}
              value={comment}
              onChangeText={setComment}
              returnKeyType="send"
              onSubmitEditing={handleSendComment}
            />
            <Pressable onPress={handleSendComment} disabled={sending || !comment.trim()}>
              <SymbolView
                name="arrow.up.circle.fill"
                size={28}
                tintColor={comment.trim() ? ResonaraTheme.accentPink : ResonaraTheme.textMuted}
              />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ResonaraTheme.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerLabel: { color: ResonaraTheme.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  albumContainer: { marginHorizontal: 24, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  albumArt: { width: '100%', aspectRatio: 1, backgroundColor: '#2A0808', justifyContent: 'flex-end', overflow: 'hidden' },
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
  commentsOverlay: { ...StyleSheet.absoluteFill, paddingHorizontal: 12 },
  commentBubble: {
    position: 'absolute', left: 12, flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 6, maxWidth: '80%',
  },
  commentBubbleUser: { color: ResonaraTheme.accent, fontSize: 12, fontWeight: '700' },
  commentBubbleText: { color: ResonaraTheme.text, fontSize: 12, flexShrink: 1 },
  trackRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8, gap: 12,
  },
  likeBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  trackIdentity: { flex: 1, alignItems: 'center' },
  trackTitle: { color: ResonaraTheme.text, fontSize: 15, fontWeight: '700', textAlign: 'center', lineHeight: 20 },
  trackArtist: { color: ResonaraTheme.textSecondary, fontSize: 13, marginTop: 3, textAlign: 'center' },
  progressSection: { paddingHorizontal: 24, paddingBottom: 8 },
  progressTrack: {
    height: 4, backgroundColor: ResonaraTheme.progressTrack, borderRadius: 2,
    overflow: 'visible', marginBottom: 6, position: 'relative',
  },
  progressFill: { height: '100%', backgroundColor: ResonaraTheme.text, borderRadius: 2 },
  progressThumb: {
    position: 'absolute', top: -5, width: 14, height: 14,
    borderRadius: 7, backgroundColor: ResonaraTheme.text, marginLeft: -7,
  },
  progressTimes: { flexDirection: 'row', justifyContent: 'space-between' },
  progressTime: { color: ResonaraTheme.textSecondary, fontSize: 11 },
  controls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 32, paddingVertical: 12,
  },
  controlBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  playPauseBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: ResonaraTheme.text, justifyContent: 'center', alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: ResonaraTheme.border,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: ResonaraTheme.border,
    marginHorizontal: 16, borderRadius: 12, backgroundColor: ResonaraTheme.surface,
  },
  actionItem: { alignItems: 'center', gap: 4 },
  actionLabel: { color: ResonaraTheme.textSecondary, fontSize: 11 },
  listenTogetherContainer: { paddingHorizontal: 24, paddingVertical: 16 },
  listenTogetherBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: ResonaraTheme.text, borderRadius: 24, paddingVertical: 12,
  },
  listenTogetherText: { color: ResonaraTheme.text, fontSize: 15, fontWeight: '600' },
  queueSection: { paddingHorizontal: 24, paddingBottom: 8 },
  queueTitle: {
    color: ResonaraTheme.textSecondary, fontSize: 12, fontWeight: '700',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10,
  },
  queueItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  queueThumb: {
    width: 40, height: 40, borderRadius: 4,
    backgroundColor: ResonaraTheme.surface, borderWidth: 1, borderColor: ResonaraTheme.border,
  },
  queueSong: { flex: 1, color: ResonaraTheme.textSecondary, fontSize: 13 },
  commentInputRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 12, gap: 10,
  },
  commentAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: ResonaraTheme.accentPurple, justifyContent: 'center', alignItems: 'center',
  },
  commentAvatarText: { color: ResonaraTheme.text, fontSize: 11, fontWeight: '700' },
  commentInput: {
    flex: 1, height: 38, backgroundColor: ResonaraTheme.surface,
    borderRadius: 19, paddingHorizontal: 14, color: ResonaraTheme.text,
    fontSize: 13, borderWidth: StyleSheet.hairlineWidth, borderColor: ResonaraTheme.border,
  },
});
