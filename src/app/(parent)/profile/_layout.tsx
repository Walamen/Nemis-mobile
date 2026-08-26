import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Profile' }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="change-password" options={{ title: 'Change Password' }} />
      <Stack.Screen name="manage-children" options={{ title: 'Manage Children' }} />
      <Stack.Screen
        name="notification-preferences"
        options={{ title: 'Notification Preferences' }}
      />
      <Stack.Screen name="privacy-settings" options={{ title: 'Privacy Settings' }} />
      <Stack.Screen name="language" options={{ title: 'Language' }} />
      <Stack.Screen name="help-support" options={{ title: 'Help & Support' }} />
      <Stack.Screen name="about" options={{ title: 'About NEMIS' }} />
      <Stack.Screen name="legal/[doc]" options={{ title: 'Legal' }} />
    </Stack>
  );
}
