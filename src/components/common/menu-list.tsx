import type { Href } from 'expo-router';

import { Icon, type IconProps } from '@/components/common/icon';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/theme';
import { Link, Pressable, View } from '@/tw';

export type MenuListItem = {
  label: string;
  href: Href;
  /** Leading icon square — e.g. the Student "Menu" sheet's rows. Omitted
   * entirely (no reserved space) for plain text rows like Settings'
   * "Profile"/"Change Password" list. */
  icon?: IconProps['name'];
  /** Trailing text (e.g. "LRD 4,500 due") shown instead of the default
   * chevron — only pass this from real, already-fetched data. */
  value?: string;
};

export function MenuList({ items }: { items: MenuListItem[] }) {
  const theme = useTheme();

  return (
    <>
      {items.map((item) => (
        // `asChild` hands press/navigation to our own `Pressable` — `Link`
        // renders as a bare `Text` by default, which can't honor
        // `justify-between` (it'd just sit the chevron right after the
        // label instead of pushed to the row's far edge).
        <Link key={item.label} href={item.href} asChild>
          <Pressable
            className="flex-row items-center gap-3 rounded-card px-4 py-4"
            style={{ backgroundColor: theme.backgroundElement }}
          >
            {item.icon && (
              <View
                className="items-center justify-center"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  backgroundColor: theme.background,
                }}
              >
                <Icon name={item.icon} size="md" color={Palette.accent} />
              </View>
            )}
            <ThemedText className="flex-1">{item.label}</ThemedText>
            {item.value ? (
              <ThemedText type="small" themeColor="textSecondary">
                {item.value}
              </ThemedText>
            ) : (
              <Icon
                name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                size="sm"
                color={theme.textSecondary}
              />
            )}
          </Pressable>
        </Link>
      ))}
    </>
  );
}
