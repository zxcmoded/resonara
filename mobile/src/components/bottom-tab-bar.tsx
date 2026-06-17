import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ResonaraTheme, TAB_BAR_HEIGHT } from '@/constants/theme';

export type Tab =
  | 'search'
  | 'library'
  | 'timeline'
  | 'notifications'
  | 'profile';

const TABS: {
  id: Tab;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'search', icon: 'search' },
  { id: 'library', icon: 'list' },
  { id: 'timeline', icon: 'pulse' },
  { id: 'notifications', icon: 'notifications' },
  { id: 'profile', icon: 'person' },
];

interface Props {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  bottomInset: number;
}

export function BottomTabBar({
  currentTab,
  onTabChange,
  bottomInset,
}: Props) {
  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: bottomInset,
          height: TAB_BAR_HEIGHT + bottomInset,
        },
      ]}>
      {TABS.map((tab) => {
        const isActive = currentTab === tab.id;
        const isCenter = tab.id === 'timeline';

        return (
          <Pressable
            key={tab.id}
            style={styles.tab}
            onPress={() => onTabChange(tab.id)}>
            {isCenter ? (
              <LinearGradient
                colors={['#FF3378', '#9B51E0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.centerButton}>
                <Ionicons
                  name={tab.icon}
                  size={24}
                  color="#FFFFFF"
                />
              </LinearGradient>
            ) : (
              <Ionicons
                name={tab.icon}
                size={24}
                color={
                  isActive
                    ? ResonaraTheme.tabActive
                    : ResonaraTheme.tabInactive
                }
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: ResonaraTheme.tabBar,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: ResonaraTheme.tabBarBorder,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 6,
  },
});