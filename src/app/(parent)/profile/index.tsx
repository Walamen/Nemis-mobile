import Constants from 'expo-constants';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { ScrollView } from 'react-native';

import { Button } from '@/components/buttons/button';
import { MenuList, type MenuListItem } from '@/components/common/menu-list';
import { SectionCaption } from '@/components/common/section-caption';
import { AppHeader } from '@/components/layout/app-header';
import { AppScreen } from '@/components/layout/app-screen';
import { Modal } from '@/components/layout/modal';
import { ThemedText } from '@/components/typography/themed-text';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { Text, View } from '@/tw';
import { getApiErrorMessage } from '@/utils/api-error';

// Cast: these sibling routes aren't in the typed-routes union until the dev server re-scans.
const ACCOUNT_ITEMS: MenuListItem[] = [
  { label: 'Edit profile', href: '/profile/edit-profile' as Href },
  { label: 'Change password', href: '/profile/change-password' as Href },
  { label: 'Manage children', href: '/profile/manage-children' as Href },
];
const PREFERENCES_ITEMS: MenuListItem[] = [
  { label: 'Notification preferences', href: '/profile/notification-preferences' as Href },
  // English is the only language the app has (see Language → "Coming soon").
  { label: 'Language', href: '/profile/language' as Href, value: 'English', showChevron: true },
  { label: 'Privacy settings', href: '/profile/privacy-settings' as Href },
];

/**
 * Parent Settings (the `profile` route, reached from the Menu sheet and the
 * dashboard avatar) — the Student Settings layout with the parent's own
 * rows (Manage children, Privacy settings).
 */
export default function ParentSettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { logout, isLoggingOut } = useAuth();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  async function handleLogout() {
    setLogoutError(null);
    try {
      await logout().unwrap();
      setIsConfirmOpen(false);
      // Navigate immediately rather than waiting for `RootNavigator`'s
      // reactive redirect — the confirm `Modal` fades out over ~200ms, during
      // which this screen would otherwise still be showing.
      router.replace('/' as Href);
    } catch (error) {
      setLogoutError(getApiErrorMessage(error));
    }
  }

  const version = Constants.expoConfig?.version;

  return (
    <AppScreen scroll={false} contentClassName="">
      <AppHeader title="Settings" titleAlign="left" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
      >
        <View className="gap-2">
          <SectionCaption>ACCOUNT</SectionCaption>
          <MenuList items={ACCOUNT_ITEMS} backgroundColor={theme.card} />
        </View>

        <View className="mt-5 gap-2">
          <SectionCaption>PREFERENCES</SectionCaption>
          <MenuList items={PREFERENCES_ITEMS} backgroundColor={theme.card} />
        </View>

        <View className="mt-5 gap-2">
          <SectionCaption>SUPPORT</SectionCaption>
          <MenuList
            backgroundColor={theme.card}
            items={[
              { label: 'Help & support', href: '/profile/help-support' as Href },
              {
                label: 'About NEMIS',
                href: '/profile/about' as Href,
                value: version ? `v${version}` : undefined,
              },
            ]}
          />
        </View>

        <View className="mt-6 items-center gap-3">
          {logoutError && <Text className="text-center text-sm text-error">{logoutError}</Text>}
          <Button
            variant="dangerOutline"
            label="Sign out"
            onPress={() => setIsConfirmOpen(true)}
            className="w-full"
          />
          <ThemedText type="small" themeColor="textSecondary" className="text-center">
            National Education Management Information System{'\n'}Ministry of Education · Republic
            of Liberia
          </ThemedText>
        </View>
      </ScrollView>

      <Modal visible={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Sign out?">
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
              label="Sign out"
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
