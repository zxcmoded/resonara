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
import type { Track } from '@/context/player';

const COMMENTS = [
  { id: '1', user: 'Selena Gomez', text: 'WE GOT LOST IN TRANSLATION!!!!!' },
  { id: '2', user: 'Travis Kelce', text: 'Maybe I asked for too much...' },
  { id: '3', user: 'Andrea Swift', text: 'and maybe this thing was a masterpiece til you tore it all up' },
  { id: '4', user: 'Joe Alwyn', text: 'running scare I was there...' },
  { id: '5', user: 'Tom Hiddleson', text: 'I remember it ALL TOO WELL!!' },
  { id: '6', user: 'Robby Roda', text: 'Anuy aruy agoy agoy' },
];

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface Props {
  track: Track;
  onBack: () => void;
  bottomInset: number;
}

export function ListenTogetherView({ track, onBack, bottomInset }: Props) {
  const [comment, setComment] = useState('');
  const insets = useSafeAreaInsets();
  const progressPercent = (track.progressSec / track.durationSec) * 100;

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
            <Text style={styles.avatarInitials}>TS</Text>
          </View>
          <View style={styles.artistInfo}>
            <View style={styles.artistNameRow}>
              <Text style={styles.artistName}>{track.artist}</Text>
              {track.artistVerified && (
                <SymbolView name="checkmark.seal.fill" size={14} tintColor={ResonaraTheme.verified} />
              )}
            </View>
            <Text style={styles.listeningTo}>
              Now listening to:{' '}
              <Text style={styles.listeningToLink}>{track.album}</Text>
              {' '}by{' '}
              <Text style={styles.listeningToLink}>{track.albumArtist ?? track.artist}</Text>
            </Text>
          </View>
        </View>

        {/* Album art */}
        <View style={styles.albumArt as any}>
          <View style={styles.albumGradient as any} />
          <View style={styles.albumTextOverlay}>
            <Text style={styles.albumTitleText}>RED</Text>
            <Text style={styles.albumArtistText}>TAYLOR SWIFT</Text>
          </View>
        </View>

        {/* Track title */}
        <View style={styles.trackSection}>
          <Text style={styles.trackTitle}>{track.title}</Text>

          {/* Progress bar */}
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>
          <View style={styles.progressTimes}>
            <Text style={styles.progressTime}>{formatTime(track.progressSec)}</Text>
            <Text style={styles.progressTime}>{formatTime(track.durationSec)}</Text>
          </View>

          {/* Queue items */}
          {track.queue.map((song, i) => (
            <View key={i} style={styles.queueRow}>
              <SymbolView name="text.justify" size={14} tintColor={ResonaraTheme.textSecondary} />
              <Text style={styles.queueSong} numberOfLines={1}>{song}</Text>
            </View>
          ))}

          <View style={styles.queueRow}>
            <SymbolView name="plus.circle" size={14} tintColor={ResonaraTheme.textSecondary} />
            <Text style={styles.queueSong}>Add song to playlist</Text>
          </View>
        </View>

        {/* Comments section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsLabel}>Comments:</Text>
          {COMMENTS.map((c) => (
            <View key={c.id} style={styles.commentRow}>
              <Text style={styles.commentUser}>{c.user}:</Text>
              <Text style={styles.commentText}> {c.text}</Text>
            </View>
          ))}
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
        />
        <Pressable style={styles.sendButton}>
          <SymbolView name="arrow.up.circle.fill" size={26} tintColor={ResonaraTheme.accent} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ResonaraTheme.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    color: ResonaraTheme.text,
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ResonaraTheme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: ResonaraTheme.text,
    fontSize: 12,
    fontWeight: '700',
  },
  artistInfo: {
    flex: 1,
  },
  artistNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  artistName: {
    color: ResonaraTheme.text,
    fontSize: 15,
    fontWeight: '700',
  },
  listeningTo: {
    color: ResonaraTheme.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  listeningToLink: {
    color: ResonaraTheme.accent,
    textDecorationLine: 'underline',
  },
  albumArt: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#2A0A0A',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  albumGradient: {
    ...StyleSheet.absoluteFill,
    experimental_backgroundImage: 'linear-gradient(180deg, #3D0C0C 0%, #1A0404 70%, #0D0208 100%)',
  },
  albumTextOverlay: {
    padding: 20,
  },
  albumTitleText: {
    color: 'rgba(160, 20, 20, 0.7)',
    fontSize: 80,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -4,
    lineHeight: 72,
  },
  albumArtistText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 5,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  trackSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  trackTitle: {
    color: ResonaraTheme.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 10,
  },
  progressRow: {
    marginBottom: 4,
  },
  progressTrack: {
    height: 3,
    backgroundColor: ResonaraTheme.progressTrack,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ResonaraTheme.accent,
    borderRadius: 2,
  },
  progressTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressTime: {
    color: ResonaraTheme.textSecondary,
    fontSize: 11,
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  queueSong: {
    color: ResonaraTheme.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  commentsLabel: {
    color: ResonaraTheme.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  commentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  commentUser: {
    color: ResonaraTheme.text,
    fontSize: 13,
    fontWeight: '600',
  },
  commentText: {
    color: ResonaraTheme.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: ResonaraTheme.border,
    backgroundColor: ResonaraTheme.background,
    gap: 10,
  },
  commentInput: {
    flex: 1,
    height: 40,
    backgroundColor: ResonaraTheme.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    color: ResonaraTheme.text,
    fontSize: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ResonaraTheme.border,
  },
  sendButton: {
    padding: 2,
  },
});
