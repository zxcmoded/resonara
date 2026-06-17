import { DarkTheme, ThemeProvider } from 'expo-router';
import { Slot } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider } from '@/context/auth';
import { PlayerProvider } from '@/context/player';

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <AuthProvider>
        <PlayerProvider>
          <AnimatedSplashOverlay />
          <Slot />
        </PlayerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
