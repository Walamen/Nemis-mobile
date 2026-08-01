import type { Href } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/buttons/button';
import { MenuList } from '@/components/common/menu-list';
import { useAuth } from '@/hooks/use-auth';
import { Text } from '@/tw';
import { getApiErrorMessage } from '@/utils/api-error';

// Cast: these sibling routes aren't in the typed-routes union until the dev server re-scans.
const ITEMS = [
  { label: 'Profile', href: '/settings/profile' as Href },
  { label: 'Change Password', href: '/settings/change-password' as Href },
];

export default function SettingsMenuScreen() {
  const { logout, isLoggingOut } = useAuth();
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function handleLogout() {
    setLogoutError(null);
    try {
      await logout().unwrap();
    } catch (error) {
      setLogoutError(getApiErrorMessage(error));
    }
  }

  return (
    <SafeAreaView className="flex-1 justify-between gap-2 px-4 pt-4 pb-6">
      <MenuList items={ITEMS} />
      <>
        {logoutError && (
          <Text className="mb-2 text-center text-sm text-red-600">{logoutError}</Text>
        )}
        <Button
          className="bg-red-500"
          label="Log out"
          onPress={handleLogout}
          isLoading={isLoggingOut}
        />
      </>
    </SafeAreaView>
  );
}
