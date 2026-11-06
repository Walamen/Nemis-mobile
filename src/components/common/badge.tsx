import { useTheme } from '@/hooks/use-theme';
import { Palette, Typography } from '@/theme';
import { Text, View } from '@/tw';
import { withAlpha } from '@/utils/color';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'error' | 'info';

const TONE_COLOR: Record<Exclude<BadgeTone, 'neutral'>, string> = {
  success: Palette.success,
  warning: Palette.warning,
  error: Palette.error,
  info: Palette.secondary,
};

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
