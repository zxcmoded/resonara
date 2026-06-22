import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { PageHeader } from '@/components/page-header';
import { ResonaraTheme } from '@/constants/theme';

interface Props {
  bottomInset: number;
}

export function NotificationsScreen({ bottomInset }: Props) {
  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      <PageHeader title="Notifications" />

      <View style={styles.emptyState}>
        <SymbolView name="bell.slash" size={48} tintColor={ResonaraTheme.textMuted} />
        <Text style={styles.emptyTitle}>No notifications yet</Text>
        <Text style={styles.emptySubText}>
          When someone follows you, joins your session, or comments, you'll see it here.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ResonaraTheme.background },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, gap: 12,
  },
  emptyTitle: {
    color: ResonaraTheme.textSecondary, fontSize: 17, fontWeight: '600', textAlign: 'center',
  },
  emptySubText: {
    color: ResonaraTheme.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20,
  },
});
