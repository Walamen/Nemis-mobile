import { Stack } from 'expo-router';

export default function CommunicationLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Communication' }} />
      <Stack.Screen name="messages" options={{ title: 'Messages' }} />
      <Stack.Screen name="conversation/[id]" options={{ title: 'Conversation' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
    </Stack>
  );
}
