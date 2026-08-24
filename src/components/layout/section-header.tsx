import type { Href } from 'expo-router';

import { Icon } from '@/components/common/icon';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Link, Pressable, View } from '@/tw';

export type SectionHeaderProps = {
  title: string;
  /** Renders a trailing "See all ›" link when given a real destination —
   * don't pass one just to fill the slot; several sections (e.g. a
   * dashboard's "Recent Activity") have no fuller screen to link to today. */
  href?: Href;
  actionLabel?: string;
  className?: string;
};

/** Section title + optional trailing "See all" link — the row used above
 * every card group (dashboard sections, list groupings). */
export function SectionHeader({
  title,
  href,
  actionLabel = 'See all',
  className = '',
}: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View className={`mb-2 mt-5 flex-row items-center justify-between ${className}`}>
      <ThemedText type="sectionHeading">{title}</ThemedText>
      {href && (
        // `asChild` hands press/navigation to our own `Pressable` — `Link`
        // renders as a bare `Text` by default, whose inline layout doesn't
        // honor `gap` between the label and chevron.
        <Link href={href} asChild>
          <Pressable className="flex-row items-center gap-0.5">
            <ThemedText type="small" themeColor="textSecondary">
              {actionLabel}
            </ThemedText>
            <Icon
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size="sm"
              color={theme.textSecondary}
            />
          </Pressable>
        </Link>
      )}
    </View>
  );
}
