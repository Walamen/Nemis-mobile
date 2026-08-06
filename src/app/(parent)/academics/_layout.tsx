import { Stack } from 'expo-router';

export default function AcademicsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Academics' }} />
      <Stack.Screen name="results" options={{ title: 'Results' }} />
      <Stack.Screen name="report-card" options={{ title: 'Report Card' }} />
      <Stack.Screen name="attendance" options={{ title: 'Attendance' }} />
      <Stack.Screen name="assignments" options={{ title: 'Assignments' }} />
    </Stack>
  );
}
