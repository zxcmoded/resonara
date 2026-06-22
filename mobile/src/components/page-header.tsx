import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type ReactNode } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ResonaraTheme } from '@/constants/theme';

interface Props {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  /** Show a hairline border underneath. Default true. */
  border?: boolean;
}

export function PageHeader({ title, onBack, right, border = true }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 6 },
        border && styles.bordered,
      ]}>
      {/* Left — back button or spacer */}
      <View style={styles.side}>
        {onBack ? (
          <Pressable style={styles.iconBtn} onPress={onBack} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color={ResonaraTheme.text} />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>

      {/* Center — title */}
      <Text style={styles.title} numberOfLines={1}>{title}</Text>

      {/* Right — optional action, or spacer to keep title centred */}
      <View style={styles.side}>
        {right ?? <View style={styles.iconBtn} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    paddingHorizontal: 8,
    backgroundColor: ResonaraTheme.background,
  },
  bordered: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ResonaraTheme.border,
  },
  side: {
    width: 44,
    alignItems: 'center',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: ResonaraTheme.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
