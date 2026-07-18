import type { Href } from 'expo-router';

import { Icon } from '@/components/common/icon';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Link } from '@/tw';

export type MenuListItem = {
  label: string;
  href: Href;
};

export function MenuList({ items }: { items: MenuListItem[] }) {
  const theme = useTheme();

  return (
    <>
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex-row items-center justify-between rounded-card px-4 py-4"
          style={{ backgroundColor: theme.backgroundElement }}
        >
          <ThemedText>{item.label}</ThemedText>
          <Icon
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size="sm"
          />
        </Link>
      ))}
    </>
  );
}
