import type { PropsWithChildren } from 'react';
import type { AccessibilityState } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Pressable } from '@/tw';

export type CardProps = PropsWithChildren<{
  onPress?: () => void;
  /** Override the default `backgroundElement` surface — e.g. the Student
   * app's themed `card` surface. */
  backgroundColor?: string;
  className?: string;
  /** Screen-reader summary for a tappable card; without it the children's
   * text is read in order. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: AccessibilityState;
}>;

/**
 * Shared card container: theme surface + `rounded-card` + standard padding,
 * optionally tappable. The base every domain card in `src/components/cards/`
 * builds on — see the card pattern documented in `docs/UI_PATTERNS.md`.
 */
export function Card({
  children,
  onPress,
  backgroundColor,
  className = '',
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
}: CardProps) {
  const theme = useTheme();

  return (
    <Pressable
      className={`gap-2 rounded-card p-4 ${className}`}
      style={{ backgroundColor: backgroundColor ?? theme.backgroundElement }}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
    >
      {children}
    </Pressable>
  );
}
