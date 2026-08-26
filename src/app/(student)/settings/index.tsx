import Constants from 'expo-constants';
import type { Href } from 'expo-router';
import { useState } from 'react';
import { ScrollView } from 'react-native';

import { Button } from '@/components/buttons/button';
import { MenuList } from '@/components/common/menu-list';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { Modal } from '@/components/layout/modal';
import { ThemedText } from '@/components/typography/themed-text';
import { useAuth } from '@/hooks/use-auth';
import { CardBackgroundColor } from '@/theme';
import { Text, View } from '@/tw';
import { getApiErrorMessage } from '@/utils/api-error';

// Cast: these sibling routes aren't in the typed-routes union until the dev server re-scans.
const ACCOUNT_ITEMS = [
  { label: 'Profile', href: '/settings/profile' as Href },
  { label: 'Change Password', href: '/settings/change-password' as Href },
];
const PREFERENCES_ITEMS = [
  { label: 'Notification Preferences', href: '/settings/notification-preferences' as Href },
  { label: 'Language', href: '/settings/language' as Href },
];

function SectionCaption({ children }: { children: string }) {
  return (
    <ThemedText type="small" themeColor="textSecondary" className="mb-1 tracking-wide">
      {children}
    </ThemedText>
  );
}

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

  const version = Constants.expoConfig?.version;

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Settings" showBack={false} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
      >
        <View className="gap-2">
          <SectionCaption>ACCOUNT</SectionCaption>
          <MenuList items={ACCOUNT_ITEMS} backgroundColor={CardBackgroundColor} />
        </View>

        <View className="mt-5 gap-2">
          <SectionCaption>PREFERENCES</SectionCaption>
          <MenuList items={PREFERENCES_ITEMS} backgroundColor={CardBackgroundColor} />
        </View>

        <View className="mt-5 gap-2">
          <SectionCaption>SUPPORT</SectionCaption>
          <MenuList
            backgroundColor={CardBackgroundColor}
            items={[
              { label: 'Help & Support', href: '/settings/help-support' as Href },
              {
                label: 'About NEMIS',
                href: '/settings/about' as Href,
                value: version ? `v${version}` : undefined,
              },
            ]}
          />
        </View>

        <View className="mt-6 items-center gap-3">
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
      </ScrollView>

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
