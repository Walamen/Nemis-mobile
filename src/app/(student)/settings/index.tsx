import type { Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/buttons/button';
import { MenuList } from '@/components/common/menu-list';
import { useAuth } from '@/hooks/use-auth';

// Cast: these sibling routes aren't in the typed-routes union until the dev server re-scans.
const ITEMS = [
  { label: 'Profile', href: '/settings/profile' as Href },
  { label: 'Change Password', href: '/settings/change-password' as Href },
];

export default function SettingsMenuScreen() {
  const { logout, isLoggingOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 justify-between gap-2 px-4 pt-4 pb-6">
      <MenuList items={ITEMS} />
      <Button label="Log out" onPress={() => logout()} isLoading={isLoggingOut} />
    </SafeAreaView>
  );
}
