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

import { ResonaraTheme, TAB_BAR_HEIGHT } from '@/constants/theme';
import { usePlayer, type Track } from '@/context/player';

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const ALL_LIVE_COMMENTS = [
  { id: '1', user: 'selenagomez', text: 'WE GOT LOST IN TRANSLATION!!!!!' },
  { id: '2', user: 'traviskelce', text: 'Maybe I asked for too much...' },
  { id: '3', user: 'andreswift', text: 'and maybe this thing was a masterpiece' },
  { id: '4', user: 'joealwyn', text: 'running scare I was there...' },
  { id: '5', user: 'tomhiddleston', text: 'I remember it ALL TOO WELL!!' },
  { id: '6', user: 'robbyroda', text: 'Anuy aruy agoy agoy' },
  { id: '7', user: 'kayleeortiz', text: '😭😭😭' },
  { id: '8', user: 'musiclover99', text: 'this song hits different at 3am' },
];

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

function LiveCommentsOverlay() {
  const [visibleComments, setVisibleComments] = useState<{ id: string; user: string; text: string; key: number }[]>([]);
  const indexRef = useRef(0);
  const keyRef = useRef(0);

  useEffect(() => {
    const addComment = () => {
      const comment = ALL_LIVE_COMMENTS[indexRef.current % ALL_LIVE_COMMENTS.length];
      keyRef.current++;
      setVisibleComments((prev) => {
        const next = [...prev, { ...comment, key: keyRef.current }];
        return next.slice(-5);
      });
      indexRef.current++;
    };

    addComment();
    const interval = setInterval(addComment, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.commentsOverlay} pointerEvents="none">
      {visibleComments.map((c, i) => (
        <FloatingComment
          key={c.key}
          user={c.user}
          text={c.text}
          bottom={20 + i * 38}
        />
      ))}
    </View>
  );
}

interface Props {
  track: Track;
  onBack: () => void;
  onListenTogether: () => void;
}

export function NowPlayingView({ track, onBack, onListenTogether }: Props) {
  const { isPlaying, togglePlay } = usePlayer();
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const insets = useSafeAreaInsets();
  const progressPercent = (track.progressSec / track.durationSec) * 100;

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
            <View style={styles.albumGradient as any} />
            <View style={styles.albumTextOverlay}>
              <Text style={styles.albumTitleText}>RED</Text>
              <Text style={styles.albumArtistText}>TAYLOR SWIFT</Text>
            </View>
          </View>
          <LiveCommentsOverlay />
        </View>

        {/* Track identity row */}
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
        <View style={styles.progressSection}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            <View style={[styles.progressThumb, { left: `${progressPercent}%` }]} />
          </View>
          <View style={styles.progressTimes}>
            <Text style={styles.progressTime}>{formatTime(track.progressSec)}</Text>
            <Text style={styles.progressTime}>{formatTime(track.durationSec)}</Text>
          </View>
        </View>

        {/* Main controls */}
        <View style={styles.controls}>
          <Pressable onPress={() => setShuffle(!shuffle)}>
            <SymbolView name="shuffle" size={22} tintColor={shuffle ? ResonaraTheme.accentPink : ResonaraTheme.textSecondary} />
          </Pressable>
          <Pressable style={styles.controlBtn}>
            <SymbolView name="backward.fill" size={28} tintColor={ResonaraTheme.text} />
          </Pressable>
          <Pressable style={styles.playPauseBtn} onPress={togglePlay}>
            <SymbolView
              name={isPlaying ? 'pause.fill' : 'play.fill'}
              size={30}
              tintColor={ResonaraTheme.text}
            />
          </Pressable>
          <Pressable style={styles.controlBtn}>
            <SymbolView name="forward.fill" size={28} tintColor={ResonaraTheme.text} />
          </Pressable>
          <Pressable onPress={() => setRepeat(!repeat)}>
            <SymbolView name="repeat" size={22} tintColor={repeat ? ResonaraTheme.accentPink : ResonaraTheme.textSecondary} />
          </Pressable>
        </View>

        {/* Actions row */}
        <View style={styles.actionsRow}>
          <Pressable style={styles.actionItem}>
            <SymbolView name="bubble.left" size={22} tintColor={ResonaraTheme.textSecondary} />
            <Text style={styles.actionLabel}>Comment</Text>
          </Pressable>
          <Pressable style={styles.actionItem}>
            <SymbolView name="list.bullet.below.rectangle" size={22} tintColor={ResonaraTheme.textSecondary} />
            <Text style={styles.actionLabel}>Queue</Text>
          </Pressable>
          <Pressable style={styles.actionItem}>
            <SymbolView name="square.and.arrow.up" size={22} tintColor={ResonaraTheme.textSecondary} />
            <Text style={styles.actionLabel}>Share</Text>
          </Pressable>
          <Pressable style={styles.actionItem}>
            <SymbolView name="ellipsis.circle" size={22} tintColor={ResonaraTheme.textSecondary} />
            <Text style={styles.actionLabel}>More</Text>
          </Pressable>
        </View>

        {/* Listen Together button */}
        <View style={styles.listenTogetherContainer}>
          <Pressable style={styles.listenTogetherBtn} onPress={onListenTogether}>
            <SymbolView name="person.2.fill" size={16} tintColor={ResonaraTheme.text} />
            <Text style={styles.listenTogetherText}>Listen Together</Text>
          </Pressable>
        </View>

        {/* Queue preview */}
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

        {/* Comment input */}
        <View style={styles.commentInputRow}>
          <View style={styles.commentAvatar}>
            <Text style={styles.commentAvatarText}>KM</Text>
          </View>
          <TextInput
            style={styles.commentInput}
            placeholder="Drop a live comment..."
            placeholderTextColor={ResonaraTheme.textMuted}
            value={comment}
            onChangeText={setComment}
          />
          <Pressable>
            <SymbolView name="arrow.up.circle.fill" size={28} tintColor={ResonaraTheme.accentPink} />
          </Pressable>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerLabel: {
    color: ResonaraTheme.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  albumContainer: {
    marginHorizontal: 24,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  albumArt: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#2A0808',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  albumGradient: {
    ...StyleSheet.absoluteFill,
    experimental_backgroundImage: 'linear-gradient(180deg, #3D0C0C 0%, #1A0404 65%, #0D0208 100%)',
  },
  albumTextOverlay: {
    padding: 20,
  },
  albumTitleText: {
    color: 'rgba(160, 20, 20, 0.65)',
    fontSize: 90,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -4,
    lineHeight: 80,
  },
  albumArtistText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 5,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  commentsOverlay: {
    ...StyleSheet.absoluteFill,
    paddingHorizontal: 12,
  },
  commentBubble: {
    position: 'absolute',
    left: 12,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: '80%',
  },
  commentBubbleUser: {
    color: ResonaraTheme.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  commentBubbleText: {
    color: ResonaraTheme.text,
    fontSize: 12,
    flexShrink: 1,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 12,
  },
  likeBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackIdentity: {
    flex: 1,
    alignItems: 'center',
  },
  trackTitle: {
    color: ResonaraTheme.text,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },
  trackArtist: {
    color: ResonaraTheme.textSecondary,
    fontSize: 13,
    marginTop: 3,
    textAlign: 'center',
  },
  progressSection: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: ResonaraTheme.progressTrack,
    borderRadius: 2,
    overflow: 'visible',
    marginBottom: 6,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ResonaraTheme.text,
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: ResonaraTheme.text,
    marginLeft: -7,
  },
  progressTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTime: {
    color: ResonaraTheme.textSecondary,
    fontSize: 11,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  controlBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ResonaraTheme.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: ResonaraTheme.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ResonaraTheme.border,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: ResonaraTheme.surface,
  },
  actionItem: {
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    color: ResonaraTheme.textSecondary,
    fontSize: 11,
  },
  listenTogetherContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  listenTogetherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: ResonaraTheme.text,
    borderRadius: 24,
    paddingVertical: 12,
  },
  listenTogetherText: {
    color: ResonaraTheme.text,
    fontSize: 15,
    fontWeight: '600',
  },
  queueSection: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  queueTitle: {
    color: ResonaraTheme.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  queueThumb: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: ResonaraTheme.surface,
    borderWidth: 1,
    borderColor: ResonaraTheme.border,
  },
  queueSong: {
    flex: 1,
    color: ResonaraTheme.textSecondary,
    fontSize: 13,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ResonaraTheme.accentPurple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    color: ResonaraTheme.text,
    fontSize: 11,
    fontWeight: '700',
  },
  commentInput: {
    flex: 1,
    height: 38,
    backgroundColor: ResonaraTheme.surface,
    borderRadius: 19,
    paddingHorizontal: 14,
    color: ResonaraTheme.text,
    fontSize: 13,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ResonaraTheme.border,
  },
});
