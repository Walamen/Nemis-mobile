import type { ColorValue } from 'react-native';

import { Icon, type IconProps } from '@/components/common/icon';
import { MenuList, type MenuListItem } from '@/components/common/menu-list';
import { BottomSheet } from '@/components/layout/bottom-sheet';
import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/theme';
import { View } from '@/tw';

/**
 * Shared bottom-tab chrome for the Student and Parent apps — same colors,
 * icons and "Menu" sheet pattern (Home · Academics · Tasks · Inbox · Menu),
 * so the two roles can't drift apart visually. Each role's `_layout.tsx`
 * keeps its own routes; only the presentation lives here.
 */

export const TAB_ICONS = {
  home: { ios: 'house', android: 'home', web: 'home' },
  academics: { ios: 'book', android: 'menu_book', web: 'menu_book' },
  tasks: { ios: 'checklist', android: 'checklist', web: 'checklist' },
  inbox: { ios: 'bubble.left.and.bubble.right', android: 'chat', web: 'chat' },
  menu: { ios: 'line.3.horizontal', android: 'menu', web: 'menu' },
} satisfies Record<string, IconProps['name']>;

export const MENU_ICONS = {
  fees: { ios: 'creditcard', android: 'credit_card', web: 'credit_card' },
  profile: { ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' },
  notifications: { ios: 'bell', android: 'notifications', web: 'notifications' },
  settings: { ios: 'gearshape', android: 'settings', web: 'settings' },
} satisfies Record<string, IconProps['name']>;

export function useRoleTabScreenOptions() {
  const theme = useTheme();
  return {
    headerShown: false,
    tabBarActiveTintColor: Palette.secondary,
    tabBarInactiveTintColor: theme.textSecondary,
    tabBarStyle: { backgroundColor: theme.background },
  } as const;
}

export function tabIcon(name: IconProps['name']) {
  function TabIcon({ color }: { color: ColorValue }) {
    return <Icon name={name} color={color} />;
  }
  return TabIcon;
}

/** The sheet the "Menu" tab opens. */
export function MenuSheet({
  visible,
  onClose,
  items,
}: {
  visible: boolean;
  onClose: () => void;
  items: MenuListItem[];
}) {
  const theme = useTheme();
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {/* `MenuList` renders bare rows and relies on its container for
          inter-item spacing. */}
      <View className="gap-2">
        <MenuList items={items} backgroundColor={theme.card} onItemPress={onClose} />
      </View>
    </BottomSheet>
  );
}
