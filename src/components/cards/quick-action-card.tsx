import type { Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Icon, type IconProps } from '@/components/common/icon';
import { ThemedText } from '@/components/typography/themed-text';
import { Link } from '@/tw';

export type QuickActionCardProps = {
  label: string;
  href: Href;
  icon: IconProps['name'];
  /** Tile background — a pastel tint per action, not the `Palette` ramp;
   * deliberate per the app mockup (see docs/UI_PATTERNS.md §10). */
  bg: string;
  /** Icon tint, paired with `bg`. */
  tint: string;
};

/** Single tile in a dashboard's "Quick Actions" grid: icon in a white
 * circle over a pastel-tinted background + label, linking straight to a
 * route. Used by both the student and parent dashboards. */
export function QuickActionCard({ label, href, icon, bg, tint }: QuickActionCardProps) {
  return (
    <Link href={href} style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size="md" color={tint} />
      </View>
      <ThemedText type="smallBold">{label}</ThemedText>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '31%',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
