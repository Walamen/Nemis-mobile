import type { Href } from 'expo-router';
import { Tabs } from 'expo-router';
import { useState } from 'react';
import { Pressable } from 'react-native';

import { useGetFeeRulesStatusQuery } from '@/api/fees/fees-api';
import { Icon } from '@/components/common/icon';
import { MenuList, type MenuListItem } from '@/components/common/menu-list';
import { BottomSheet } from '@/components/layout/bottom-sheet';
import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/theme';

/**
 * The Student tab bar's "Menu" tab doesn't navigate anywhere — it opens
 * this sheet instead, matching the NEMIS Design reference's five-tab
 * structure (Home · Academics · Tasks · Inbox · Menu, with Menu a sheet
 * holding Finance/Profile/Notifications/Settings). Fees and Settings
 * remain real routes (`href: null` below keeps them out of the tab bar
 * without removing them), just reached from here instead of their own
 * tab. `useGetFeeRulesStatusQuery` doubles as a cache-warm for the Fees
 * screen it links to, same pattern as every other hub in this app.
 */
function StudentMenuSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { data: feeStatus } = useGetFeeRulesStatusQuery();

  const items: MenuListItem[] = [
    {
      label: 'School fees',
      href: '/fees' as Href,
      icon: { ios: 'creditcard', android: 'credit_card', web: 'credit_card' },
      value: feeStatus
        ? `${feeStatus.currency} ${feeStatus.totalBalance.toLocaleString()} due`
        : undefined,
    },
    {
      label: 'Profile',
      href: '/settings/profile' as Href,
      icon: { ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' },
    },
    {
      label: 'Notifications',
      href: '/communication/notifications' as Href,
      icon: { ios: 'bell', android: 'notifications', web: 'notifications' },
    },
    {
      label: 'Settings',
      href: '/settings' as Href,
      icon: { ios: 'gearshape', android: 'settings', web: 'settings' },
    },
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <MenuList items={items} />
    </BottomSheet>
  );
}

export default function StudentTabsLayout() {
  const theme = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Palette.secondary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarStyle: { backgroundColor: theme.background },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <Icon name={{ ios: 'house', android: 'home', web: 'home' }} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="learning"
          options={{
            title: 'Academics',
            tabBarIcon: ({ color }) => (
              <Icon name={{ ios: 'book', android: 'menu_book', web: 'menu_book' }} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tasks',
            tabBarIcon: ({ color }) => (
              <Icon
                name={{ ios: 'checklist', android: 'checklist', web: 'checklist' }}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="communication"
          options={{
            title: 'Inbox',
            tabBarIcon: ({ color }) => (
              <Icon
                name={{ ios: 'bubble.left.and.bubble.right', android: 'chat', web: 'chat' }}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: 'Menu',
            tabBarIcon: ({ color }) => (
              <Icon
                name={{ ios: 'line.3.horizontal', android: 'menu', web: 'menu' }}
                color={color}
              />
            ),
            // Intercepts the press instead of navigating to the `menu`
            // route — that route only exists as a defensive fallback (see
            // `(student)/menu.tsx`) in case this is ever reached another
            // way (e.g. a stale deep link). `ref` is destructured out and
            // dropped — `BottomTabBarButtonProps`' `ref` is typed as a
            // legacy `LegacyRef<View>`, which TypeScript won't accept when
            // spread onto any modern-typed `Pressable`; the tab bar
            // doesn't need it forwarded for this simple a button.
            tabBarButton: ({ ref: _ref, ...props }) => (
              <Pressable {...props} onPress={() => setMenuOpen(true)} />
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
