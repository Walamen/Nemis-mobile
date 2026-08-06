import type { Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChildSwitcher } from '@/components/common/child-switcher';
import { MenuList } from '@/components/common/menu-list';

// Cast: these sibling routes aren't in the typed-routes union until the dev server re-scans.
const ITEMS = [
  { label: 'Results', href: '/academics/results' as Href },
  { label: 'Attendance', href: '/academics/attendance' as Href },
  { label: 'Assignments', href: '/academics/assignments' as Href },
];

export default function AcademicsMenuScreen() {
  return (
    <SafeAreaView className="flex-1 gap-2 px-4 pt-4">
      <ChildSwitcher />
      <MenuList items={ITEMS} />
    </SafeAreaView>
  );
}
