import { Stack } from 'expo-router';

export default function AcademicsLayout() {
  return (
    // headerShown: false — every screen renders its own `AppHeader`, matching
    // the Student app (see `(student)/learning/_layout.tsx`).
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Academics' }} />
      <Stack.Screen name="results" options={{ title: 'Report' }} />
      <Stack.Screen name="report-card" options={{ title: 'Report Card' }} />
      <Stack.Screen name="attendance" options={{ title: 'Attendance' }} />
    </Stack>
  );
}
