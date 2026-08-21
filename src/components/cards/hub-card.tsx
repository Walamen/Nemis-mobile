import { Image } from 'expo-image';
import type { Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/common/badge';
import { Icon, type IconProps } from '@/components/common/icon';
import { ThemedText } from '@/components/typography/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/theme';
import { Link } from '@/tw';

const CHEVRON_ICON: IconProps['name'] = {
  ios: 'chevron.right',
  android: 'chevron_right',
  web: 'chevron_right',
};

/** Placeholder — the app's existing splash asset, reused rather than
 * shipping unlicensed stock photography. Swap for a real photo (e.g. of
 * the resources/library) whenever one's available. */
const IMAGE_SOURCE = require('@/assets/images/splash-screen.jpg');

export type HubCardProps = {
  icon: IconProps['name'];
  title: string;
  description: string;
  href: Href;
  /** Small pill in the title row (e.g. "2 due") — shown instead of the
   * trailing chevron, matching the reference design's "this row needs
   * attention" treatment. Only pass this from real data (an actual due
   * count), never a placeholder. */
  badge?: string;
  /** Short stat chips below the description (e.g. "94% present") — real,
   * already-fetched figures only. */
  stats?: string[];
  /** Shows a photo strip under the title row, matching the reference
   * design's Resources row. See `IMAGE_SOURCE`. */
  showImage?: boolean;
  /** Overrides the default themed surface (`theme.backgroundElement`) —
   * e.g. the Student app's shared `CardBackgroundColor`. Left unset, this
   * component's Parent-app callers are unaffected. */
  backgroundColor?: string;
  /** Overrides the row icon's tint (default `Palette.secondary`) — e.g. the
   * NEMIS Design reference's Academics hub rows use a lighter accent blue.
   * Left unset, existing callers (Fees, Tasks) are unaffected. */
  iconColor?: string;
};

/**
 * A single row in a section "hub" screen (Academics, Tasks): icon square,
 * title, optional photo strip, description, and a wrap of stat-chip
 * pills, all tappable through to the detail screen. Distinct from
 * `QuickAccessCard`/`QuickActionCard` (dashboard tiles) — this is a
 * full-width descriptive row, not a grid tile. See
 * docs/PRODUCT_DECISIONS.md.
 */
export function HubCard({
  icon,
  title,
  description,
  href,
  badge,
  stats,
  showImage,
  backgroundColor,
  iconColor,
}: HubCardProps) {
  const theme = useTheme();

  return (
    <Link
      href={href}
      style={[styles.container, { backgroundColor: backgroundColor ?? theme.backgroundElement }]}
    >
      <View style={styles.titleRow}>
        <View style={[styles.iconWrap, { backgroundColor: theme.background }]}>
          <Icon name={icon} size="md" color={iconColor ?? Palette.secondary} />
        </View>
        <ThemedText type="smallBold" className="flex-1" numberOfLines={1}>
          {title}
        </ThemedText>
        {badge ? (
          <Badge label={badge} tone="warning" />
        ) : (
          <Icon name={CHEVRON_ICON} size="sm" color={theme.textSecondary} />
        )}
      </View>

      {showImage && <Image source={IMAGE_SOURCE} style={styles.image} contentFit="cover" />}

      <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
        {description}
      </ThemedText>

      {!!stats?.length && (
        <View style={styles.statRow}>
          {stats.map((stat) => (
            <Badge key={stat} label={stat} tone="neutral" />
          ))}
        </View>
      )}
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: 104,
    borderRadius: 12,
    marginTop: 12,
  },
  description: {
    marginTop: 10,
    lineHeight: 19,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
});
