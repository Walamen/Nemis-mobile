import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
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
 */
function RootNavigator() {
  const { user, isAuthenticated, isCheckingSession } = useAuth();

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
