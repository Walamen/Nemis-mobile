import { Stack } from 'expo-router';

export default function CommunicationLayout() {
  return (
    // headerShown: false — see (student)/learning/_layout.tsx for why.
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Communication' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="messages" options={{ title: 'Messages' }} />
      <Stack.Screen name="conversation/[id]" options={{ title: 'Conversation' }} />
    </Stack>
  );
}
