import type { Href } from 'expo-router';

import { MenuList } from '@/components/common/menu-list';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { View } from '@/tw';

// Cast: these sibling routes aren't in the typed-routes union until the dev server re-scans.
const ITEMS = [
  { label: 'Assignments', href: '/tasks/assignments' as Href },
  { label: 'Resources', href: '/tasks/resources' as Href },
];

export default function TasksMenuScreen() {
  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Tasks" showBack={false} />
      <View className="flex-1 gap-2 px-4 pt-2">
        <MenuList items={ITEMS} />
      </View>
    </AppScreen>
  );
}
