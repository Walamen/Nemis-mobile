import { Stack } from 'expo-router';

export default function CommunicationLayout() {
  return (
    // headerShown: false — every screen renders its own `AppHeader`, matching
    // the Student app (see `(student)/learning/_layout.tsx`).
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Inbox' }} />
      <Stack.Screen name="messages" options={{ title: 'Messages' }} />
      <Stack.Screen name="conversation/[id]" options={{ title: 'Conversation' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
    </Stack>
  );
}
