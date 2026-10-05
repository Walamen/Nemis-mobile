import type { Href } from 'expo-router';
import { Tabs } from 'expo-router';
import { useState } from 'react';
import { Pressable } from 'react-native';

import { useGetChildFeeRulesStatusQuery } from '@/api/parent/fees-api';
import type { MenuListItem } from '@/components/common/menu-list';
import {
  MENU_ICONS,
  MenuSheet,
  TAB_ICONS,
  tabIcon,
  useRoleTabScreenOptions,
} from '@/components/layout/role-tabs';
import { useSelectedChild } from '@/hooks/use-selected-child';

/**
 * Parent "Menu" sheet — same pattern as the Student app's: Finance, the
 * selected child, Notifications, Settings. Finance shows the selected
 * child's real balance once loaded (and warms the Finance screen's cache).
 */
function ParentMenuSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { selectedChild, selectedChildId } = useSelectedChild();
  const { data: fees } = useGetChildFeeRulesStatusQuery(selectedChildId ?? '', {
    skip: !selectedChildId,
  });

  const items: MenuListItem[] = [
    {
      label: 'Finance',
      href: '/finance' as Href,
      icon: MENU_ICONS.fees,
      value: fees ? `${fees.currency} ${fees.totalBalance.toLocaleString()} due` : undefined,
    },
    {
      label: selectedChild ? `My child · ${selectedChild.firstName}` : 'My child',
      href: '/dashboard/my-child' as Href,
      icon: MENU_ICONS.profile,
    },
    {
      label: 'Notifications',
      href: '/communication/notifications' as Href,
      icon: MENU_ICONS.notifications,
    },
    { label: 'Settings', href: '/profile' as Href, icon: MENU_ICONS.settings },
  ];

  return <MenuSheet visible={visible} onClose={onClose} items={items} />;
}

/**
 * Parent tabs: Home · Academics · Tasks · Inbox · Menu — the Student app's
 * arrangement (`role-tabs.tsx`), pointing at the parent's own routes.
 * Finance and Settings (`profile`) moved from tabs into the Menu sheet;
 * they stay real routes (`href: null`). `index` only redirects `/` (where
 * `RootNavigator` sends every signed-in user) to the dashboard.
 */
export default function ParentTabsLayout() {
  const screenOptions = useRoleTabScreenOptions();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Tabs screenOptions={screenOptions}>
        <Tabs.Screen
          name="dashboard"
          options={{ title: 'Home', tabBarIcon: tabIcon(TAB_ICONS.home) }}
        />
        <Tabs.Screen
          name="academics"
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
            // Opens the sheet instead of navigating (`menu.tsx` is a
            // redirecting fallback). `ref` is dropped — its legacy type won't
            // spread onto a modern `Pressable`.
            tabBarButton: ({ ref: _ref, ...props }) => (
              <Pressable {...props} onPress={() => setMenuOpen(true)} accessibilityLabel="Menu" />
            ),
          }}
        />
        {/* Real, pushable routes reached from the Menu sheet / redirects. */}
        <Tabs.Screen name="finance" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="index" options={{ href: null }} />
      </Tabs>

      <ParentMenuSheet visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
