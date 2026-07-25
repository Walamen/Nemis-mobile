import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { Provider as StoreProvider } from 'react-redux';

import { AnimatedSplashOverlay } from '@/components/layout/animated-icon';
import { ThemedView } from '@/components/common/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { store } from '@/store';

SplashScreen.preventAutoHideAsync();

/**
 * Root ↓ Authentication ↓ Student ↓ Parent. Only the group whose guard is true
 * has its screens mounted into the navigator, so (auth)/(student)/(parent) can
 * each freely own `/` without colliding — the backend only ever authenticates
 * STUDENT or PARENT roles against this app, so no other branch is needed.
 *
 * Stack.Protected only controls which screens are *registered* — it does not
 * force-navigate away from a screen that's already focused when its guard
 * flips false (e.g. staying on the login screen after a successful login).
 * The effect below is the explicit redirect that actually moves the user.
 */
function RootNavigator() {
  const { user, isAuthenticated, isCheckingSession } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isCheckingSession) return;

    const currentGroup = (segments as readonly string[])[0];
    const expectedGroup = !isAuthenticated
      ? '(auth)'
      : user?.role === 'STUDENT'
        ? '(student)'
        : user?.role === 'PARENT'
          ? '(parent)'
          : null;

    // TEMPORARY diagnostic — remove once the redirect is confirmed working
    console.log('[AuthGate]', { isAuthenticated, role: user?.role, currentGroup, expectedGroup });

    if (expectedGroup && currentGroup !== expectedGroup) {
      console.log('[AuthGate] redirecting to /', { from: currentGroup, to: expectedGroup });
      router.replace('/' as Parameters<typeof router.replace>[0]);
    }
  }, [isAuthenticated, isCheckingSession, user?.role, segments, router]);

  if (isCheckingSession) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated && user?.role === 'STUDENT'}>
        <Stack.Screen name="(student)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated && user?.role === 'PARENT'}>
        <Stack.Screen name="(parent)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <StoreProvider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <RootNavigator />
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
