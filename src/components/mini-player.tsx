import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ResonaraTheme } from '@/constants/theme';
import { usePlayer } from '@/context/player';

export function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlay, openNowPlaying } = usePlayer();

  if (!currentTrack) return null;

  return (
    <Pressable style={styles.container} onPress={openNowPlaying}>
      {/* Progress bar at top */}
      <View style={styles.progressStrip}>
        <View style={[styles.progressFill, { width: `${(currentTrack.progressSec / currentTrack.durationSec) * 100}%` }]} />
      </View>

      <View style={styles.inner}>
        {/* Album thumb */}
        <View style={styles.thumb as any}>
          <Text style={styles.thumbText}>RED</Text>
        </View>

        {/* Track info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            style={styles.controlBtn}
            onPress={(e) => { e.stopPropagation(); togglePlay(); }}>
            <SymbolView
              name={isPlaying ? 'pause.fill' : 'play.fill'}
              size={20}
              tintColor={ResonaraTheme.text}
            />
          </Pressable>
          <Pressable
            style={styles.controlBtn}
            onPress={(e) => e.stopPropagation()}>
            <SymbolView name="forward.fill" size={18} tintColor={ResonaraTheme.text} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ResonaraTheme.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: ResonaraTheme.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ResonaraTheme.border,
  },
  progressStrip: {
    height: 2,
    backgroundColor: ResonaraTheme.progressTrack,
  },
  progressFill: {
    height: '100%',
    backgroundColor: ResonaraTheme.accentPink,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#2A0808',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    experimental_backgroundImage: 'linear-gradient(180deg, #3D0C0C, #0D0208)',
  },
  thumbText: {
    color: 'rgba(160,20,20,0.7)',
    fontSize: 8,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  info: {
    flex: 1,
  },
  title: {
    color: ResonaraTheme.text,
    fontSize: 13,
    fontWeight: '600',
  },
  artist: {
    color: ResonaraTheme.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
