import type { Href } from 'expo-router';

import { MenuList } from '@/components/common/menu-list';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { View } from '@/tw';

// Cast: these sibling routes aren't in the typed-routes union until the dev server re-scans.
const ITEMS = [
  { label: 'Notifications', href: '/communication/notifications' as Href },
  { label: 'Messages', href: '/communication/messages' as Href },
];

export default function CommunicationMenuScreen() {
  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Communication" showBack={false} />
      <View className="flex-1 gap-2 px-4 pt-2">
        <MenuList items={ITEMS} />
      </View>
    </AppScreen>
  );
}
