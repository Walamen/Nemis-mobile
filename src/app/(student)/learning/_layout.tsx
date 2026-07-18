import { Stack } from 'expo-router';

export default function LearningLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Learning' }} />
      <Stack.Screen name="subjects" options={{ title: 'My Subjects' }} />
      <Stack.Screen name="timetable" options={{ title: 'Timetable' }} />
      <Stack.Screen name="grades" options={{ title: 'Grades' }} />
      <Stack.Screen name="attendance" options={{ title: 'Attendance' }} />
    </Stack>
  );
}
