import type { Href } from 'expo-router';
import { Tabs } from 'expo-router';
import { useState } from 'react';
import { Pressable } from 'react-native';

import { useGetFeeRulesStatusQuery } from '@/api/fees/fees-api';
import type { MenuListItem } from '@/components/common/menu-list';
import {
  MENU_ICONS,
  MenuSheet,
  TAB_ICONS,
  tabIcon,
  useRoleTabScreenOptions,
} from '@/components/layout/role-tabs';

/**
 * The Student tab bar's "Menu" tab doesn't navigate anywhere — it opens
 * this sheet instead (Home · Academics · Tasks · Inbox · Menu, with Menu
 * holding Finance/Profile/Notifications/Settings). Fees and Settings remain
 * real routes (`href: null` keeps them out of the tab bar). The fee query
 * doubles as a cache-warm for the Fees screen it links to.
 */
function StudentMenuSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { data: feeStatus } = useGetFeeRulesStatusQuery();

  const items: MenuListItem[] = [
    {
      label: 'School fees',
      href: '/fees' as Href,
      icon: MENU_ICONS.fees,
      value: feeStatus
        ? `${feeStatus.currency} ${feeStatus.totalBalance.toLocaleString()} due`
        : undefined,
    },
    { label: 'Profile', href: '/settings/my-profile' as Href, icon: MENU_ICONS.profile },
    {
      label: 'Notifications',
      href: '/communication/notifications' as Href,
      icon: MENU_ICONS.notifications,
    },
    { label: 'Settings', href: '/settings' as Href, icon: MENU_ICONS.settings },
  ];

  return <MenuSheet visible={visible} onClose={onClose} items={items} />;
}

export default function StudentTabsLayout() {
  const screenOptions = useRoleTabScreenOptions();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Tabs screenOptions={screenOptions}>
        <Tabs.Screen
          name="index"
          options={{ title: 'Home', tabBarIcon: tabIcon(TAB_ICONS.home) }}
        />
        <Tabs.Screen
          name="learning"
          options={{ title: 'Academics', tabBarIcon: tabIcon(TAB_ICONS.academics) }}
        />
        <Tabs.Screen
          name="tasks"
          options={{ title: 'Tasks', tabBarIcon: tabIcon(TAB_ICONS.tasks) }}
        />
        <Tabs.Screen
          name="communication"
          options={{ title: 'Inbox', tabBarIcon: tabIcon(TAB_ICONS.inbox) }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: 'Menu',
            tabBarIcon: tabIcon(TAB_ICONS.menu),
            // Opens the sheet instead of navigating to the `menu` route,
            // which only exists as a redirecting fallback (`menu.tsx`).
            // `ref` is dropped — its legacy `LegacyRef<View>` type won't
            // spread onto a modern `Pressable`.
            tabBarButton: ({ ref: _ref, ...props }) => (
              <Pressable {...props} onPress={() => setMenuOpen(true)} accessibilityLabel="Menu" />
            ),
          }}
        />
        {/* Still real, pushable routes — just no longer their own tab. */}
        <Tabs.Screen name="fees" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
      </Tabs>

      <StudentMenuSheet visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
