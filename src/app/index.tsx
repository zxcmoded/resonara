import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabBar, type Tab } from '@/components/bottom-tab-bar';
import { LibraryScreen } from '@/components/library-screen';
import { ListenTogetherView } from '@/components/listen-together-view';
import { MiniPlayer } from '@/components/mini-player';
import { NotificationsScreen } from '@/components/notifications-screen';
import { NowPlayingView } from '@/components/now-playing-view';
import { ProfileScreen } from '@/components/profile-screen';
import { SearchScreen } from '@/components/search-screen';
import { SignInScreen } from '@/components/sign-in-screen';
import { SignUpScreen } from '@/components/sign-up-screen';
import { TimelineFeed } from '@/components/timeline-feed';
import { MOCK_TRACK } from '@/context/player';
import { usePlayer } from '@/context/player';
import { useAuth } from '@/context/auth';
import { ResonaraTheme, TAB_BAR_HEIGHT } from '@/constants/theme';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<Tab>('timeline');
  const [showListenTogether, setShowListenTogether] = useState(false);
  const { currentTrack, isPlaying, showNowPlaying, closeNowPlaying, openNowPlaying } = usePlayer();
  const insets = useSafeAreaInsets();

  const miniPlayerHeight = currentTrack ? 62 : 0;
  const bottomInset = TAB_BAR_HEIGHT + insets.bottom + miniPlayerHeight;

  const renderScreen = () => {
    switch (currentTab) {
      case 'timeline':
        return <TimelineFeed bottomInset={bottomInset} />;
      case 'search':
        return <SearchScreen bottomInset={bottomInset} />;
      case 'library':
        return <LibraryScreen bottomInset={bottomInset} />;
      case 'notifications':
        return <NotificationsScreen bottomInset={bottomInset} />;
      case 'profile':
        return <ProfileScreen bottomInset={bottomInset} />;
    }
  };

  return (
    <View style={styles.root}>
      {renderScreen()}

      {/* Persistent mini player + tab bar stack */}
      <View style={[styles.bottomStack, { paddingBottom: insets.bottom }]}>
        <MiniPlayer />
        <BottomTabBar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          bottomInset={0}
        />
      </View>

      {/* Now Playing full-screen modal */}
      <Modal visible={showNowPlaying} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.modalContainer}>
          {showListenTogether ? (
            <ListenTogetherView
              track={MOCK_TRACK}
              onBack={() => setShowListenTogether(false)}
              bottomInset={TAB_BAR_HEIGHT + insets.bottom}
            />
          ) : (
            <NowPlayingView
              track={MOCK_TRACK}
              onBack={closeNowPlaying}
              onListenTogether={() => setShowListenTogether(true)}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

type AuthScreen = 'signIn' | 'signUp';

function AuthFlow() {
  const [screen, setScreen] = useState<AuthScreen>('signIn');

  if (screen === 'signUp') {
    return <SignUpScreen onNavigateToSignIn={() => setScreen('signIn')} />;
  }
  return <SignInScreen onNavigateToSignUp={() => setScreen('signUp')} />;
}

export default function App() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AppContent /> : <AuthFlow />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ResonaraTheme.background,
  },
  bottomStack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: ResonaraTheme.background,
  },
});
