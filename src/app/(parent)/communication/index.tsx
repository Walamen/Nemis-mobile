import type { Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MenuList } from '@/components/common/menu-list';

// Cast: these sibling routes aren't in the typed-routes union until the dev server re-scans.
const ITEMS = [
  { label: 'Messages', href: '/communication/messages' as Href },
  { label: 'Notifications', href: '/communication/notifications' as Href },
];

export default function CommunicationMenuScreen() {
  return (
    <SafeAreaView className="flex-1 gap-2 px-4 pt-4">
      <MenuList items={ITEMS} />
    </SafeAreaView>
  );
}
