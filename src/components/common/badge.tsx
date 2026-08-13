import { useTheme } from '@/hooks/use-theme';
import { Palette, Typography } from '@/theme';
import { Text, View } from '@/tw';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'error' | 'info';

const TONE_COLOR: Record<Exclude<BadgeTone, 'neutral'>, string> = {
  success: Palette.success,
  warning: Palette.warning,
  error: Palette.error,
  info: Palette.secondary,
};

/**
 * `rgba(...)` from a `#rrggbb` hex + alpha. `react-native-css` doesn't
 * reliably resolve Tailwind's `bg-color/opacity` modifier for custom
 * `@theme` colors, so tinted backgrounds are built by hand here — matching
 * how the rest of the app already handles translucent color (see the
 * dashboard header's hardcoded `rgba(255,255,255,0.15)` icon buttons).
 */
function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export type BadgeProps = {
  label: string;
  /** `neutral` (default) follows the current theme; the semantic tones use
   * fixed brand colors that are already the same in light and dark mode. */
  tone?: BadgeTone;
  className?: string;
};

/** Small status pill — assignment status, unread counts, etc. */
export function Badge({ label, tone = 'neutral', className = '' }: BadgeProps) {
  const theme = useTheme();
  const color = tone === 'neutral' ? theme.text : TONE_COLOR[tone];
  const background =
    tone === 'neutral' ? theme.backgroundSelected : withAlpha(TONE_COLOR[tone], 0.15);

  return (
    <View
      className={`self-start rounded-full px-2 py-1 ${className}`}
      style={{ backgroundColor: background }}
    >
      <Text style={{ ...Typography.smallBold, color }}>{label}</Text>
    </View>
  );
}
