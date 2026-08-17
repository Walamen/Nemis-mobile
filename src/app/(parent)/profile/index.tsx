import type { Href } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/buttons/button';
import { MenuList } from '@/components/common/menu-list';
import { Modal } from '@/components/layout/modal';
import { ThemedText } from '@/components/typography/themed-text';
import { useAuth } from '@/hooks/use-auth';
import { Text, View } from '@/tw';
import { getApiErrorMessage } from '@/utils/api-error';

// Cast: these sibling routes aren't in the typed-routes union until the dev server re-scans.
const ACCOUNT_ITEMS = [
  { label: 'Profile', href: '/profile/edit-profile' as Href },
  { label: 'Change Password', href: '/profile/change-password' as Href },
  { label: 'Manage Children', href: '/profile/manage-children' as Href },
];
const PREFERENCES_ITEMS = [
  { label: 'Notification Preferences', href: '/profile/notification-preferences' as Href },
  { label: 'Privacy Settings', href: '/profile/privacy-settings' as Href },
];
const SUPPORT_ITEMS = [
  { label: 'Help & Support', href: '/profile/help-support' as Href },
  { label: 'About', href: '/profile/about' as Href },
];

function SectionCaption({ children }: { children: string }) {
  return (
    <ThemedText type="small" themeColor="textSecondary" className="mb-1 tracking-wide">
      {children}
    </ThemedText>
  );
}

export default function ProfileMenuScreen() {
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
    <SafeAreaView className="flex-1 px-4 pt-4 pb-6">
      <View className="flex-1 gap-5">
        <View className="gap-2">
          <SectionCaption>ACCOUNT</SectionCaption>
          <MenuList items={ACCOUNT_ITEMS} />
        </View>
        <View className="gap-2">
          <SectionCaption>PREFERENCES</SectionCaption>
          <MenuList items={PREFERENCES_ITEMS} />
        </View>
        <View className="gap-2">
          <SectionCaption>SUPPORT</SectionCaption>
          <MenuList items={SUPPORT_ITEMS} />
        </View>
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
    </SafeAreaView>
  );
}
