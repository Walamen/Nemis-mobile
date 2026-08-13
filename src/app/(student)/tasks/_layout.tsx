import { Stack } from 'expo-router';

export default function TasksLayout() {
  return (
    // headerShown: false — see (student)/learning/_layout.tsx for why.
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Tasks' }} />
      <Stack.Screen name="assignments" options={{ title: 'Assignments' }} />
      <Stack.Screen name="resources" options={{ title: 'Resources' }} />
    </Stack>
  );
}
