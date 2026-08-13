import type { PropsWithChildren } from 'react';

import { useTheme } from '@/hooks/use-theme';
import { Pressable } from '@/tw';

export type CardProps = PropsWithChildren<{
  onPress?: () => void;
  /** Override the default `backgroundElement` surface — e.g. `NotificationCard`
   * switches to `backgroundSelected` for unread items. */
  backgroundColor?: string;
  className?: string;
}>;

/**
 * Shared card container: theme surface + `rounded-card` + standard padding,
 * optionally tappable. The base every domain card in `src/components/cards/`
 * builds on — see the card pattern documented in `docs/UI_PATTERNS.md`.
 */
export function Card({ children, onPress, backgroundColor, className = '' }: CardProps) {
  const theme = useTheme();

  return (
    <Pressable
      className={`gap-2 rounded-card p-4 ${className}`}
      style={{ backgroundColor: backgroundColor ?? theme.backgroundElement }}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      {children}
    </Pressable>
  );
}
