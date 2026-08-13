import { Stack } from 'expo-router';

export default function LearningLayout() {
  return (
    // headerShown: false — this stack's screens render their own AppHeader
    // (pilot for replacing the native Stack header; see docs/ROADMAP.md).
    // `title` options are kept as route metadata even though unused visually.
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Learning' }} />
      <Stack.Screen name="subjects" options={{ title: 'My Subjects' }} />
      <Stack.Screen name="subject/[id]" options={{ title: 'Subject' }} />
      <Stack.Screen name="timetable" options={{ title: 'Timetable' }} />
      <Stack.Screen name="grades" options={{ title: 'Grades' }} />
      <Stack.Screen name="attendance" options={{ title: 'Attendance' }} />
    </Stack>
  );
}
