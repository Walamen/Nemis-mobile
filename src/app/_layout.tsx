import { DarkTheme, DefaultTheme, Slot, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { Provider as StoreProvider } from 'react-redux';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { store } from '@/store';

SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: PropsWithChildren) {
  const { isAuthenticated, isCheckingSession } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  // `login` isn't in the typed-routes union until the dev server has generated
  // .expo/types/router.d.ts at least once, so these are cast past that gitignored artifact.
  const isLoginRoute = (segments[0] as string) === 'login';

  useEffect(() => {
    if (isCheckingSession) return;

    if (!isAuthenticated && !isLoginRoute) {
      router.replace('/login' as Parameters<typeof router.replace>[0]);
    } else if (isAuthenticated && isLoginRoute) {
      router.replace('/');
    }
  }, [isAuthenticated, isCheckingSession, isLoginRoute, router]);

  const needsRedirect = (!isAuthenticated && !isLoginRoute) || (isAuthenticated && isLoginRoute);

  if (isCheckingSession || needsRedirect) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return children;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <StoreProvider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AuthGate>
          <Slot />
        </AuthGate>
      </ThemeProvider>
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
