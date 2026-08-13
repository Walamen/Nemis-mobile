import type { Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MenuList } from '@/components/common/menu-list';
import { AppHeader } from '@/components/layout/app-header';
import { View } from '@/tw';

// Cast: these sibling routes aren't in the typed-routes union until the dev server re-scans.
const ITEMS = [
  { label: 'My Subjects', href: '/learning/subjects' as Href },
  { label: 'Timetable', href: '/learning/timetable' as Href },
  { label: 'Grades', href: '/learning/grades' as Href },
  { label: 'Attendance', href: '/learning/attendance' as Href },
];

export default function LearningMenuScreen() {
  return (
    <SafeAreaView className="flex-1">
      {/* Tab root — no back destination, so force the back button off
          rather than relying on router.canGoBack()'s default. */}
      <AppHeader title="Learning" showBack={false} />
      <View className="flex-1 gap-2 px-4 pt-2">
        <MenuList items={ITEMS} />
      </View>
    </SafeAreaView>
  );
}
