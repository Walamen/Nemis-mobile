import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    // headerShown: false — see (student)/learning/_layout.tsx for why.
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="change-password" options={{ title: 'Change Password' }} />
    </Stack>
  );
}
