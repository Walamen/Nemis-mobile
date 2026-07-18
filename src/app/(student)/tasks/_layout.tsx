import { Stack } from 'expo-router';

export default function TasksLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Tasks' }} />
      <Stack.Screen name="assignments" options={{ title: 'Assignments' }} />
      <Stack.Screen name="resources" options={{ title: 'Resources' }} />
    </Stack>
  );
}
