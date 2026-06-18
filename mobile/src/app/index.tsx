import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabBar, type Tab } from '@/components/bottom-tab-bar';
import { LibraryScreen } from '@/components/library-screen';
import { ListenTogetherView } from '@/components/listen-together-view';
import { MiniPlayer } from '@/components/mini-player';
import { NotificationsScreen } from '@/components/notifications-screen';
import { NowPlayingView } from '@/components/now-playing-view';
import { ProfileScreen } from '@/components/profile-screen';
import { SearchScreen } from '@/components/search-screen';
import { TimelineFeed } from '@/components/timeline-feed';
import { usePlayer } from '@/context/player';
import { useAuth } from '@/context/auth';
import { ResonaraTheme, TAB_BAR_HEIGHT } from '@/constants/theme';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<Tab>('timeline');
  const [showListenTogether, setShowListenTogether] = useState(false);
  const { currentTrack, sessionId, showNowPlaying, closeNowPlaying } = usePlayer();
  const insets = useSafeAreaInsets();

  const miniPlayerHeight = currentTrack ? 62 : 0;
  const bottomInset = TAB_BAR_HEIGHT + insets.bottom + miniPlayerHeight;

  const renderScreen = () => {
    switch (currentTab) {
      case 'timeline':     return <TimelineFeed bottomInset={bottomInset} />;
      case 'search':       return <SearchScreen bottomInset={bottomInset} />;
      case 'library':      return <LibraryScreen bottomInset={bottomInset} />;
      case 'notifications':return <NotificationsScreen bottomInset={bottomInset} />;
      case 'profile':      return <ProfileScreen bottomInset={bottomInset} />;
    }
  };

  return (
    <View style={styles.root}>
      {renderScreen()}

      <View style={[styles.bottomStack, { paddingBottom: insets.bottom }]}>
        <MiniPlayer />
        <BottomTabBar currentTab={currentTab} onTabChange={setCurrentTab} bottomInset={0} />
      </View>

      <Modal visible={showNowPlaying && !!currentTrack} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.modalContainer}>
          {currentTrack && (
            showListenTogether && sessionId ? (
              <ListenTogetherView
                track={currentTrack}
                sessionId={sessionId}
                onBack={() => setShowListenTogether(false)}
                bottomInset={TAB_BAR_HEIGHT + insets.bottom}
              />
            ) : (
              <NowPlayingView
                track={currentTrack}
                sessionId={sessionId}
                onBack={closeNowPlaying}
                onListenTogether={() => setShowListenTogether(true)}
              />
            )
          )}
        </View>
      </Modal>
    </View>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect href="/sign-in" />;
  return <AppContent />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ResonaraTheme.background },
  bottomStack: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  modalContainer: { flex: 1, backgroundColor: ResonaraTheme.background },
});
