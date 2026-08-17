import { CreteRound_400Regular, useFonts } from '@expo-google-fonts/crete-round';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as StoreProvider } from 'react-redux';

import { AnimatedSplashOverlay } from '@/components/layout/animated-icon';
import { FullPageLoader } from '@/components/loading/full-page-loader';
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

    if (expectedGroup && currentGroup !== expectedGroup) {
      router.replace('/' as Parameters<typeof router.replace>[0]);
    }
  }, [isAuthenticated, isCheckingSession, user?.role, segments, router]);

  if (isCheckingSession) {
    return <FullPageLoader />;
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
  // `AnimatedSplashOverlay` covers the screen (and hides the native splash)
  // regardless of this — gating `RootNavigator` on it just avoids any
  // fallback-font flash of `Typography.h1`/`h3` text (see `DisplayFontFamily`
  // in `@/theme`) underneath the overlay while it's still fading out.
  // `fontError` fails open rather than blocking the app on a font issue.
  const [fontsLoaded, fontError] = useFonts({ CreteRound_400Regular });

  return (
    // Required root-level wrapper for react-native-gesture-handler (e.g.
    // BottomSheet's swipe-to-dismiss). Modals spawn a separate native root
    // and need their own nested GestureHandlerRootView too — see BottomSheet.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider store={store}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />
          {(fontsLoaded || fontError) && <RootNavigator />}
        </ThemeProvider>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}
