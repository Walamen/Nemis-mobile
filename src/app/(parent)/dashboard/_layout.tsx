import { Stack } from 'expo-router';

export default function DashboardLayout() {
  return (
    // headerShown: false — "index" renders its own DashboardHeader,
    // "my-child" its own AppHeader. See (student)/learning/_layout.tsx for
    // why this pattern is used instead of the native Stack header.
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="my-child" options={{ title: 'My Child' }} />
    </Stack>
  );
}
