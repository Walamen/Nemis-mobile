import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    // headerShown: false — see (student)/learning/_layout.tsx for why.
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
      <Stack.Screen name="my-profile" options={{ title: 'My profile' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="change-password" options={{ title: 'Change Password' }} />
      <Stack.Screen
        name="notification-preferences"
        options={{ title: 'Notification Preferences' }}
      />
      <Stack.Screen name="language" options={{ title: 'Language' }} />
      <Stack.Screen name="help-support" options={{ title: 'Help & Support' }} />
      <Stack.Screen name="about" options={{ title: 'About NEMIS' }} />
      <Stack.Screen name="legal/[doc]" options={{ title: 'Legal' }} />
    </Stack>
  );
}
