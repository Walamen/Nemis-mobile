import type { Href } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/buttons/button';
import { MenuList } from '@/components/common/menu-list';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { Modal } from '@/components/layout/modal';
import { ThemedText } from '@/components/typography/themed-text';
import { useAuth } from '@/hooks/use-auth';
import { Text, View } from '@/tw';
import { getApiErrorMessage } from '@/utils/api-error';

// Cast: these sibling routes aren't in the typed-routes union until the dev server re-scans.
const ITEMS = [
  { label: 'Profile', href: '/settings/profile' as Href },
  { label: 'Change Password', href: '/settings/change-password' as Href },
];

export default function SettingsMenuScreen() {
  const { logout, isLoggingOut } = useAuth();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  async function handleLogout() {
    setLogoutError(null);
    try {
      await logout().unwrap();
      setIsConfirmOpen(false);
    } catch (error) {
      setLogoutError(getApiErrorMessage(error));
    }
  }

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Settings" showBack={false} />
      {/* `style={{flex:1}}` alongside `className` as a guaranteed-correct
          fallback for the flex sizing, independent of className resolution. */}
      <View className="justify-between gap-2 px-4 pt-2 pb-6" style={{ flex: 1 }}>
        <View className="gap-2">
          <ThemedText type="small" themeColor="textSecondary" className="mb-1 tracking-wide">
            ACCOUNT
          </ThemedText>
          <MenuList items={ITEMS} />
        </View>
        <View className="items-center gap-3">
          {logoutError && <Text className="text-center text-sm text-red-600">{logoutError}</Text>}
          <Button
            variant="danger"
            label="Log out"
            onPress={() => setIsConfirmOpen(true)}
            className="w-full"
          />
          <ThemedText type="small" themeColor="textSecondary" className="text-center">
            NEMIS · Student & Parent Portal
          </ThemedText>
        </View>
      </View>

      <Modal visible={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Log out?">
        <View className="gap-4">
          <ThemedText themeColor="textSecondary">
            You&apos;ll need to sign in again to access your account.
          </ThemedText>
          <View className="flex-row gap-2">
            <Button
              variant="secondary"
              label="Cancel"
              onPress={() => setIsConfirmOpen(false)}
              className="flex-1"
            />
            <Button
              variant="danger"
              label="Log out"
              onPress={handleLogout}
              isLoading={isLoggingOut}
              className="flex-1"
            />
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}
