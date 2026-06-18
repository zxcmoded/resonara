import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ResonaraTheme, TAB_BAR_HEIGHT } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import type { Track } from '@/context/player';
import { useCommentsRealtime } from '@/hooks/use-comments-realtime';
import { CommentsService } from '@/services/comments.service';
import { usePlayer } from '@/context/player';

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface Props {
  track: Track;
  sessionId: string;
  onBack: () => void;
  bottomInset: number;
}

export function ListenTogetherView({ track, sessionId, onBack, bottomInset }: Props) {
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isPlaying } = usePlayer();
  const { comments } = useCommentsRealtime(sessionId);
  const progressPercent = track.durationSec > 0
    ? (track.progressSec / track.durationSec) * 100
    : 0;

  async function handleSend() {
    if (!comment.trim() || !user || sending) return;
    setSending(true);
    try {
      await CommentsService.post(sessionId, user.id, comment.trim(), track.progressSec);
      setComment('');
    } catch (e) {
      console.error('Failed to post comment:', e);
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <SymbolView name="chevron.left" size={18} tintColor={ResonaraTheme.text} />
          <Text style={styles.backText}>Back to Stream</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: bottomInset + 60 }}
        showsVerticalScrollIndicator={false}>
        {/* Artist info */}
        <View style={styles.artistRow}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarInitials}>
              {track.artist.substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.artistInfo}>
            <Text style={styles.artistName}>{track.artist}</Text>
            <Text style={styles.listeningTo}>
              Now listening to:{' '}
              <Text style={styles.listeningToLink}>{track.album || track.title}</Text>
            </Text>
          </View>
        </View>

        {/* Album art */}
        <View style={styles.albumArt as any}>
          <View style={styles.albumGradient as any} />
          <View style={styles.albumTextOverlay}>
            <Text style={styles.albumTitleText} numberOfLines={1}>
              {(track.album || track.title).toUpperCase()}
            </Text>
            <Text style={styles.albumArtistText} numberOfLines={1}>
              {track.artist.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Track info */}
        <View style={styles.trackSection}>
          <Text style={styles.trackTitle}>{track.title}</Text>

          {track.durationSec > 0 && (
            <>
              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                </View>
              </View>
              <View style={styles.progressTimes}>
                <Text style={styles.progressTime}>{formatTime(track.progressSec)}</Text>
                <Text style={styles.progressTime}>{formatTime(track.durationSec)}</Text>
              </View>
            </>
          )}
        </View>

        {/* Comments */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsLabel}>
            Comments{comments.length > 0 ? ` (${comments.length})` : ''}
          </Text>
          {comments.length === 0 ? (
            <Text style={styles.noComments}>Be the first to comment!</Text>
          ) : (
            comments.map((c) => (
              <View key={c.id} style={styles.commentRow}>
                <Text style={styles.commentUser}>
                  @{c.profiles?.username ?? c.user_id.substring(0, 8)}:
                </Text>
                <Text style={styles.commentText}> {c.body}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Comment input */}
      <View style={[styles.inputBar, { paddingBottom: Math.max(bottomInset - TAB_BAR_HEIGHT, 8) }]}>
        <TextInput
          style={styles.commentInput}
          placeholder="Comment"
          placeholderTextColor={ResonaraTheme.textMuted}
          value={comment}
          onChangeText={setComment}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <Pressable style={styles.sendButton} onPress={handleSend} disabled={sending || !comment.trim()}>
          <SymbolView
            name="arrow.up.circle.fill"
            size={26}
            tintColor={comment.trim() ? ResonaraTheme.accent : ResonaraTheme.textMuted}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ResonaraTheme.background },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { color: ResonaraTheme.text, fontSize: 16, fontWeight: '500' },
  scrollView: { flex: 1 },
  artistRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingBottom: 12, gap: 10,
  },
  avatarSmall: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: ResonaraTheme.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { color: ResonaraTheme.text, fontSize: 12, fontWeight: '700' },
  artistInfo: { flex: 1 },
  artistName: { color: ResonaraTheme.text, fontSize: 15, fontWeight: '700' },
  listeningTo: { color: ResonaraTheme.textSecondary, fontSize: 12, marginTop: 2 },
  listeningToLink: { color: ResonaraTheme.accent, textDecorationLine: 'underline' },
  albumArt: {
    width: '100%', aspectRatio: 1, backgroundColor: '#2A0A0A',
    justifyContent: 'flex-end', overflow: 'hidden',
  },
  albumGradient: {
    ...StyleSheet.absoluteFill,
    experimental_backgroundImage: 'linear-gradient(180deg, #3D0C0C 0%, #1A0404 70%, #0D0208 100%)',
  },
  albumTextOverlay: { padding: 20 },
  albumTitleText: {
    color: 'rgba(160, 20, 20, 0.7)', fontSize: 72, fontWeight: '900',
    fontStyle: 'italic', letterSpacing: -4, lineHeight: 72,
  },
  albumArtistText: {
    color: 'rgba(255,255,255,0.35)', fontSize: 15, fontWeight: '700',
    letterSpacing: 5, textTransform: 'uppercase', marginTop: 4,
  },
  trackSection: { paddingHorizontal: 16, paddingTop: 14 },
  trackTitle: { color: ResonaraTheme.text, fontSize: 14, fontWeight: '700', lineHeight: 20, marginBottom: 10 },
  progressRow: { marginBottom: 4 },
  progressTrack: {
    height: 3, backgroundColor: ResonaraTheme.progressTrack, borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: ResonaraTheme.accent, borderRadius: 2 },
  progressTimes: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12,
  },
  progressTime: { color: ResonaraTheme.textSecondary, fontSize: 11 },
  commentsSection: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  commentsLabel: { color: ResonaraTheme.text, fontSize: 14, fontWeight: '600', marginBottom: 10 },
  noComments: { color: ResonaraTheme.textMuted, fontSize: 13 },
  commentRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  commentUser: { color: ResonaraTheme.text, fontSize: 13, fontWeight: '600' },
  commentText: { color: ResonaraTheme.textSecondary, fontSize: 13, flex: 1 },
  inputBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: ResonaraTheme.border,
    backgroundColor: ResonaraTheme.background, gap: 10,
  },
  commentInput: {
    flex: 1, height: 40, backgroundColor: ResonaraTheme.surface,
    borderRadius: 20, paddingHorizontal: 16, color: ResonaraTheme.text,
    fontSize: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: ResonaraTheme.border,
  },
  sendButton: { padding: 2 },
});
