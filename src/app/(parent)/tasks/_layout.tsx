import { Stack } from 'expo-router';

export default function TasksLayout() {
  return (
    // headerShown: false — every screen renders its own `AppHeader`, matching
    // the Student app (see `(student)/learning/_layout.tsx`).
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Tasks' }} />
      <Stack.Screen name="assignments" options={{ title: 'Assignments' }} />
      <Stack.Screen name="resources" options={{ title: 'Resources' }} />
    </Stack>
  );
}
